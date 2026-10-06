import express from 'express';
import multer  from 'multer';
import { getAll, getById, create, update, remove } from '../controllers/productController.js';
import { authenticateToken, authorizeRole, optionalAuth } from '../middlewares/auth.js';

const router = express.Router();

// Ảnh sản phẩm gửi kèm request create/update (multipart): field `data` (JSON) + field `images` (File).
// Upload lên storage do controller xử lý SAU khi validate — tránh ảnh mồ côi khi lưu lỗi.
const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 5 * 1024 * 1024, files: 5 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Chỉ chấp nhận file ảnh'), false);
  },
});

router.get('/', optionalAuth, getAll);
router.get('/:id', optionalAuth, getById);
router.post('/',    authenticateToken, authorizeRole(['admin']), imageUpload.array('images', 5), create);
router.put('/:id',  authenticateToken, authorizeRole(['admin']), imageUpload.array('images', 5), update);
router.delete('/:id', authenticateToken, authorizeRole(['admin']), remove);

export default router;
