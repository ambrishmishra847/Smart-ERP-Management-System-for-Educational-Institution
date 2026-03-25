import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useSocket } from '../hooks/useSocket';
import { getUser } from '../services/auth';

const pageTitles = {
  '/admin': 'Admin Dashboard',
  '/admin/students': 'Students',
  '/admin/teachers': 'Teachers',
  '/admin/courses': 'Courses',
  '/admin/subjects': 'Subjects',
  '/admin/timetable': 'Timetable',
  '/admin/notices': 'Announcements',
  '/admin/fees': 'Fees',
  '/admin/placements': 'Placements',
  '/admin/analytics': 'Analytics',
  '/admin/profile': 'Profile',
  '/teacher': 'Teacher Dashboard',
  '/teacher/attendance': 'Attendance',
  '/teacher/assignments': 'Assignments',
  '/teacher/materials': 'Study Materials',
  '/teacher/notices': 'Announcements',
  '/teacher/timetable': 'Timetable',
  '/teacher/analytics': 'Analytics',
  '/teacher/profile': 'Profile',
  '/student': 'Student Dashboard',
  '/student/timetable': 'Timetable',
  '/student/attendance': 'Attendance',
  '/student/assignments': 'Assignments',
  '/student/results': 'Results',
  '/student/materials': 'Study Materials',
  '/student/notices': 'Announcements',
  '/student/fees': 'Fees',
  '/student/placements': 'Placement',
  '/student/profile': 'Profile',
};

const getTitle = (pathname) => {
  for (let i = pathname.length; i >= 0; i--) {
    const sub = pathname.slice(0, i) || '/';
    if (pageTitles[sub]) return pageTitles[sub];
  }
  return 'Dashboard';
};

const DashboardLayout = () => {
  const user = getUser();
  useSocket(); // Real-time notifications
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const title = getTitle(location.pathname);

  return (
    <div className="flex w-full min-h-screen bg-gray-50">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 lg:hidden z-30"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <Sidebar user={user} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 w-full  flex flex-col min-w-0">
        <Navbar onMenuClick={() => setSidebarOpen(true)} title={title} />
        <main className="flex-1 w-full p-6 overflow-x-hidden overflow-y-auto">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
