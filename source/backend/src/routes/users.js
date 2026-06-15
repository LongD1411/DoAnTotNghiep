import express from 'express';
import { getAll, getById, updateRole, remove } from '../controllers/usersController.js';
import { authenticateToken, authorizeRole } from '../middlewares/auth.js';

const router = express.Router();

// Admin-only: quản lý toàn bộ users
router.get('/', authenticateToken, authorizeRole(['admin']), getAll);
router.get('/:id', authenticateToken, authorizeRole(['admin']), getById);
router.put('/:id/role', authenticateToken, authorizeRole(['admin']), updateRole);
router.delete('/:id', authenticateToken, authorizeRole(['admin']), remove);

export default router;
