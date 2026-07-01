import express from 'express';
import { getAll, getById, create, update, remove } from '../controllers/productController.js';
import { authenticateToken, authorizeRole, optionalAuth } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', optionalAuth, getAll);
router.get('/:id', optionalAuth, getById);
router.post('/', authenticateToken, authorizeRole(['admin']), create);
router.put('/:id', authenticateToken, authorizeRole(['admin']), update);
router.delete('/:id', authenticateToken, authorizeRole(['admin']), remove);

export default router;
