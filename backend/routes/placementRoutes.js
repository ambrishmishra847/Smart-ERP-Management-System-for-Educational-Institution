import express from 'express';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import {
  createPlacement,
  deletePlacement,
  getPlacementById,
  getPlacements,
  getStudentPlacementStatus,
  markPlacementApplied,
} from '../controllers/placementController.js';

const router = express.Router();
router.use(protect);

router.get('/', getPlacements);
router.get('/student/status', restrictTo('student', 'super_admin'), getStudentPlacementStatus);
router.post('/:id/applied', restrictTo('student'), markPlacementApplied);

router.post('/', restrictTo('super_admin'), createPlacement);
router.get('/:id', getPlacementById);
router.delete('/:id', restrictTo('super_admin'), deletePlacement);

export default router;

