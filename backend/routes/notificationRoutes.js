import express from 'express';
import {
  getNotifications,
  createNotification,
  markAsRead,
  markAllAsRead,
} from '../controllers/notificationController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);

router.get('/', getNotifications);
// Admin/system can create notifications (optional utility)
router.post('/', restrictTo('super_admin'), createNotification);

// Backward compatible read endpoints
router.put('/read', markAllAsRead);
router.put('/read/:id', markAsRead);

// Requested alias endpoints
router.patch('/:id/read', markAsRead);

export default router;
