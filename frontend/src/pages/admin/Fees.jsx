import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { TableSkeleton } from '../../components/LoadingSkeleton';
import { useToast } from '../../context/ToastContext';

const Fees = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    api.get('/fees')
      .then(({ data }) => setList(data))
      .catch(() => { addToast('Failed to load', 'error'); setList([]); })
      .finally(() => setLoading(false));
  }, [addToast]);

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/fees/${id}`, { status });
      setList((prev) => prev.map((f) => (f._id === id ? { ...f, status } : f)));
      addToast('Fee updated', 'success');
    } catch (e) {
      addToast(e.response?.data?.message || 'Update failed', 'error');
    }
  };

  if (loading) return <TableSkeleton rows={8} />;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
      <table className="w-full">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Student</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Amount</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Status</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Due Date</th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {list.map((f) => (
            <tr key={f._id} className="border-b border-slate-100 hover:bg-slate-50/50">
              <td className="py-3 px-4 text-slate-800">{f.studentId?.userId?.name || f.studentId?._id}</td>
              <td className="py-3 px-4 text-slate-600">{f.amount}</td>
              <td className="py-3 px-4">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                  f.status === 'paid' ? 'bg-green-100 text-green-700' : f.status === 'overdue' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                }`}>{f.status}</span>
              </td>
              <td className="py-3 px-4 text-slate-600">{f.dueDate ? new Date(f.dueDate).toLocaleDateString() : '-'}</td>
              <td className="py-3 px-4 text-right">
                {f.status !== 'paid' && (
                  <button type="button" onClick={() => handleStatusChange(f._id, 'paid')} className="text-sm text-primary-600 hover:underline">Mark paid</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {list.length === 0 && <div className="py-12 text-center text-slate-500">No fee records.</div>}
    </motion.div>
  );
};

export default Fees;
