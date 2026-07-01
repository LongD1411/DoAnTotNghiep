import { z } from 'zod';
import { QuerySchema } from '../../common/schema.js';

export const CreateCategorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/).optional(),
});

export const UpdateCategorySchema = CreateCategorySchema.partial();

export const CategoryQuerySchema = QuerySchema;
