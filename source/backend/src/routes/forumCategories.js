import express from 'express';
import { getAll } from '../controllers/forumCategoryController.js';

const router = express.Router();

router.get('/', getAll); // public — danh sách chủ đề diễn đàn

export default router;
