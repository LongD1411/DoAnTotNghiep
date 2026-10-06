import { z } from 'zod';

export const CreatePostSchema = z.object({
  title:       z.string().trim().min(10).max(40), // khớp FE: min 10, max 40
  category_id: z.number().int().positive(),
  content:     z.string().nullish(), // HTML; không bắt buộc, có thể null
});

export const PostQuerySchema = z.object({
  search:      z.string().optional(),
  category_id: z.coerce.number().int().positive().optional(),
  status:      z.enum(['published', 'pending', 'hidden']).optional(), // lọc theo trạng thái (staff)
  page:  z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

// Mod/Admin duyệt bài: published (duyệt) | hidden (ẩn) | pending (trả lại chờ)
export const ModeratePostSchema = z.object({
  status: z.enum(['published', 'pending', 'hidden']),
});
