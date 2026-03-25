import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { TableSkeleton } from '../../components/LoadingSkeleton';

const StudentMaterials = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const { data } = await api.get('/study-materials');
        setList(Array.isArray(data) ? data : []);
      } catch {
        setList([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMaterials();
  }, []);

  if (loading) return <TableSkeleton rows={5} />;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
      <table className="w-full">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Title</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Subject</th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Download</th>
          </tr>
        </thead>
        <tbody>
          {list.map((m) => (
            <tr key={m._id} className="border-b border-slate-100 hover:bg-slate-50/50">
              <td className="py-3 px-4 text-slate-800">{m.title}</td>
              <td className="py-3 px-4 text-slate-600">{m.subjectId?.subjectName}</td>
              <td className="py-3 px-4 text-right">
                <a href={m.fileUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">Open</a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {list.length === 0 && <div className="py-12 text-center text-slate-500">No study materials.</div>}
    </motion.div>
  );
};

export default StudentMaterials;
