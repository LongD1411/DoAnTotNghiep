import express from 'express';
import { create, getAll, getById, update, cancel } from '../controllers/orderController.js';
import { authenticateToken, authorizeRole } from '../middlewares/auth.js';

const router = express.Router();

// Tất cả thao tác đơn hàng đều cần đăng nhập.
router.post('/',          authenticateToken, create);               // tạo đơn từ giỏ server-side
router.get('/',           authenticateToken, getAll);               // đơn của tôi (admin: tất cả)
router.get('/:id',        authenticateToken, getById);              // chi tiết (chủ đơn / admin)
router.put('/:id/cancel', authenticateToken, cancel);               // chủ đơn tự huỷ (khi còn pending)
router.put('/:id',        authenticateToken, authorizeRole(['admin']), update); // admin cập nhật trạng thái/thanh toán

export default router;
