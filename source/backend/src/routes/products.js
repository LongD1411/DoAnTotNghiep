import express from 'express';
import { getAll, getById, create, update, remove } from '../controllers/productController.js';
import { authenticateToken, authorizeRole } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', getAll);
router.get('/:id', getById);
router.post('/', authenticateToken, authorizeRole(['admin']), create);
router.put('/:id', authenticateToken, authorizeRole(['admin']), update);
router.delete('/:id', authenticateToken, authorizeRole(['admin']), remove);

export default router;
