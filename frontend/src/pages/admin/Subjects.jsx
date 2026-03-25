import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import api from '../../services/api';
import { TableSkeleton } from '../../components/LoadingSkeleton';
import { useToast } from '../../context/ToastContext';
import SubjectModal from '../../components/modals/SubjectModal';

const Subjects = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const { addToast } = useToast();

  const fetch = async () => {
    try {
      const [subj, cour, teach] = await Promise.all([
        api.get('/subjects'),
        api.get('/courses'),
        api.get('/teachers'),
      ]);
      setList(subj.data);
      setCourses(cour.data);
      setTeachers(teach.data);
    } catch (e) {
      addToast('Failed to load', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this subject?')) return;
    try {
      await api.delete(`/subjects/${id}`);
      addToast('Subject deleted', 'success');
      fetch();
    } catch (e) {
      addToast(e.response?.data?.message || 'Delete failed', 'error');
    }
  };

  if (loading) return <TableSkeleton rows={5} />;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button type="button" onClick={() => { setEditing(null); setModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700">
          <FiPlus className="w-5 h-5" /> Add Subject
        </button>
      </div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Subject</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Course</th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((s) => (
              <tr key={s._id} className="border-b border-slate-100 hover:bg-slate-50/50">
                <td className="py-3 px-4 text-slate-800">{s.subjectName}</td>
                <td className="py-3 px-4 text-slate-600">{s.courseId?.courseName}</td>
                <td className="py-3 px-4 text-right">
                  <button type="button" onClick={() => { setEditing(s); setModalOpen(true); }} className="p-2 text-slate-500 hover:text-primary-600"><FiEdit2 className="w-4 h-4" /></button>
                  <button type="button" onClick={() => handleDelete(s._id)} className="p-2 text-slate-500 hover:text-red-600"><FiTrash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && <div className="py-12 text-center text-slate-500">No subjects yet.</div>}
      </motion.div>
      {modalOpen && <SubjectModal courses={courses} teachers={teachers} initial={editing} onClose={() => { setModalOpen(false); setEditing(null); }} onSave={() => { setModalOpen(false); setEditing(null); fetch(); }} />}
    </div>
  );
};

export default Subjects;
