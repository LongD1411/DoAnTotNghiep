import { z } from 'zod';

export const CreateReviewSchema = z.object({
  order_item_id: z.number().int().positive(), // đánh giá theo lần mua (order item)
  rating:        z.number().int().min(1).max(5),
  comment:       z.string().max(2000).optional(),
});

// Query: bắt buộc product_id (xem review theo sản phẩm)
export const ReviewQuerySchema = z.object({
  product_id: z.coerce.number().int().positive(),
  page:  z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});
