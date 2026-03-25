import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Store in memory for Cloudinary upload (no disk storage required)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = /\.(pdf|doc|docx|jpg|jpeg|png|gif)$/i.test(file.originalname) ||
    ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'image/gif'].includes(file.mimetype);
  if (allowed) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, DOC, DOCX, and images are allowed'), false);
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter,
});
