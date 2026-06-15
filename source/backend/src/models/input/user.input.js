import { z } from 'zod';
import { QuerySchema } from '../../common/schema.js';

export const VALID_ROLES = ['customer', 'mod', 'admin'];

export const UpdateRoleSchema = z.object({
  role: z.enum(VALID_ROLES),
});

export const UserQuerySchema = QuerySchema;
