import { z } from 'zod';

export const CreateCommentSchema = z.object({
  post_id: z.number().int().positive(),
  content: z.string().min(1), // HTML; ảnh mới dùng placeholder __IMG_0__, __IMG_1__...
});

export const UpdateCommentSchema = z.object({
  content: z.string().min(1),
});

export const CommentQuerySchema = z.object({
  post_id: z.coerce.number().int().positive(),
  page:  z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
});
