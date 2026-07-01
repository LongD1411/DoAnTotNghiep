import { z } from 'zod';
import { QuerySchema } from '../../common/schema.js';

export const CreateProductSchema = z.object({
  name:           z.string().min(1),
  slug:           z.string().min(1).regex(/^[a-z0-9-]+$/).optional(),
  price:          z.number().nonnegative(),
  category_id:    z.number().int().positive(),
  description:    z.string().optional(),
  stock:          z.number().int().nonnegative().default(0),
  images:         z.array(z.string().url()).max(5).optional(),
  unit:           z.string().optional(),
  discount_price: z.number().nonnegative().optional(),
  weight:         z.number().nonnegative().optional(),
  weight_unit:    z.enum(['kg', 'lít', 'ml']).optional(),
  is_active:      z.boolean().optional(),
  specifications: z.string().optional(),
  safety_note:    z.string().optional(),
  hazard_level:   z.enum(['NONE', 'TRUNG_BINH', 'NANG', 'NGUY_HIEM']).optional(),
  hazard_note:    z.string().optional(),
  video_url:      z.string().url().optional(),
  badge:          z.string().max(50).optional(),
});

export const UpdateProductSchema = CreateProductSchema.partial();

export const ProductQuerySchema = QuerySchema;
