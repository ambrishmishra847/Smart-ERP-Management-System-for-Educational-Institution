import express from 'express';
import {
  getTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher,
} from '../controllers/teacherController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);

router.get('/', restrictTo('super_admin'), getTeachers);
router.get('/:id', restrictTo('super_admin'), getTeacherById);
router.post('/', restrictTo('super_admin'), createTeacher);
router.put('/:id', restrictTo('super_admin'), updateTeacher);
router.delete('/:id', restrictTo('super_admin'), deleteTeacher);

export default router;
