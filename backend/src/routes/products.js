import express from 'express';
import { getProducts, createProduct } from '../controllers/productController.js';
import { authenticateToken, authorizeRole } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', getProducts);
router.post('/', authenticateToken, authorizeRole(['admin']), createProduct);

export default router;