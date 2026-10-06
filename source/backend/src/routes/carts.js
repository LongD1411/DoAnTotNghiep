import express from 'express';
import { getCart, addItem, updateItem, removeItem, sync } from '../controllers/cartController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

// Tất cả thao tác giỏ hàng server-side đều cần đăng nhập.
// Guest dùng giỏ localStorage phía client; đăng nhập thì gọi POST /cart/sync để merge.
router.get('/', authenticateToken, getCart);
router.post('/items', authenticateToken, addItem);
router.put('/items/:productId', authenticateToken, updateItem);
router.delete('/items/:productId', authenticateToken, removeItem);
router.post('/sync', authenticateToken, sync);

export default router;
