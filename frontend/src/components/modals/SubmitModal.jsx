import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const SubmitModal = ({ studentId, assignmentId, title, onClose, onSave }) => {
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!studentId || !assignmentId) return;
    if (!file) {
      addToast('Please select a file', 'error');
      return;
    }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('assignmentId', assignmentId);
      formData.append('studentId', studentId);
      formData.append('file', file);
      await api.post('/submissions', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      addToast('Submission uploaded', 'success');
      onSave();
    } catch (err) {
      addToast(err.response?.data?.message || 'Upload failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800">Submit: {title}</h2>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"><FiX className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">File (PDF/DOC/Image)</label>
            <input type="file" accept=".pdf,.doc,.docx,image/*" onChange={(e) => setFile(e.target.files?.[0])} className="w-full px-3 py-2 rounded-lg border border-slate-300" required />
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50">{saving ? 'Uploading...' : 'Submit'}</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default SubmitModal;
