import express from 'express';
import {
  getSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
} from '../controllers/subjectController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);

router.get('/', getSubjects);
router.get('/:id', getSubjectById);
router.post('/', restrictTo('super_admin'), createSubject);
router.put('/:id', restrictTo('super_admin'), updateSubject);
router.delete('/:id', restrictTo('super_admin'), deleteSubject);

export default router;
