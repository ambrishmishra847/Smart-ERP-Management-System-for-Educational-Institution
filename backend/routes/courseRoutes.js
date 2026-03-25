import express from 'express';
import {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
} from '../controllers/courseController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);

router.get('/', restrictTo('super_admin', 'teacher'), getCourses);
router.get('/:id', restrictTo('super_admin', 'teacher'), getCourseById);
router.post('/', restrictTo('super_admin'), createCourse);
router.put('/:id', restrictTo('super_admin'), updateCourse);
router.delete('/:id', restrictTo('super_admin'), deleteCourse);

export default router;
