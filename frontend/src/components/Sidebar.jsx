import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiUsers,
  FiBook,
  FiCalendar,
  FiMessageSquare,
  FiDollarSign,
  FiBarChart2,
  FiFileText,
  FiClipboard,
  FiUpload,
  FiBell,
  FiBriefcase,
  FiSettings,
} from 'react-icons/fi';
import { MdDashboard } from "react-icons/md";
import { ROLES } from '../utils/constants';
import { FiX } from 'react-icons/fi';

const navConfig = {
  [ROLES.SUPER_ADMIN]: [
    { to: '/admin', icon: MdDashboard, label: 'Dashboard' },
    { to: '/admin/students', icon: FiUsers, label: 'Students' },
    { to: '/admin/teachers', icon: FiUsers, label: 'Teachers' },
    { to: '/admin/courses', icon: FiBook, label: 'Courses' },
    { to: '/admin/subjects', icon: FiBook, label: 'Subjects' },
    { to: '/admin/timetable', icon: FiCalendar, label: 'Timetable' },
    { to: '/admin/notices', icon: FiMessageSquare, label: 'Announcements' },
    { to: '/admin/fees', icon: FiDollarSign, label: 'Fees' },
    { to: '/admin/placements', icon: FiBriefcase, label: 'Placements' },
    { to: '/admin/analytics', icon: FiBarChart2, label: 'Analytics' },
    { to: '/admin/profile', icon: FiSettings, label: 'Profile' },
  ],
  [ROLES.TEACHER]: [
    { to: '/teacher', icon: MdDashboard, label: 'Dashboard' },
    { to: '/teacher/attendance', icon: FiClipboard, label: 'Attendance' },
    { to: '/teacher/assignments', icon: FiFileText, label: 'Assignments' },
    { to: '/teacher/materials', icon: FiUpload, label: 'Study Materials' },
    { to: '/teacher/notices', icon: FiMessageSquare, label: 'Announcements' },
    { to: '/teacher/timetable', icon: FiCalendar, label: 'Timetable' },
    { to: '/teacher/analytics', icon: FiBarChart2, label: 'Analytics' },
    { to: '/teacher/profile', icon: FiSettings, label: 'Profile' },
  ],
  [ROLES.STUDENT]: [
    { to: '/student', icon: MdDashboard, label: 'Dashboard' },
    { to: '/student/timetable', icon: FiCalendar, label: 'Timetable' },
    { to: '/student/attendance', icon: FiClipboard, label: 'Attendance' },
    { to: '/student/assignments', icon: FiFileText, label: 'Assignments' },
    { to: '/student/results', icon: FiBarChart2, label: 'Results' },
    { to: '/student/materials', icon: FiUpload, label: 'Study Materials' },
    { to: '/student/notices', icon: FiMessageSquare, label: 'Announcements' },
    { to: '/student/fees', icon: FiDollarSign, label: 'Fees' },
    { to: '/student/placements', icon: FiBriefcase, label: 'Placement' },
    { to: '/student/profile', icon: FiSettings, label: 'Profile' },
  ],
};

const Sidebar = ({ user, isOpen, onClose }) => {
  const links = navConfig[user?.role] || [];

  return (
    <motion.aside
      initial={false}
      animate={false}
      className={[
        'fixed lg:static z-40 top-0 left-0 h-full w-72',
        'bg-slate-900 text-white shadow-xl border-r border-slate-800',
        'transform transition-transform duration-300',
        isOpen ? 'translate-x-0' : '-translate-x-full',
        'lg:translate-x-0',
      ].join(' ')}
    >
      <div className="flex h-16 items-center justify-between px-4 border-b border-slate-700">
        <span className="text-lg font-semibold text-white">Smart ERP</span>
        <button
          type="button"
          className="lg:hidden p-2 rounded-lg hover:bg-slate-800 text-slate-200"
          onClick={onClose}
          aria-label="Close sidebar"
        >
          <FiX className="w-5 h-5" />
        </button>
      </div>
      <nav className="mt-4 space-y-1 px-3 scrollbar-thin overflow-y-auto max-h-[calc(100vh-4rem)]">
        {links.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/admin' || item.to === '/teacher' || item.to === '/student'}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                isActive ? 'bg-primary-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`
            }
            onClick={() => window.innerWidth < 1024 && onClose()}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </motion.aside>
  );
};

export default Sidebar;
