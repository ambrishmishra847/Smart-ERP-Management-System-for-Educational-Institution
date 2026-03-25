import express from 'express';
import { getAdminDashboard, getTeacherDashboard } from '../controllers/dashboardController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/admin', restrictTo('super_admin'), getAdminDashboard);
router.get('/teacher', restrictTo('teacher'), getTeacherDashboard);

export default router;

