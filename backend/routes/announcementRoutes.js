import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getLatestAnnouncement } from '../controllers/noticeController.js';

const router = express.Router();

router.use(protect);

router.get('/latest', getLatestAnnouncement);

export default router;

