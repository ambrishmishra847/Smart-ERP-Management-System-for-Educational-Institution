import express from 'express';
import { upload } from '../middleware/uploadMiddleware.js';
import {
  getSubmissions,
  getSubmissionById,
  createSubmission,
  gradeSubmission,
  deleteSubmission,
} from '../controllers/submissionController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);

router.get('/', getSubmissions);
router.get('/:id', getSubmissionById);
router.post('/', upload.single('file'), createSubmission);
router.put('/:id/grade', restrictTo('super_admin', 'teacher'), gradeSubmission);
router.delete('/:id', restrictTo('super_admin', 'teacher'), deleteSubmission);

export default router;
