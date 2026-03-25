import express from 'express';
import {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
} from '../controllers/studentController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);

router.get('/', restrictTo('super_admin', 'teacher'), getStudents);
router.get('/:id', restrictTo('super_admin'), getStudentById);
router.post('/', restrictTo('super_admin'), createStudent);
router.put('/:id', restrictTo('super_admin'), updateStudent);
router.delete('/:id', restrictTo('super_admin'), deleteStudent);

export default router;
