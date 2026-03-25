import express from 'express';
import {
  getTimetable,
  getTimetableById,
  getTeacherTimetable,
  getStudentTimetable,
  createTimetableSlot,
  updateTimetableSlot,
  deleteTimetableSlot,
} from '../controllers/timetableController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);

router.get('/teacher', restrictTo('teacher', 'super_admin'), getTeacherTimetable);
router.get('/student', restrictTo('student', 'super_admin'), getStudentTimetable);
router.get('/', getTimetable);
router.get('/:id', getTimetableById);
router.post('/', restrictTo('super_admin'), createTimetableSlot);
router.put('/:id', restrictTo('super_admin'), updateTimetableSlot);
router.delete('/:id', restrictTo('super_admin'), deleteTimetableSlot);

export default router;
