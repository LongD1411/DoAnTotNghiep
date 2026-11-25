import express from 'express';
import multer  from 'multer';
import { diagnose, history } from '../controllers/diagnosisController.js';
import { optionalAuth, authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

const multerUpload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Chỉ chấp nhận file ảnh'), false);
  },
});

// Khách chưa đăng nhập vẫn chẩn đoán được (optionalAuth: gắn user nếu có token)
router.post('/', optionalAuth, multerUpload.single('file'), diagnose);

// Lịch sử chẩn đoán của chính người dùng (bắt buộc đăng nhập)
router.get('/history', authenticateToken, history);

export default router;
