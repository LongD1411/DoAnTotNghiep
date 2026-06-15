import express from 'express';
import { register, login, refresh, logout, getProfile } from '../controllers/authController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login',    login);
router.post('/refresh',  refresh);
router.post('/logout',   logout);
router.get('/me',        authenticateToken, getProfile);

export default router;
