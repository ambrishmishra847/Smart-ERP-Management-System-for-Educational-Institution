import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import { ROLES } from './utils/constants';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import Students from './pages/admin/Students';
import Teachers from './pages/admin/Teachers';
import Courses from './pages/admin/Courses';
import Subjects from './pages/admin/Subjects';
import Timetable from './pages/admin/Timetable';
import Notices from './pages/admin/Notices';
import Fees from './pages/admin/Fees';
import Analytics from './pages/admin/Analytics';
import AdminPlacements from './pages/admin/Placements';

// Teacher
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherAttendance from './pages/teacher/TeacherAttendance';
import TeacherAssignments from './pages/teacher/TeacherAssignments';
import TeacherMaterials from './pages/teacher/TeacherMaterials';
import TeacherNotices from './pages/teacher/TeacherNotices';
import TeacherTimetable from './pages/teacher/TeacherTimetable';
import TeacherAnalytics from './pages/teacher/TeacherAnalytics';

// Student
import StudentDashboard from './pages/student/StudentDashboard';
import StudentTimetable from './pages/student/StudentTimetable';
import StudentAttendance from './pages/student/StudentAttendance';
import StudentAssignments from './pages/student/StudentAssignments';
import StudentResults from './pages/student/StudentResults';
import StudentMaterials from './pages/student/StudentMaterials';
import StudentNotices from './pages/student/StudentNotices';
import StudentFees from './pages/student/StudentFees';
import StudentPlacements from './pages/student/Placements';
import Profile from './pages/Profile';

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route
      path="/admin"
      element={
        <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
          <DashboardLayout />
        </ProtectedRoute>
      }
    >
      <Route index element={<AdminDashboard />} />
      <Route path="students" element={<Students />} />
      <Route path="teachers" element={<Teachers />} />
      <Route path="courses" element={<Courses />} />
      <Route path="subjects" element={<Subjects />} />
      <Route path="timetable" element={<Timetable />} />
      <Route path="notices" element={<Notices />} />
      <Route path="fees" element={<Fees />} />
      <Route path="placements" element={<AdminPlacements />} />
      <Route path="analytics" element={<Analytics />} />
      <Route path="profile" element={<Profile />} />
    </Route>
    <Route
      path="/teacher"
      element={
        <ProtectedRoute allowedRoles={[ROLES.TEACHER]}>
          <DashboardLayout />
        </ProtectedRoute>
      }
    >
      <Route index element={<TeacherDashboard />} />
      <Route path="attendance" element={<TeacherAttendance />} />
      <Route path="assignments" element={<TeacherAssignments />} />
      <Route path="materials" element={<TeacherMaterials />} />
      <Route path="notices" element={<TeacherNotices />} />
      <Route path="timetable" element={<TeacherTimetable />} />
      <Route path="analytics" element={<TeacherAnalytics />} />
      <Route path="profile" element={<Profile />} />
    </Route>
    <Route
      path="/student"
      element={
        <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
          <DashboardLayout />
        </ProtectedRoute>
      }
    >
      <Route index element={<StudentDashboard />} />
      <Route path="timetable" element={<StudentTimetable />} />
      <Route path="attendance" element={<StudentAttendance />} />
      <Route path="assignments" element={<StudentAssignments />} />
      <Route path="results" element={<StudentResults />} />
      <Route path="materials" element={<StudentMaterials />} />
      <Route path="notices" element={<StudentNotices />} />
      <Route path="fees" element={<StudentFees />} />
      <Route path="placements" element={<StudentPlacements />} />
      <Route path="profile" element={<Profile />} />
    </Route>
    <Route path="/" element={<Navigate to="/login" replace />} />
    <Route path="*" element={<Navigate to="/login" replace />} />
  </Routes>
);

const App = () => {
  return <AppRoutes />;
};

export default App;
