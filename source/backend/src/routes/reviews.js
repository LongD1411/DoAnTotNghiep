import express from 'express';
import { getAll, create } from '../controllers/reviewController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', getAll);                       // public — xem review theo sản phẩm
router.post('/', authenticateToken, create);   // đăng nhập — gửi đánh giá

export default router;
