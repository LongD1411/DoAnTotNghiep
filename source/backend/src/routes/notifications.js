import express from 'express';
import { getAll, markRead, markAllRead, stream } from '../controllers/notificationController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

router.get('/stream',     stream);                        // SSE realtime (auth qua ?token=)
router.get('/',           authenticateToken, getAll);     // danh sách của tôi + unread
router.put('/read-all',   authenticateToken, markAllRead);
router.put('/:id/read',   authenticateToken, markRead);

export default router;
