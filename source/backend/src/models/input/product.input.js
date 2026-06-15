import { z } from 'zod';
import { QuerySchema } from '../../common/schema.js';

export const CreateProductSchema = z.object({
  name:           z.string().min(1),
  price:          z.number().nonnegative(),
  category_id:    z.number().int().positive(),
  description:    z.string().optional(),
  stock:          z.number().int().nonnegative().default(0),
  images:         z.array(z.string().url()).max(5).optional(),
  unit:           z.string().optional(),
  discount_price: z.number().nonnegative().optional(),
  origin:         z.string().optional(),
  weight:         z.number().nonnegative().optional(),
  expiry_days:    z.number().int().nonnegative().optional(),
  is_active:      z.boolean().optional(),
});

export const UpdateProductSchema = CreateProductSchema.partial();

export const ProductQuerySchema = QuerySchema;
