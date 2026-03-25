import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiPlus } from 'react-icons/fi';
import api from '../../services/api';
import { TableSkeleton } from '../../components/LoadingSkeleton';
import MaterialModal from '../../components/modals/MaterialModal';
import { getUser } from '../../services/auth';

const TeacherMaterials = () => {
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
    const fetchMaterials = async () => {
      if (!teacherId) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.get('/study-materials', { params: { teacherId } });
        setList(Array.isArray(data) ? data : []);
      } catch {
        setList([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMaterials();
  }, [teacherId]);

  const onSave = async () => {
    setModalOpen(false);
    if (!teacherId) return;
    try {
      const { data } = await api.get('/study-materials', { params: { teacherId } });
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
          <FiPlus className="w-5 h-5" /> Upload Material
        </button>
      </div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Title</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Subject</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Link</th>
            </tr>
          </thead>
          <tbody>
            {list.map((m) => (
              <tr key={m._id} className="border-b border-slate-100 hover:bg-slate-50/50">
                <td className="py-3 px-4 text-slate-800">{m.title}</td>
                <td className="py-3 px-4 text-slate-600">{m.subjectId?.subjectName}</td>
                <td className="py-3 px-4"><a href={m.fileUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">Open</a></td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && <div className="py-12 text-center text-slate-500">No study materials yet.</div>}
      </motion.div>
      {modalOpen && <MaterialModal teacherId={teacherId} subjects={subjects} onClose={() => setModalOpen(false)} onSave={onSave} />}
    </div>
  );
};

export default TeacherMaterials;
