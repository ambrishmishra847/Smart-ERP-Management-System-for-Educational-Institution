import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import api from '../../services/api';
import { TableSkeleton } from '../../components/LoadingSkeleton';
import { useToast } from '../../context/ToastContext';
import TeacherModal from '../../components/modals/TeacherModal';

const Teachers = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const { addToast } = useToast();

  const fetchTeachers = async () => {
    try {
      const { data } = await api.get('/teachers');
      setList(data);
    } catch (e) {
      addToast('Failed to load teachers', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
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

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this teacher?')) return;
    try {
      await api.delete(`/teachers/${id}`);
      addToast('Teacher deleted', 'success');
      fetchTeachers();
    } catch (e) {
      addToast(e.response?.data?.message || 'Delete failed', 'error');
    }
  };

  if (loading) return <TableSkeleton rows={8} />;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button type="button" onClick={() => { setEditing(null); setModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700">
          <FiPlus className="w-5 h-5" /> Add Teacher
        </button>
      </div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Name</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Email</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Department</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((t) => (
                <tr key={t._id} className="border-b border-slate-100 hover:bg-slate-50/50">
                  <td className="py-3 px-4 text-slate-800">{t.userId?.name}</td>
                  <td className="py-3 px-4 text-slate-600">{t.userId?.email}</td>
                  <td className="py-3 px-4 text-slate-600">{t.department}</td>
                  <td className="py-3 px-4 text-right">
                    <button type="button" onClick={() => { setEditing(t); setModalOpen(true); }} className="p-2 text-slate-500 hover:text-primary-600"><FiEdit2 className="w-4 h-4" /></button>
                    <button type="button" onClick={() => handleDelete(t._id)} className="p-2 text-slate-500 hover:text-red-600"><FiTrash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {list.length === 0 && <div className="py-12 text-center text-slate-500">No teachers yet.</div>}
      </motion.div>
      {modalOpen && <TeacherModal subjects={subjects} initial={editing} onClose={() => { setModalOpen(false); setEditing(null); }} onSave={() => { setModalOpen(false); setEditing(null); fetchTeachers(); }} />}
    </div>
  );
};

export default Teachers;
