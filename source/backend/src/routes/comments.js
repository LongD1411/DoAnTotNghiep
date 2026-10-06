import express from 'express';
import multer  from 'multer';
import { getAll, create, update, remove } from '../controllers/commentController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

// Ảnh trong bình luận gửi kèm (multipart): field `data` (JSON) + field `images` (File).
// Upload do controller xử lý SAU khi validate (tránh ảnh mồ côi khi lưu lỗi).
const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 10 * 1024 * 1024, files: 10 }, // trần mỗi file; TỔNG ≤ 10MB check ở controller
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Chỉ chấp nhận file ảnh'), false);
  },
});

router.get('/', getAll);                                                          // list theo ?post_id= (công khai)
router.post('/', authenticateToken, imageUpload.array('images', 10), create);    // đăng bình luận (đăng nhập)
router.put('/:id', authenticateToken, imageUpload.array('images', 10), update);  // sửa (tác giả)
router.delete('/:id', authenticateToken, remove);                                // xoá (tác giả hoặc mod/admin)

export default router;
