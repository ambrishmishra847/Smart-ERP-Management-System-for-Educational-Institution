import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const TeacherModal = ({ subjects, initial, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('');
  const [subjectIds, setSubjectIds] = useState([]);
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();
  const isEdit = !!initial;

  useEffect(() => {
    if (initial) {
      setName(initial.userId?.name || '');
      setEmail(initial.userId?.email || '');
      setDepartment(initial.department || '');
      setSubjectIds(initial.subjects?.map((s) => s._id || s) || []);
    }
  }, [initial]);

  const toggleSubject = (id) => {
    setSubjectIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit) {
        await api.put(`/teachers/${initial._id}`, { name, email, department, subjects: subjectIds });
        addToast('Teacher updated', 'success');
      } else {
        if (!password || password.length < 6) {
          addToast('Password must be at least 6 characters', 'error');
          setSaving(false);
          return;
        }
        await api.post('/teachers', { name, email, password, department, subjects: subjectIds });
        addToast('Teacher created', 'success');
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
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800">{isEdit ? 'Edit Teacher' : 'Add Teacher'}</h2>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"><FiX className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-500 outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-500 outline-none" required disabled={isEdit} />
          </div>
          {!isEdit && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-500 outline-none" minLength={6} />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
            <input type="text" value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Subjects</label>
            <div className="flex flex-wrap gap-2">
              {subjects.map((s) => (
                <label key={s._id} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={subjectIds.includes(s._id)} onChange={() => toggleSubject(s._id)} className="rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
                  <span className="text-sm text-slate-700">{s.subjectName}</span>
                </label>
              ))}
            </div>
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

export default TeacherModal;
