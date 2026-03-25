import express from 'express';
import {
  getFees,
  getFeeById,
  createFee,
  updateFee,
  deleteFee,
} from '../controllers/feeController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);

router.get('/', getFees);
router.get('/:id', getFeeById);
router.post('/', restrictTo('super_admin'), createFee);
router.put('/:id', restrictTo('super_admin'), updateFee);
router.delete('/:id', restrictTo('super_admin'), deleteFee);

export default router;
