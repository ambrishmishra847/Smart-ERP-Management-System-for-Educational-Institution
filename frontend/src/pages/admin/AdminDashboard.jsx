import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FiUsers,
  FiUserCheck,
  FiBook,
  FiLayers,
  FiTrendingUp,
  FiBriefcase,
  FiBell,
  FiPlus,
  FiCalendar,
  FiClock,
  FiActivity,
  FiCpu,
} from 'react-icons/fi';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, Legend } from 'recharts';
import api from '../../services/api';
import { CardSkeleton, TableSkeleton } from '../../components/LoadingSkeleton';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data } = await api.get('/dashboard/admin');
        setData(data);
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const today = useMemo(() => {
    const d = new Date();
    return d.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });
  }, []);

  const kpis = useMemo(
    () => [
      {
        label: 'Total Students',
        value: data?.totalStudents ?? 0,
        icon: FiUsers,
        color: 'bg-blue-500',
      },
      {
        label: 'Total Teachers',
        value: data?.totalTeachers ?? 0,
        icon: FiUserCheck,
        color: 'bg-emerald-500',
      },
      {
        label: 'Total Courses',
        value: data?.totalCourses ?? 0,
        icon: FiBook,
        color: 'bg-violet-500',
      },
      {
        label: 'Total Subjects',
        value: data?.totalSubjects ?? 0,
        icon: FiLayers,
        color: 'bg-sky-500',
      },
      {
        label: 'Average Attendance',
        value: `${data?.averageAttendance ?? 0}%`,
        icon: FiTrendingUp,
        color: 'bg-amber-500',
      },
      {
        label: 'Active Placements',
        value: data?.placements?.active ?? 0,
        icon: FiBriefcase,
        color: 'bg-rose-500',
      },
    ],
    [data]
  );

  const studentChartData = useMemo(
    () =>
      (data?.studentAnalytics || []).map((d) => ({
        month: d.month,
        students: d.count,
      })),
    [data]
  );

  const attendanceChartData = useMemo(
    () =>
      (data?.attendanceAnalytics || []).map((d) => ({
        status: d.status,
        count: d.count,
      })),
    [data]
  );

  const announcements = data?.announcements || [];
  const recentActivities = data?.recentActivities || [];
  const timetableToday = data?.timetableToday || [];
  const placementsPanel = data?.placements || { upcoming: [] };
  const systemHealth = data?.systemHealth || {};

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="h-6 w-40 bg-slate-200 rounded mb-2" />
            <div className="h-4 w-56 bg-slate-200 rounded" />
          </div>
          <div className="flex items-center gap-4">
            <div className="h-4 w-40 bg-slate-200 rounded" />
            <div className="h-8 w-24 bg-slate-200 rounded-full" />
            <div className="h-9 w-9 bg-slate-200 rounded-full" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
        <TableSkeleton rows={4} />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Admin Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Welcome back, Super Admin</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-slate-400 uppercase tracking-wide">Today</p>
            <p className="text-sm font-medium text-slate-700">{today}</p>
          </div>
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            System Healthy
          </span>
          <button
            type="button"
            className="relative inline-flex items-center justify-center w-9 h-9 rounded-full border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-sm"
          >
            <FiBell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-rose-500 text-[10px] font-semibold text-white">
              3
            </span>
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {kpis.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{card.label}</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{card.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${card.color} text-white`}>
                <card.icon className="w-6 h-6" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main grid: charts + placement + activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Student Enrollment Growth */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-800">Student Enrollment Growth</h2>
            <span className="text-xs text-slate-500">Last 6 months</span>
          </div>
          {studentChartData.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-sm text-slate-400">No enrollment data.</div>
          ) : (
            <div className="h-64 -mx-3">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={studentChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="students" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>

        {/* Attendance Overview */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-800">Attendance Overview</h2>
            <span className="text-xs text-slate-500">Present / Absent / Late</span>
          </div>
          {attendanceChartData.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-sm text-slate-400">No attendance data.</div>
          ) : (
            <div className="h-64 -mx-3">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="status" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>

        {/* Placement Overview */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <FiBriefcase className="w-4 h-4 text-slate-600" />
              Placement Overview
            </h2>
            <span className="text-xs text-slate-500">
              {placementsPanel.total ?? 0} drives · {placementsPanel.studentsApplied ?? 0} applications
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-4 text-xs">
            <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-3">
              <p className="text-slate-500">Total drives</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">{placementsPanel.total ?? 0}</p>
            </div>
            <div className="rounded-lg border border-emerald-100 bg-emerald-50/60 p-3">
              <p className="text-emerald-600">Active</p>
              <p className="mt-1 text-lg font-semibold text-emerald-700">{placementsPanel.active ?? 0}</p>
            </div>
            <div className="rounded-lg border border-sky-100 bg-sky-50/60 p-3">
              <p className="text-sky-600">Students applied</p>
              <p className="mt-1 text-lg font-semibold text-sky-700">{placementsPanel.studentsApplied ?? 0}</p>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-xs font-medium text-slate-500 mb-2">Upcoming drives</p>
            {placementsPanel.upcoming?.length ? (
              <ul className="space-y-2 text-xs">
                {placementsPanel.upcoming.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 px-3 py-2 hover:bg-slate-50"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-slate-800 truncate">{p.companyName}</p>
                      <p className="text-slate-500 truncate">{p.role}</p>
                    </div>
                    <span className="text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-100 px-2 py-1 rounded-full">
                      {new Date(p.deadline).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-400">No upcoming drives.</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Secondary grid: activity + announcements + quick actions + timetable + system health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Recent Activity Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-slate-200 shadow-sm p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <FiActivity className="w-4 h-4 text-slate-600" />
              Recent Activity
            </h2>
          </div>
          {recentActivities.length === 0 ? (
            <p className="text-sm text-slate-400">No recent activity.</p>
          ) : (
            <ol className="relative border-l border-slate-200 ml-2 space-y-3 text-sm">
              {recentActivities.slice(0, 8).map((item, idx) => (
                <li key={idx} className="ml-3">
                  <span className="absolute -left-[7px] mt-[3px] h-3 w-3 rounded-full bg-primary-500 border-2 border-white shadow-sm" />
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-slate-800">{item.type}</p>
                    <span className="text-xs text-slate-400">
                      {item.date ? new Date(item.date).toLocaleDateString() : ''}
                    </span>
                  </div>
                  <p className="text-slate-600 text-sm">{item.title}</p>
                </li>
              ))}
            </ol>
          )}
        </motion.div>

        {/* Announcements Panel */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-800">Latest Announcements</h2>
            <span className="text-xs text-slate-500">Last 5</span>
          </div>
          {announcements.length === 0 ? (
            <p className="text-sm text-slate-400">No announcements posted.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {announcements.slice(0, 5).map((n) => (
                <li
                  key={n.id}
                  className="rounded-lg border border-slate-100 px-3 py-2 flex items-start justify-between gap-3 hover:bg-slate-50"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-slate-800 truncate">{n.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5 capitalize">
                      {n.category === 'all' ? 'All users' : n.category}
                    </p>
                  </div>
                  <span className="text-xs text-slate-400">
                    {n.date ? new Date(n.date).toLocaleDateString() : ''}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </motion.div>

        {/* Quick actions */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-800">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              { label: 'Add Student', icon: FiUsers, to: '/admin/students' },
              { label: 'Add Teacher', icon: FiUserCheck, to: '/admin/teachers' },
              { label: 'Create Course', icon: FiBook, to: '/admin/courses' },
              { label: 'Create Announcement', icon: FiBell, to: '/admin/notices' },
              { label: 'Create Placement', icon: FiBriefcase, to: '/admin/placements' },
              { label: 'Manage Timetable', icon: FiCalendar, to: '/admin/timetable' },
            ].map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={() => {
                  window.location.href = action.to;
                }}
                className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 hover:bg-slate-50 text-slate-700"
              >
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-slate-50 border border-slate-200">
                  <action.icon className="w-4 h-4" />
                </span>
                <span className="text-xs font-medium">{action.label}</span>
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Timetable + System health row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timetable Overview */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-slate-200 shadow-sm p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <FiClock className="w-4 h-4 text-slate-600" />
              Today&apos;s Schedule
            </h2>
            <span className="text-xs text-slate-500">
              {systemHealth.totalClassesToday ?? 0} classes today
            </span>
          </div>
          {timetableToday.length === 0 ? (
            <p className="text-sm text-slate-400">No timetable slots for today.</p>
          ) : (
            <div className="rounded-lg border border-slate-100 overflow-hidden">
              <div className="bg-slate-50 border-b border-slate-100 px-3 py-2 text-xs font-medium text-slate-600 grid grid-cols-4 gap-2">
                <span>Slot</span>
                <span>Subject</span>
                <span>Teacher</span>
                <span>Time</span>
              </div>
              <ul className="divide-y divide-slate-100 text-xs">
                {timetableToday.map((slot) => (
                  <li key={slot.id} className="px-3 py-2 grid grid-cols-4 gap-2">
                    <span className="font-medium text-slate-700">{slot.slot}</span>
                    <span className="text-slate-800 truncate">{slot.subject || '-'}</span>
                    <span className="text-slate-600 truncate">{slot.teacher || '-'}</span>
                    <span className="text-slate-500">
                      {[slot.startTime, slot.endTime].filter(Boolean).join(' - ') || '—'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>

        {/* System Health Panel */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-slate-200 shadow-sm p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <FiCpu className="w-4 h-4 text-slate-600" />
              System Health
            </h2>
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="rounded-lg border border-slate-100 bg-slate-50/40 p-3">
              <p className="text-xs text-slate-500">Active Users</p>
              <p className="mt-1 text-xl font-semibold text-slate-900">{systemHealth.activeUsers ?? 0}</p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50/40 p-3">
              <p className="text-xs text-slate-500">Classes Today</p>
              <p className="mt-1 text-xl font-semibold text-slate-900">{systemHealth.totalClassesToday ?? 0}</p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50/40 p-3">
              <p className="text-xs text-slate-500">Server Status</p>
              <p className="mt-1 text-sm font-semibold text-emerald-700 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                {systemHealth.serverStatus || 'Online'}
              </p>
            </div>
          </div>
          <div className="mt-4 rounded-lg border border-dashed border-slate-200 p-3 flex items-center gap-3 text-xs text-slate-500">
            <FiPlus className="w-4 h-4 text-slate-400" />
            <span>
              This panel can be extended with infrastructure metrics (database, queues, storage) when available.
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
