import express from 'express';
import { register, login, refresh, logout, getProfile, updateProfile, changePassword } from '../controllers/authController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login',    login);
router.post('/refresh',  refresh);
router.post('/logout',   logout);
router.get('/me',        authenticateToken, getProfile);
router.put('/me',        authenticateToken, updateProfile);
router.put('/me/password', authenticateToken, changePassword);

export default router;
