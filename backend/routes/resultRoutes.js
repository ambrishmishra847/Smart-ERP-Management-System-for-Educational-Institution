import express from 'express';
import {
  getResults,
  getResultById,
  createResult,
  updateResult,
  deleteResult,
} from '../controllers/resultController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);

router.get('/', getResults);
router.get('/:id', getResultById);
router.post('/', restrictTo('super_admin', 'teacher'), createResult);
router.put('/:id', restrictTo('super_admin', 'teacher'), updateResult);
router.delete('/:id', restrictTo('super_admin', 'teacher'), deleteResult);

export default router;
