import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { TableSkeleton } from '../../components/LoadingSkeleton';
import { getUser } from '../../services/auth';

const StudentResults = () => {
  const user = getUser();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const studentId = user?.profile?._id;

  useEffect(() => {
    const fetchResults = async () => {
      if (!studentId) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.get('/results', { params: { studentId } });
        setList(Array.isArray(data) ? data : []);
      } catch {
        setList([]);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [studentId]);

  if (loading) return <TableSkeleton rows={5} />;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
      <table className="w-full">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Subject</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Marks</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Term</th>
          </tr>
        </thead>
        <tbody>
          {list.map((r) => (
            <tr key={r._id} className="border-b border-slate-100 hover:bg-slate-50/50">
              <td className="py-3 px-4 text-slate-800">{r.subjectId?.subjectName}</td>
              <td className="py-3 px-4 text-slate-600">{r.marks}</td>
              <td className="py-3 px-4 text-slate-600">{r.term || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {list.length === 0 && <div className="py-12 text-center text-slate-500">No results yet.</div>}
    </motion.div>
  );
};

export default StudentResults;
