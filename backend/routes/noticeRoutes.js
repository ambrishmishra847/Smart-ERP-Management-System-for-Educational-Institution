import express from 'express';
import {
  getNotices,
  getNoticeById,
  createNotice,
  updateNotice,
  deleteNotice,
} from '../controllers/noticeController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);

router.get('/', getNotices);
router.get('/:id', getNoticeById);
router.post('/', restrictTo('super_admin', 'teacher'), createNotice);
router.put('/:id', restrictTo('super_admin', 'teacher'), updateNotice);
router.delete('/:id', restrictTo('super_admin', 'teacher'), deleteNotice);

export default router;
