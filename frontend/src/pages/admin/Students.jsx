import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import api from '../../services/api';
import { TableSkeleton } from '../../components/LoadingSkeleton';
import { useToast } from '../../context/ToastContext';
import StudentModal from '../../components/modals/StudentModal';

const Students = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [courses, setCourses] = useState([]);
  const { addToast } = useToast();

  const fetchStudents = async () => {
    try {
      const { data } = await api.get('/students');
      setList(data);
    } catch (e) {
      addToast('Failed to load students', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const { data } = await api.get('/courses');
      setCourses(data);
    } catch (e) {}
  };

  useEffect(() => {
    fetchStudents();
    fetchCourses();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this student?')) return;
    try {
      await api.delete(`/students/${id}`);
      addToast('Student deleted', 'success');
      fetchStudents();
    } catch (e) {
      addToast(e.response?.data?.message || 'Delete failed', 'error');
    }
  };

  const handleSave = () => {
    setModalOpen(false);
    setEditing(null);
    fetchStudents();
  };

  if (loading) return <TableSkeleton rows={8} />;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => { setEditing(null); setModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700"
        >
          <FiPlus className="w-5 h-5" /> Add Student
        </button>
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Name</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Email</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Enrollment</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Course</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Semester</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Section</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((s) => (
                <tr key={s._id} className="border-b border-slate-100 hover:bg-slate-50/50">
                  <td className="py-3 px-4 text-slate-800">{s.userId?.name}</td>
                  <td className="py-3 px-4 text-slate-600">{s.userId?.email}</td>
                  <td className="py-3 px-4 text-slate-600">{s.enrollmentNumber}</td>
                  <td className="py-3 px-4 text-slate-600">{s.course?.courseName}</td>
                  <td className="py-3 px-4 text-slate-600">{s.semester}</td>
                  <td className="py-3 px-4 text-slate-600">{s.section}</td>
                  <td className="py-3 px-4 text-right">
                    <button type="button" onClick={() => { setEditing(s); setModalOpen(true); }} className="p-2 text-slate-500 hover:text-primary-600">
                      <FiEdit2 className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={() => handleDelete(s._id)} className="p-2 text-slate-500 hover:text-red-600">
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {list.length === 0 && (
          <div className="py-12 text-center text-slate-500">No students yet. Add one to get started.</div>
        )}
      </motion.div>
      {modalOpen && (
        <StudentModal
          courses={courses}
          initial={editing}
          onClose={() => { setModalOpen(false); setEditing(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default Students;
