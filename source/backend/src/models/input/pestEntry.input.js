import { z } from 'zod';

const CATEGORIES = ['Côn trùng', 'Bệnh nấm', 'Vi khuẩn', 'Virus', 'Tuyến trùng', 'Nhện hại'];
const SEVERITIES = ['NGUY_HIEM', 'NANG', 'TRUNG_BINH'];

export const CreatePestEntrySchema = z.object({
  name:                    z.string().min(1),
  latin_name:              z.string().optional(),
  slug:                    z.string().optional(),           // auto-gen nếu không truyền
  category:                z.enum(CATEGORIES),
  severity:                z.enum(SEVERITIES).default('TRUNG_BINH'),
  description:             z.string().optional(),
  conditions:              z.string().optional(),
  is_active:               z.boolean().default(true),
  images:                  z.array(z.string().url()).default([]),
  symptoms:                z.array(z.string().min(1)).default([]),
  treatment:               z.array(z.string().min(1)).default([]),
  crop_types:              z.array(z.string().min(1)).default([]),
  recommended_product_ids: z.array(z.number().int().positive()).default([]),
});

export const UpdatePestEntrySchema = z.object({
  name:                    z.string().min(1).optional(),
  latin_name:              z.string().optional().nullable(),
  slug:                    z.string().optional(),
  category:                z.enum(CATEGORIES).optional(),
  severity:                z.enum(SEVERITIES).optional(),
  description:             z.string().optional().nullable(),
  conditions:              z.string().optional().nullable(),
  is_active:               z.boolean().optional(),
  images:                  z.array(z.string().url()).optional(),
  symptoms:                z.array(z.string().min(1)).optional(),
  treatment:               z.array(z.string().min(1)).optional(),
  crop_types:              z.array(z.string().min(1)).optional(),
  recommended_product_ids: z.array(z.number().int().positive()).optional(),
});

export const PestEntryQuerySchema = z.object({
  search:   z.string().optional(),
  category: z.string().optional(),
  severity: z.enum(SEVERITIES).optional(),
  page:     z.coerce.number().int().positive().default(1),
  limit:    z.coerce.number().int().positive().max(100).default(20),
});
