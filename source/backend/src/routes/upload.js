import express from 'express';
import multer  from 'multer';
import { upload, remove } from '../controllers/uploadController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

const multerUpload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Chỉ chấp nhận file ảnh'), false);
  },
});

router.post('/', authenticateToken, multerUpload.single('file'), upload);
router.delete('/', authenticateToken, remove); // body: { url } — xóa ảnh (rollback khi lưu lỗi)

export default router;
