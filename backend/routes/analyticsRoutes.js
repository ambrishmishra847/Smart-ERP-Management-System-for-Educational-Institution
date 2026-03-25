import express from 'express';
import {
  getAdminAnalytics,
  getStudentGrowth,
  getAttendanceTrends,
  getCourseDistribution,
  getPerformanceOverview,
  getTeacherAnalytics,
} from '../controllers/analyticsController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);

router.get('/admin', restrictTo('super_admin'), getAdminAnalytics);
router.get('/admin/student-growth', restrictTo('super_admin'), getStudentGrowth);
router.get('/admin/attendance-trends', restrictTo('super_admin'), getAttendanceTrends);
router.get('/admin/course-distribution', restrictTo('super_admin'), getCourseDistribution);
router.get('/admin/performance', restrictTo('super_admin'), getPerformanceOverview);
router.get('/teacher', restrictTo('teacher'), getTeacherAnalytics);

export default router;
