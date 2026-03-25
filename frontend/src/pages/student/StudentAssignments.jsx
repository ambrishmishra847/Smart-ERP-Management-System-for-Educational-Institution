import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { TableSkeleton } from '../../components/LoadingSkeleton';
import SubmitModal from '../../components/modals/SubmitModal';
import { getUser } from '../../services/auth';

const StudentAssignments = () => {
  const user = getUser();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitModal, setSubmitModal] = useState(null);
  const studentId = user?.profile?._id;

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const { data } = await api.get('/assignments');
        setList(Array.isArray(data) ? data : []);
      } catch {
        setList([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignments();
  }, []);

  if (loading) return <TableSkeleton rows={5} />;

  return (
    <div className="space-y-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Title</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Subject</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Deadline</th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Action</th>
            </tr>
          </thead>
          <tbody>
            {list.map((a) => (
              <tr key={a._id} className="border-b border-slate-100 hover:bg-slate-50/50">
                <td className="py-3 px-4 text-slate-800">{a.title}</td>
                <td className="py-3 px-4 text-slate-600">{a.subject?.subjectName}</td>
                <td className="py-3 px-4 text-slate-600">{new Date(a.deadline).toLocaleDateString()}</td>
                <td className="py-3 px-4 text-right">
                  <button type="button" onClick={() => setSubmitModal({ assignmentId: a._id, title: a.title })} className="text-sm text-primary-600 hover:underline">Submit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && <div className="py-12 text-center text-slate-500">No assignments.</div>}
      </motion.div>
      {submitModal && <SubmitModal studentId={studentId} assignmentId={submitModal.assignmentId} title={submitModal.title} onClose={() => setSubmitModal(null)} onSave={() => setSubmitModal(null)} />}
    </div>
  );
};

export default StudentAssignments;
