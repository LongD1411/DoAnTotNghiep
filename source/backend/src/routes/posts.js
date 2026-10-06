import express from 'express';
import multer  from 'multer';
import { getAll, getById, create, update, getModeration, moderate, remove } from '../controllers/postController.js';
import { authenticateToken, authorizeRole, optionalAuth } from '../middlewares/auth.js';

const router = express.Router();

// Ảnh trong bài viết gửi kèm request create (multipart): field `data` (JSON) + field `images` (File).
// Upload do controller xử lý SAU khi validate (tránh ảnh mồ côi khi lưu lỗi).
const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 10 * 1024 * 1024, files: 10 }, // trần mỗi file; TỔNG ≤ 10MB check ở controller
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Chỉ chấp nhận file ảnh'), false);
  },
});

router.get('/', optionalAuth, getAll);                                    // list (khách: chỉ bài published)
router.get('/pending', authenticateToken, authorizeRole(['mod', 'admin']), getModeration); // hàng chờ duyệt (staff) — PHẢI trước '/:id'
router.get('/:id', optionalAuth, getById);                               // chi tiết theo id hoặc slug
router.post('/', authenticateToken, imageUpload.array('images', 10), create); // đăng bài (đăng nhập)
router.put('/:id', authenticateToken, imageUpload.array('images', 10), update); // sửa bài của mình
router.patch('/:id/status', authenticateToken, authorizeRole(['mod', 'admin']), moderate); // duyệt/ẩn bài
router.delete('/:id', authenticateToken, remove);          // tác giả hoặc mod/admin (kiểm tra trong controller)

export default router;
