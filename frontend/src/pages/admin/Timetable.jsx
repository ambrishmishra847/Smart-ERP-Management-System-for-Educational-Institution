import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { TableSkeleton } from '../../components/LoadingSkeleton';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const SLOTS = [1, 2, 3, 4, 5, 6];

const Timetable = () => {
  const [slots, setSlots] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ courseId: '', semester: '', section: '' });
  const [modalOpen, setModalOpen] = useState(false);
  const [activeCell, setActiveCell] = useState(null); // { dayOfWeek, slot, existing? }
  const [form, setForm] = useState({
    dayOfWeek: 1,
    slot: 1,
    subjectId: '',
    teacherId: '',
    startTime: '',
    endTime: '',
    classroom: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const [coursesRes, subjectsRes, teachersRes] = await Promise.all([
          api.get('/courses'),
          api.get('/subjects'),
          api.get('/teachers'),
        ]);
        setCourses(Array.isArray(coursesRes.data) ? coursesRes.data : []);
        setSubjects(Array.isArray(subjectsRes.data) ? subjectsRes.data : []);
        setTeachers(Array.isArray(teachersRes.data) ? teachersRes.data : []);
      } catch {
        setCourses([]);
        setSubjects([]);
        setTeachers([]);
      }
    };
    bootstrap();
  }, []);

  const fetchSlots = async (nextFilter = filter) => {
    if (!nextFilter.courseId || !nextFilter.semester || !nextFilter.section) {
      setSlots([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.get('/timetable', { params: nextFilter });
      setSlots(Array.isArray(data) ? data : []);
    } catch {
      setSlots([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!filter.courseId || !filter.semester || !filter.section) {
      setSlots([]);
      setLoading(false);
      return;
    }
    fetchSlots();
  }, [filter.courseId, filter.semester, filter.section]);

  const byDay = slots.reduce((acc, s) => {
    const d = s.dayOfWeek;
    if (!acc[d]) acc[d] = [];
    acc[d].push(s);
    return acc;
  }, {});

  const openCreateModal = ({ dayOfWeek, slot, existing }) => {
    setActiveCell({ dayOfWeek, slot, existing: existing || null });
    setForm({
      dayOfWeek,
      slot,
      subjectId: existing?.subjectId?._id || existing?.subjectId || '',
      teacherId: existing?.teacherId?._id || existing?.teacherId || '',
      startTime: existing?.startTime || '',
      endTime: existing?.endTime || '',
      classroom: existing?.classroom || '',
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    setActiveCell(null);
  };

  const saveSlot = async () => {
    if (!filter.courseId || !filter.semester || !filter.section) return;
    if (!form.subjectId || !form.teacherId) return;
    setSaving(true);
    try {
      const payload = {
        courseId: filter.courseId,
        semester: Number(filter.semester),
        section: filter.section,
        dayOfWeek: Number(form.dayOfWeek),
        slot: Number(form.slot),
        subjectId: form.subjectId,
        teacherId: form.teacherId,
        startTime: form.startTime,
        endTime: form.endTime,
        classroom: form.classroom,
      };
      if (activeCell?.existing?._id) {
        await api.put(`/timetable/${activeCell.existing._id}`, payload);
      } else {
        await api.post('/timetable', payload);
      }
      await fetchSlots();
      closeModal();
    } catch {
      // swallow; page stays usable
    } finally {
      setSaving(false);
    }
  };

  const deleteSlot = async () => {
    if (!activeCell?.existing?._id) return;
    setSaving(true);
    try {
      await api.delete(`/timetable/${activeCell.existing._id}`);
      await fetchSlots();
      closeModal();
    } catch {
      // swallow
    } finally {
      setSaving(false);
    }
  };

  if (loading && filter.courseId) return <TableSkeleton rows={10} />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <select
          value={filter.courseId}
          onChange={(e) => setFilter((f) => ({ ...f, courseId: e.target.value }))}
          className="px-3 py-2 rounded-lg border border-slate-300"
        >
          <option value="">Select course</option>
          {courses.map((c) => <option key={c._id} value={c._id}>{c.courseName}</option>)}
        </select>
        <input
          type="number"
          min={1}
          placeholder="Semester"
          value={filter.semester}
          onChange={(e) => setFilter((f) => ({ ...f, semester: e.target.value }))}
          className="px-3 py-2 rounded-lg border border-slate-300 w-28"
        />
        <input
          type="text"
          placeholder="Section"
          value={filter.section}
          onChange={(e) => setFilter((f) => ({ ...f, section: e.target.value }))}
          className="px-3 py-2 rounded-lg border border-slate-300 w-28"
        />
      </div>
      {filter.courseId && filter.semester && filter.section && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="py-2 px-3 text-left font-semibold text-slate-700">Slot</th>
                  {DAYS.map((d, i) => (
                    <th key={i} className="py-2 px-3 text-left font-semibold text-slate-700">{d}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SLOTS.map((slotNum) => (
                  <tr key={slotNum} className="border-b border-slate-100">
                    <td className="py-2 px-3 font-medium text-slate-600">{slotNum}</td>
                    {DAYS.map((_, dayNum) => {
                      const cell = (byDay[dayNum] || []).find((s) => s.slot === slotNum);
                      return (
                        <td key={dayNum} className="py-2 px-3">
                          <button
                            type="button"
                            onClick={() => openCreateModal({ dayOfWeek: dayNum, slot: slotNum, existing: cell })}
                            className={[
                              'w-full text-left rounded-lg border px-3 py-2 transition',
                              cell ? 'border-slate-200 bg-white hover:bg-slate-50' : 'border-dashed border-slate-200 bg-slate-50/40 hover:bg-slate-50',
                            ].join(' ')}
                          >
                            {cell ? (
                              <div className="text-xs">
                                <div className="font-medium text-slate-800">{cell.subjectId?.subjectName}</div>
                                <div className="text-slate-500">{cell.teacherId?.userId?.name || '-'}</div>
                                {(cell.startTime || cell.endTime || cell.classroom) && (
                                  <div className="text-slate-400 mt-0.5">
                                    {[cell.startTime, cell.endTime].filter(Boolean).join(' - ')} {cell.classroom ? `• ${cell.classroom}` : ''}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-500 text-xs">Add</span>
                            )}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={closeModal} aria-hidden="true" />
          <div className="relative w-full max-w-lg rounded-xl bg-white shadow-xl border border-slate-200 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">
                  {activeCell?.existing ? 'Edit Timetable Slot' : 'Add Timetable Slot'}
                </h2>
                <p className="text-sm text-slate-500">
                  {DAYS[form.dayOfWeek]} • Slot {form.slot}
                </p>
              </div>
              <button type="button" onClick={closeModal} className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50">
                Close
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600">Day</label>
                <select
                  value={form.dayOfWeek}
                  onChange={(e) => setForm((f) => ({ ...f, dayOfWeek: Number(e.target.value) }))}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300"
                >
                  {DAYS.map((d, idx) => (
                    <option key={d} value={idx}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Slot</label>
                <select
                  value={form.slot}
                  onChange={(e) => setForm((f) => ({ ...f, slot: Number(e.target.value) }))}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300"
                >
                  {SLOTS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-slate-600">Subject</label>
                <select
                  value={form.subjectId}
                  onChange={(e) => setForm((f) => ({ ...f, subjectId: e.target.value }))}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300"
                >
                  <option value="">Select subject</option>
                  {subjects.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.subjectName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-slate-600">Teacher</label>
                <select
                  value={form.teacherId}
                  onChange={(e) => setForm((f) => ({ ...f, teacherId: e.target.value }))}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300"
                >
                  <option value="">Select teacher</option>
                  {teachers.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.userId?.name || t._id}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Start time</label>
                <input
                  value={form.startTime}
                  onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
                  placeholder="09:00"
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">End time</label>
                <input
                  value={form.endTime}
                  onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
                  placeholder="09:50"
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-slate-600">Classroom</label>
                <input
                  value={form.classroom}
                  onChange={(e) => setForm((f) => ({ ...f, classroom: e.target.value }))}
                  placeholder="Room 101 / Lab A"
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-slate-500">
                {activeCell?.existing ? 'Update or delete this slot.' : 'This creates a new slot in the timetable.'}
              </div>
              <div className="flex items-center gap-2">
                {activeCell?.existing && (
                  <button
                    type="button"
                    disabled={saving}
                    onClick={deleteSlot}
                    className="px-4 py-2 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 disabled:opacity-60"
                  >
                    Delete
                  </button>
                )}
                <button
                  type="button"
                  disabled={saving || !form.subjectId || !form.teacherId}
                  onClick={saveSlot}
                  className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-60"
                >
                  {saving ? 'Saving...' : activeCell?.existing ? 'Save changes' : 'Create slot'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Timetable;
