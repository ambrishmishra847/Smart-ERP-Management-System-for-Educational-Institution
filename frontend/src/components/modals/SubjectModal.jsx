import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const SubjectModal = ({ courses, teachers, initial, onClose, onSave }) => {
  const [subjectName, setSubjectName] = useState('');
  const [courseId, setCourseId] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();
  const isEdit = !!initial;

  useEffect(() => {
    if (initial) {
      setSubjectName(initial.subjectName || '');
      setCourseId(initial.courseId?._id || initial.courseId || '');
      setTeacherId(initial.teacherId?._id || initial.teacherId || '');
    }
  }, [initial]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { subjectName, courseId, teacherId: teacherId || undefined };
      if (isEdit) {
        await api.put(`/subjects/${initial._id}`, payload);
        addToast('Subject updated', 'success');
      } else {
        await api.post('/subjects', payload);
        addToast('Subject created', 'success');
      }
      onSave();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to save', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800">{isEdit ? 'Edit Subject' : 'Add Subject'}</h2>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"><FiX className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Subject Name</label>
            <input type="text" value={subjectName} onChange={(e) => setSubjectName(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-500 outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Course</label>
            <select value={courseId} onChange={(e) => setCourseId(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-500 outline-none" required>
              <option value="">Select course</option>
              {courses.map((c) => <option key={c._id} value={c._id}>{c.courseName}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Teacher (optional)</label>
            <select value={teacherId} onChange={(e) => setTeacherId(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-500 outline-none">
              <option value="">None</option>
              {teachers.map((t) => <option key={t._id} value={t._id}>{t.userId?.name}</option>)}
            </select>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default SubjectModal;
