import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { TableSkeleton } from '../../components/LoadingSkeleton';
import { getUser } from '../../services/auth';

const StudentFees = () => {
  const user = getUser();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const studentId = user?.profile?._id;

  useEffect(() => {
    const fetchFees = async () => {
      if (!studentId) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.get('/fees', { params: { studentId } });
        setList(Array.isArray(data) ? data : []);
      } catch {
        setList([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFees();
  }, [studentId]);

  if (loading) return <TableSkeleton rows={5} />;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
      <table className="w-full">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Amount</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Status</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Due Date</th>
          </tr>
        </thead>
        <tbody>
          {list.map((f) => (
            <tr key={f._id} className="border-b border-slate-100 hover:bg-slate-50/50">
              <td className="py-3 px-4 text-slate-800">{f.amount}</td>
              <td className="py-3 px-4">
                <span className={`px-2 py-0.5 rounded text-xs ${f.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{f.status}</span>
              </td>
              <td className="py-3 px-4 text-slate-600">{f.dueDate ? new Date(f.dueDate).toLocaleDateString() : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {list.length === 0 && <div className="py-12 text-center text-slate-500">No fee records.</div>}
    </motion.div>
  );
};

export default StudentFees;
