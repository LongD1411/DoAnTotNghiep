import { z } from 'zod';

export const AddCartItemSchema = z.object({
  product_id: z.number().int().positive(),
  quantity:   z.number().int().positive().default(1),
});

export const UpdateCartItemSchema = z.object({
  quantity: z.number().int().positive(),
});

// Merge giỏ guest (client) vào giỏ user khi đăng nhập
export const SyncCartSchema = z.object({
  items: z.array(z.object({
    product_id: z.number().int().positive(),
    quantity:   z.number().int().positive(),
  })).max(100),
});
