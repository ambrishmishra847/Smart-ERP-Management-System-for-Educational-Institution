import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { TableSkeleton } from '../../components/LoadingSkeleton';
import { getUser } from '../../services/auth';

const StudentAttendance = () => {
  const user = getUser();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const studentId = user?.profile?._id;

  useEffect(() => {
    const fetchAttendance = async () => {
      if (!studentId) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.get(`/attendance/student/${studentId}`);
        setList(Array.isArray(data) ? data : []);
      } catch {
        setList([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, [studentId]);

  if (loading) return <TableSkeleton rows={8} />;

  const present = list.filter((a) => a.status === 'present').length;
  const pct = list.length ? Math.round((present / list.length) * 100) : 0;

  return (
    <div className="space-y-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-slate-600">Your attendance: <span className="font-semibold text-slate-800">{pct}%</span> ({present}/{list.length} present)</p>
      </motion.div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Subject</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Date</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Status</th>
            </tr>
          </thead>
          <tbody>
            {list.map((a) => (
              <tr key={a._id} className="border-b border-slate-100">
                <td className="py-3 px-4 text-slate-800">{a.subjectId?.subjectName}</td>
                <td className="py-3 px-4 text-slate-600">{new Date(a.date).toLocaleDateString()}</td>
                <td className="py-3 px-4"><span className={`px-2 py-0.5 rounded text-xs ${a.status === 'present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{a.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && <div className="py-12 text-center text-slate-500">No attendance records.</div>}
      </motion.div>
    </div>
  );
};

export default StudentAttendance;
