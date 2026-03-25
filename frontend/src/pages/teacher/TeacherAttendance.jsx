import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { TableSkeleton } from '../../components/LoadingSkeleton';
import { getUser } from '../../services/auth';
import { FiCheckCircle, FiXCircle, FiRefreshCw } from 'react-icons/fi';

const TeacherAttendance = () => {
  const user = getUser();
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10)); // YYYY-MM-DD

  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState({}); // { [studentId]: 'present' | 'absent' }

  const [history, setHistory] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const subjectIds = user?.profile?.subjects?.map((s) => s?._id).filter(Boolean) || [];

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const { data } = await api.get('/subjects');
        const all = Array.isArray(data) ? data : [];
        const mine = all.filter((s) => subjectIds.includes(s._id));
        setSubjects(mine);
        if (!selectedSubjectId && mine.length) setSelectedSubjectId(mine[0]._id);
      } catch {
        setSubjects([]);
      } finally {
        setLoadingSubjects(false);
      }
    };

    loadSubjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectIds.length]);

  const loadHistory = async (subjectId = selectedSubjectId) => {
    setLoadingHistory(true);
    try {
      const { data } = await api.get('/attendance', { params: subjectId ? { subjectId } : {} });
      const arr = Array.isArray(data) ? data : [];
      setHistory(arr.slice(0, 50));
    } catch {
      setHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadHistory(selectedSubjectId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSubjectId]);

  const loadStudents = async () => {
    if (!selectedSubjectId || !selectedDate) return;
    setLoadingStudents(true);
    try {
      const studentsRes = await api.get('/students', { params: { subjectId: selectedSubjectId } });
      const list = Array.isArray(studentsRes.data) ? studentsRes.data : [];
      setStudents(list);

      // Load existing attendance for the chosen date/subject so UI can be edited
      const attendanceRes = await api.get('/attendance', { params: { subjectId: selectedSubjectId, date: selectedDate } });
      const existing = Array.isArray(attendanceRes.data) ? attendanceRes.data : [];
      const nextMarks = {};
      for (const s of list) nextMarks[s._id] = 'present';
      for (const rec of existing) {
        const sid = rec?.studentId?._id || rec?.studentId;
        if (sid) nextMarks[sid] = rec.status || 'present';
      }
      setMarks(nextMarks);
    } catch {
      setStudents([]);
      setMarks({});
    } finally {
      setLoadingStudents(false);
    }
  };

  const setStudentStatus = (studentId, status) => {
    setMarks((prev) => ({ ...prev, [studentId]: status }));
  };

  const submitAttendance = async () => {
    if (!selectedSubjectId || !selectedDate || students.length === 0) return;
    setSubmitting(true);
    try {
      const entries = students.map((s) => ({
        studentId: s._id,
        status: marks[s._id] || 'present',
      }));
      await api.post('/attendance/bulk', { subjectId: selectedSubjectId, date: selectedDate, entries });
      await loadHistory(selectedSubjectId);
    } catch {
      // keep UI stable; errors show as unchanged state
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingSubjects) return <TableSkeleton rows={6} />;

  return (
    <div className="w-full space-y-6">
      {/* Form */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-end gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-500 outline-none"
            >
              {subjects.length === 0 ? (
                <option value="">No assigned subjects</option>
              ) : (
                subjects.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.subjectName}
                  </option>
                ))
              )}
            </select>
          </div>
          <div className="w-full lg:w-56">
            <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={loadStudents}
              disabled={!selectedSubjectId || !selectedDate || loadingStudents}
              className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50"
            >
              {loadingStudents ? 'Loading...' : 'Load Students'}
            </button>
            <button
              type="button"
              onClick={() => loadHistory(selectedSubjectId)}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
            >
              <FiRefreshCw className="w-4 h-4" />
              Refresh History
            </button>
          </div>
        </div>
      </motion.div>

      {/* Student marking table */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Mark Attendance</h2>
            <p className="text-sm text-slate-500">Default is Present. Select Absent where needed, then submit.</p>
          </div>
          <button
            type="button"
            onClick={submitAttendance}
            disabled={submitting || students.length === 0 || !selectedSubjectId || !selectedDate}
            className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Attendance'}
          </button>
        </div>

        {loadingStudents ? (
          <div className="p-6">
            <TableSkeleton rows={6} />
          </div>
        ) : students.length === 0 ? (
          <div className="py-12 text-center text-slate-500">Load a subject and date to view students.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left py-3 px-6 text-sm font-semibold text-slate-700">Student</th>
                  <th className="text-left py-3 px-6 text-sm font-semibold text-slate-700">Email</th>
                  <th className="text-left py-3 px-6 text-sm font-semibold text-slate-700">Enrollment</th>
                  <th className="text-left py-3 px-6 text-sm font-semibold text-slate-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => {
                  const status = marks[s._id] || 'present';
                  return (
                    <tr key={s._id} className="border-b border-slate-100 hover:bg-slate-50/50">
                      <td className="py-3 px-6 text-slate-800">{s.userId?.name || '—'}</td>
                      <td className="py-3 px-6 text-slate-600">{s.userId?.email || '—'}</td>
                      <td className="py-3 px-6 text-slate-600">{s.enrollmentNumber || '—'}</td>
                      <td className="py-3 px-6">
                        <div className="inline-flex rounded-lg border border-slate-200 overflow-hidden">
                          <button
                            type="button"
                            onClick={() => setStudentStatus(s._id, 'present')}
                            className={`px-3 py-1.5 text-sm font-medium flex items-center gap-2 ${
                              status === 'present' ? 'bg-emerald-50 text-emerald-700' : 'bg-white text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <FiCheckCircle className="w-4 h-4" />
                            Present
                          </button>
                          <button
                            type="button"
                            onClick={() => setStudentStatus(s._id, 'absent')}
                            className={`px-3 py-1.5 text-sm font-medium flex items-center gap-2 border-l border-slate-200 ${
                              status === 'absent' ? 'bg-red-50 text-red-700' : 'bg-white text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <FiXCircle className="w-4 h-4" />
                            Absent
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* History */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800">Attendance History</h2>
          <p className="text-sm text-slate-500">Latest records for the selected subject.</p>
        </div>

        {loadingHistory ? (
          <div className="p-6">
            <TableSkeleton rows={6} />
          </div>
        ) : history.length === 0 ? (
          <div className="py-12 text-center text-slate-500">No attendance records yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left py-3 px-6 text-sm font-semibold text-slate-700">Student</th>
                  <th className="text-left py-3 px-6 text-sm font-semibold text-slate-700">Subject</th>
                  <th className="text-left py-3 px-6 text-sm font-semibold text-slate-700">Date</th>
                  <th className="text-left py-3 px-6 text-sm font-semibold text-slate-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((a) => (
                  <tr key={a._id} className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="py-3 px-6 text-slate-800">{a.studentId?.userId?.name || a.studentId?._id || '—'}</td>
                    <td className="py-3 px-6 text-slate-600">{a.subjectId?.subjectName || '—'}</td>
                    <td className="py-3 px-6 text-slate-600">{a.date ? new Date(a.date).toLocaleDateString() : '—'}</td>
                    <td className="py-3 px-6">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${a.status === 'present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default TeacherAttendance;
