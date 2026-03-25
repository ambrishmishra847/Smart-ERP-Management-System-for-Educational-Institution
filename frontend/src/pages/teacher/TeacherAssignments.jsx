import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiPlus } from 'react-icons/fi';
import api from '../../services/api';
import { TableSkeleton } from '../../components/LoadingSkeleton';
import AssignmentModal from '../../components/modals/AssignmentModal';
import { getUser } from '../../services/auth';

const TeacherAssignments = () => {
  const user = getUser();
  const [list, setList] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const teacherId = user?.profile?._id;

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const { data } = await api.get('/subjects');
        setSubjects(Array.isArray(data) ? data : []);
      } catch {
        setSubjects([]);
      }
    };
    fetchSubjects();
  }, []);

  useEffect(() => {
    const fetchAssignments = async () => {
      if (!teacherId) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.get('/assignments', { params: { teacherId } });
        setList(Array.isArray(data) ? data : []);
      } catch {
        setList([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignments();
  }, [teacherId]);

  const onSave = async () => {
    setModalOpen(false);
    if (!teacherId) return;
    try {
      const { data } = await api.get('/assignments', { params: { teacherId } });
      setList(Array.isArray(data) ? data : []);
    } catch {
      setList([]);
    }
  };

  if (loading) return <TableSkeleton rows={5} />;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button type="button" onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700">
          <FiPlus className="w-5 h-5" /> Add Assignment
        </button>
      </div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Title</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Subject</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Deadline</th>
            </tr>
          </thead>
          <tbody>
            {list.map((a) => (
              <tr key={a._id} className="border-b border-slate-100 hover:bg-slate-50/50">
                <td className="py-3 px-4 text-slate-800">{a.title}</td>
                <td className="py-3 px-4 text-slate-600">{a.subject?.subjectName}</td>
                <td className="py-3 px-4 text-slate-600">{new Date(a.deadline).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && <div className="py-12 text-center text-slate-500">No assignments yet.</div>}
      </motion.div>
      {modalOpen && <AssignmentModal teacherId={teacherId} subjects={subjects} onClose={() => setModalOpen(false)} onSave={onSave} />}
    </div>
  );
};

export default TeacherAssignments;
