import express from 'express';
import {
  getAttendance,
  markAttendance,
  bulkMarkAttendance,
  getAttendanceByStudent,
} from '../controllers/attendanceController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);

router.get('/', getAttendance);
router.get('/student/:studentId', getAttendanceByStudent);
router.post('/', restrictTo('super_admin', 'teacher'), markAttendance);
router.post('/bulk', restrictTo('super_admin', 'teacher'), bulkMarkAttendance);

export default router;
