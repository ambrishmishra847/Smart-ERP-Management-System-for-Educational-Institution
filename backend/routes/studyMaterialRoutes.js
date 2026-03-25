import express from 'express';
import { upload } from '../middleware/uploadMiddleware.js';
import {
  getStudyMaterials,
  getStudyMaterialById,
  createStudyMaterial,
  updateStudyMaterial,
  deleteStudyMaterial,
} from '../controllers/studyMaterialController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);

router.get('/', getStudyMaterials);
router.get('/:id', getStudyMaterialById);
router.post('/', upload.single('file'), restrictTo('super_admin', 'teacher'), createStudyMaterial);
router.put('/:id', restrictTo('super_admin', 'teacher'), updateStudyMaterial);
router.delete('/:id', restrictTo('super_admin', 'teacher'), deleteStudyMaterial);

export default router;
