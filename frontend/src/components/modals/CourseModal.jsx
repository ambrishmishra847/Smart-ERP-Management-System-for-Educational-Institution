import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const CourseModal = ({ initial, onClose, onSave }) => {
  const [courseName, setCourseName] = useState('');
  const [duration, setDuration] = useState('');
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();
  const isEdit = !!initial;

  useEffect(() => {
    if (initial) {
      setCourseName(initial.courseName || '');
      setDuration(initial.duration || '');
    }
  }, [initial]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit) {
        await api.put(`/courses/${initial._id}`, { courseName, duration });
        addToast('Course updated', 'success');
      } else {
        await api.post('/courses', { courseName, duration });
        addToast('Course created', 'success');
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
          <h2 className="text-lg font-semibold text-slate-800">{isEdit ? 'Edit Course' : 'Add Course'}</h2>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"><FiX className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Course Name</label>
            <input type="text" value={courseName} onChange={(e) => setCourseName(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-500 outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Duration</label>
            <input type="text" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="e.g. 3 years" className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-500 outline-none" required />
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

export default CourseModal;
