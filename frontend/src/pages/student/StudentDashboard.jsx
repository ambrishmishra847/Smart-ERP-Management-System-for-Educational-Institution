import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { FiPercent, FiFileText, FiBell, FiBriefcase } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { CardSkeleton } from '../../components/LoadingSkeleton';
import { getUser } from '../../services/auth';

const StudentDashboard = () => {
  const user = getUser();
  const navigate = useNavigate();
  const [attendancePct, setAttendancePct] = useState(null);
  const [upcomingAssignments, setUpcomingAssignments] = useState([]);
  const [notices, setNotices] = useState([]);
  const [placements, setPlacements] = useState([]);
  const [appliedPlacementIds, setAppliedPlacementIds] = useState(new Set());
  const [latestAnnouncement, setLatestAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);
  const studentId = user?.profile?._id;

  useEffect(() => {
    const load = async () => {
      if (!studentId) {
        setLoading(false);
        return;
      }
      try {
        const attendanceRes = await api.get(`/attendance/student/${studentId}`);
        const aData = Array.isArray(attendanceRes.data) ? attendanceRes.data : [];
        const total = aData.length;
        const present = aData.filter((a) => a.status === 'present').length;
        setAttendancePct(total ? Math.round((present / total) * 100) : 0);
      } catch {
        setAttendancePct(0);
      }

      try {
        const { data } = await api.get('/assignments');
        const arr = Array.isArray(data) ? data : [];
        const now = new Date();
        setUpcomingAssignments(arr.filter((a) => new Date(a.deadline) > now).slice(0, 5));
      } catch {
        setUpcomingAssignments([]);
      }

      try {
        const { data } = await api.get('/notices');
        const arr = Array.isArray(data) ? data : [];
        setNotices(arr.slice(0, 5));
      } catch {
        setNotices([]);
      }

      try {
        const { data } = await api.get('/announcements/latest');
        setLatestAnnouncement(data);
      } catch {
        setLatestAnnouncement(null);
      }

      try {
        const [pRes, statusRes] = await Promise.all([api.get('/placements'), api.get('/placements/student/status')]);
        const arr = Array.isArray(pRes.data) ? pRes.data : [];
        setPlacements(arr);
        const ids = Array.isArray(statusRes.data?.appliedPlacementIds) ? statusRes.data.appliedPlacementIds : [];
        setAppliedPlacementIds(new Set(ids.map(String)));
      } catch {
        setPlacements([]);
        setAppliedPlacementIds(new Set());
      }

      setLoading(false);
    };
    load();
  }, [studentId]);

  useEffect(() => {
    const handler = (e) => {
      if (e.detail?.type === 'announcement') {
        api
          .get('/announcements/latest')
          .then(({ data }) => setLatestAnnouncement(data))
          .catch(() => {});
      }
    };
    window.addEventListener('rt-notification', handler);
    return () => window.removeEventListener('rt-notification', handler);
  }, []);

  const announcementText = useMemo(() => {
    if (!latestAnnouncement) return null;
    const base = latestAnnouncement.title || 'New announcement';
    return `📢 ${base}`;
  }, [latestAnnouncement]);

  if (loading) {
    return (
      <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const cards = [
    { label: 'Attendance %', value: attendancePct ?? 0, icon: FiPercent, color: 'bg-emerald-500' },
    { label: 'Upcoming Assignments', value: upcomingAssignments.length, icon: FiFileText, color: 'bg-blue-500' },
    { label: 'Latest Notices', value: notices.length, icon: FiBell, color: 'bg-amber-500' },
  ];

  const now = Date.now();
  const normalizedPlacements = placements
    .map((p) => ({ ...p, _deadlineTs: new Date(p.deadline).getTime() }))
    .sort((a, b) => a._deadlineTs - b._deadlineTs);
  const upcomingDrives = normalizedPlacements.filter((p) => p._deadlineTs >= now).slice(0, 3);
  const appliedCompanies = normalizedPlacements.filter((p) => appliedPlacementIds.has(String(p._id)));
  const deadlineReminders = normalizedPlacements
    .filter((p) => p._deadlineTs >= now && p._deadlineTs - now <= 7 * 24 * 60 * 60 * 1000 && !appliedPlacementIds.has(String(p._id)))
    .slice(0, 3);

  return (
    <div className="w-full space-y-6">
      {announcementText && (
        <div className="w-full rounded-xl overflow-hidden border border-red-500/60 shadow-sm">
          <div className="relative bg-gradient-to-r from-red-500 via-red-600 to-red-700 animate-gradient-slow">
            <div className="flex items-center gap-3 px-4 py-2 text-sm text-white">
              <button
                type="button"
                onClick={() => navigate('/student/notices')}
                className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-white/40 bg-white/10 hover:bg-white/20 flex-shrink-0"
                aria-label="Open announcements"
              />
              <div className="relative overflow-hidden flex-1">
                <div className="ticker-track">
                  <span className="mr-12">{announcementText}</span>
                  <span className="mr-12">{announcementText}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <p className="text-slate-600">Welcome, {user?.name}. Here’s your overview.</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{card.label}</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">{card.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${card.color} text-white`}>
                <card.icon className="w-6 h-6" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800 mb-3">Upcoming Assignments</h2>
        <ul className="space-y-2">
          {upcomingAssignments.length === 0 ? (
            <li className="text-slate-500 text-sm">No upcoming assignments.</li>
          ) : (
            upcomingAssignments.map((a) => (
              <li key={a._id} className="flex justify-between text-sm">
                <span className="text-slate-700">{a.title}</span>
                <span className="text-slate-500">{new Date(a.deadline).toLocaleDateString()}</span>
              </li>
            ))
          )}
        </ul>
      </motion.div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800 mb-3">Latest Notices</h2>
        <ul className="space-y-2">
          {notices.length === 0 ? (
            <li className="text-slate-500 text-sm">No notices.</li>
          ) : (
            notices.map((n) => (
              <li key={n._id} className="text-sm">
                <span className="font-medium text-slate-800">{n.title}</span>
                <span className="text-slate-500 ml-2">{new Date(n.date).toLocaleDateString()}</span>
              </li>
            ))
          )}
        </ul>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <FiBriefcase className="w-5 h-5 text-slate-700" /> Placement
          </h2>
          <div className="text-sm text-slate-500">
            Applied: <span className="font-semibold text-slate-700">{appliedCompanies.length}</span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-200 p-4">
            <div className="text-sm font-semibold text-slate-800">Upcoming Drives</div>
            <ul className="mt-2 space-y-2">
              {upcomingDrives.length === 0 ? (
                <li className="text-sm text-slate-500">No upcoming drives.</li>
              ) : (
                upcomingDrives.map((p) => (
                  <li key={p._id} className="text-sm flex items-center justify-between gap-2">
                    <span className="text-slate-700">{p.companyName}</span>
                    <span className="text-slate-500">{new Date(p.deadline).toLocaleDateString()}</span>
                  </li>
                ))
              )}
            </ul>
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <div className="text-sm font-semibold text-slate-800">Applied Companies</div>
            <ul className="mt-2 space-y-2">
              {appliedCompanies.length === 0 ? (
                <li className="text-sm text-slate-500">No applications marked yet.</li>
              ) : (
                appliedCompanies.slice(0, 5).map((p) => (
                  <li key={p._id} className="text-sm flex items-center justify-between gap-2">
                    <span className="text-slate-700">{p.companyName}</span>
                    <span className="text-slate-500">{p.role}</span>
                  </li>
                ))
              )}
            </ul>
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <div className="text-sm font-semibold text-slate-800">Deadline reminders</div>
            <ul className="mt-2 space-y-2">
              {deadlineReminders.length === 0 ? (
                <li className="text-sm text-slate-500">No urgent deadlines.</li>
              ) : (
                deadlineReminders.map((p) => (
                  <li key={p._id} className="text-sm flex items-center justify-between gap-2">
                    <span className="text-slate-700">{p.companyName}</span>
                    <span className="text-amber-700 font-medium">{new Date(p.deadline).toLocaleDateString()}</span>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default StudentDashboard;
