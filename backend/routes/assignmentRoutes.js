import express from 'express';
import {
  getAssignments,
  getAssignmentById,
  createAssignment,
  updateAssignment,
  deleteAssignment,
} from '../controllers/assignmentController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);

router.get('/', getAssignments);
router.get('/:id', getAssignmentById);
router.post('/', restrictTo('super_admin', 'teacher'), createAssignment);
router.put('/:id', restrictTo('super_admin', 'teacher'), updateAssignment);
router.delete('/:id', restrictTo('super_admin', 'teacher'), deleteAssignment);

export default router;
