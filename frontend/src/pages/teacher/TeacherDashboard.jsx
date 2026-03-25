import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiClipboard,
  FiFileText,
  FiTrendingUp,
  FiUsers,
  FiBookOpen,
  FiBarChart2,
  FiCalendar,
  FiUpload,
} from 'react-icons/fi';
// import { FiMegaphone } from "react-icons/fi"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import api from '../../services/api';
import { CardSkeleton } from '../../components/LoadingSkeleton';
import { getUser } from '../../services/auth';

const TeacherDashboard = () => {
  const user = getUser();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data } = await api.get('/dashboard/teacher');
        setDashboardData(data);
      } catch (error) {
        console.error('Failed to load teacher dashboard', error);
        setDashboardData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const totalSubjects = dashboardData?.totalSubjects ?? (user?.profile?.subjects?.length ?? 0);
  const todayAttendanceCount = dashboardData?.todayAttendanceCount ?? 0;
  const assignmentsPending = dashboardData?.assignmentsPending ?? 0;
  const performance = dashboardData?.performancePercentage ?? 0;
  const attendanceTrend = dashboardData?.attendanceTrend ?? [];
  const upcomingClasses = dashboardData?.upcomingClasses ?? [];
  const recentActivities = dashboardData?.recentActivities ?? [];

  const today = new Date();
  const formattedDate = today.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  const attendanceTrendWithLabel = attendanceTrend.map((d) => ({
    label: d.date,
    percentage: d.percentage,
  }));

  const cards = [
    {
      label: 'Students (Today Present)',
      value: todayAttendanceCount,
      icon: FiClipboard,
      color: 'bg-emerald-500',
      sublabel: 'Students marked present today',
    },
    {
      label: 'Assignments',
      value: assignmentsPending,
      icon: FiFileText,
      color: 'bg-blue-500',
      sublabel: 'Assignments you manage',
    },
    {
      label: 'Total Subjects',
      value: totalSubjects,
      icon: FiBookOpen,
      color: 'bg-violet-500',
      sublabel: 'Subjects assigned to you',
    },
    {
      label: 'Class Performance',
      value: `${performance}%`,
      icon: FiTrendingUp,
      color: 'bg-amber-500',
      sublabel: 'Average marks across subjects',
    },
  ];

  const quickActions = [
    {
      label: 'Mark Attendance',
      icon: FiClipboard,
      onClick: () => navigate('/teacher/attendance'),
    },
    {
      label: 'Upload Assignment',
      icon: FiFileText,
      onClick: () => navigate('/teacher/assignments'),
    },
    {
      label: 'Upload Material',
      icon: FiUpload,
      onClick: () => navigate('/teacher/materials'),
    },
  ];

 

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">Teacher Dashboard</h1>
          <p className="text-slate-600 mt-1">Welcome back, {user?.name || 'Teacher'}.</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="text-right">
            <p className="text-slate-500">Today</p>
            <p className="font-medium text-slate-800">{formattedDate}</p>
          </div>
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-100">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Online
          </span>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">{card.label}</p>
                <p className="text-2xl font-semibold text-slate-900">{card.value}</p>
                {card.sublabel && <p className="text-xs text-slate-500 mt-2">{card.sublabel}</p>}
              </div>
              <div className={`p-3 rounded-xl ${card.color} text-white`}>
                <card.icon className="w-6 h-6" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm col-span-1 lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <FiBarChart2 className="w-5 h-5 text-primary-500" />
                Student Attendance Trend
              </h2>
              <p className="text-xs text-slate-500 mt-1">Weekly overview of average attendance.</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={attendanceTrendWithLabel}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="percentage" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Quick actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-slate-900 mb-3">Quick Actions</h2>
          <p className="text-xs text-slate-500 mb-4">Jump quickly to common tasks.</p>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={action.onClick}
                className="flex flex-col items-start gap-2 rounded-lg border border-slate-200 px-3 py-3 hover:border-primary-500 hover:bg-primary-50/40 transition"
              >
                <span className="inline-flex items-center justify-center p-2 rounded-md bg-slate-100 text-slate-700">
                  <action.icon className="w-4 h-4" />
                </span>
                <span className="text-xs font-medium text-slate-800">{action.label}</span>
              </button>
            ))}
          </div>
          <div className="mt-4 rounded-lg bg-primary-50 border border-primary-100 p-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary-900">Mark today&apos;s attendance</p>
              <p className="text-xs text-primary-700 mt-1">Open the attendance sheet for your classes.</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/teacher/attendance')}
              className="px-3 py-1.5 rounded-lg bg-primary-600 text-white text-xs font-medium hover:bg-primary-700"
            >
              Mark Attendance Now
            </button>
          </div>
        </motion.div>
      </div>

      {/* Bottom grid: recent activity + upcoming classes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <FiUsers className="w-5 h-5 text-primary-500" />
              Recent Activity
            </h2>
          </div>
          {recentActivities.length === 0 ? (
            <p className="text-sm text-slate-500">No recent activity.</p>
          ) : (
            <ul className="space-y-3">
              {recentActivities.map((item, idx) => (
                <li key={`${item.title}-${idx}`} className="flex items-start gap-3">
                  <div className="mt-1">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                      {item.type[0]}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800">{item.title}</p>
                    <p className="text-xs text-slate-500">{item.meta}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </motion.div>

        {/* Upcoming classes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <FiCalendar className="w-5 h-5 text-primary-500" />
              Upcoming Classes
            </h2>
          </div>
          {upcomingClasses.length === 0 ? (
            <p className="text-sm text-slate-500">No upcoming classes found in timetable.</p>
          ) : (
            <ul className="space-y-3">
              {upcomingClasses.map((slot) => (
                <li
                  key={slot._id}
                  className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 hover:bg-slate-50 transition"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-800">{slot.subjectId?.subjectName || 'Class'}</p>
                    <p className="text-xs text-slate-500">
                      {days[slot.dayOfWeek ?? 0]} • Slot {slot.slot}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-700">
                    {slot.startTime && slot.endTime ? `${slot.startTime} - ${slot.endTime}` : 'Scheduled'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
