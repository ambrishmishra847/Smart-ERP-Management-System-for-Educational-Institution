import 'dotenv/config';
import express from 'express';
import http from 'http';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import teacherRoutes from './routes/teacherRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import subjectRoutes from './routes/subjectRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import assignmentRoutes from './routes/assignmentRoutes.js';
import submissionRoutes from './routes/submissionRoutes.js';
import resultRoutes from './routes/resultRoutes.js';
import noticeRoutes from './routes/noticeRoutes.js';
import announcementRoutes from './routes/announcementRoutes.js';
import feeRoutes from './routes/feeRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import timetableRoutes from './routes/timetableRoutes.js';
import studyMaterialRoutes from './routes/studyMaterialRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import placementRoutes from './routes/placementRoutes.js';
import testEmailRoute from './routes/testEmailRoute.js';
import profileRoutes from './routes/profileRoutes.js';
import { createSocketServer } from './services/socketService.js';

connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/study-materials', studyMaterialRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/placements', placementRoutes);
app.use('/api/profile', profileRoutes);
app.use('/', testEmailRoute);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// 404
app.use((req, res) => res.status(404).json({ message: 'Not Found' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Server Error' });
});

const server = http.createServer(app);

// Socket.io server (attach to same HTTP server)
createSocketServer(server);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
