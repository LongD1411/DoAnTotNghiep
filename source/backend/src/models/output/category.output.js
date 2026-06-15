import { listOutput } from '../../common/schema.js';

export const CategoryOutput = (cat) => ({
  id:            cat.id,
  name:          cat.name,
  slug:          cat.slug,
  description:   cat.description ?? null,
  image_url:     cat.imageUrl    ?? null,
  product_count: cat._count?.products ?? undefined,
});

export const CategoryListOutput = listOutput(CategoryOutput);
