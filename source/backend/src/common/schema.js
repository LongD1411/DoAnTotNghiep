import { z } from 'zod';

// Shared pagination + search schema — reused by all resource query schemas
export const QuerySchema = z.object({
  search: z.string().optional(),
  page:   z.coerce.number().int().positive().default(1),
  limit:  z.coerce.number().int().positive().max(100).default(20),
});

// Generic list output factory — wraps any item serializer
export const listOutput = (serializerFn) =>
  ({ data, total, page, limit }) => ({
    data:  data.map(serializerFn),
    total,
    page,
    limit,
  });
