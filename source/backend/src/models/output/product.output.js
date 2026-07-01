import { listOutput } from '../../common/schema.js';

export const ProductOutput = (product) => ({
  id:             product.id,
  name:           product.name,
  slug:           product.slug,
  description:    product.description,
  price:          product.price,
  discount_price: product.discountPrice  ?? null,
  unit:           product.unit,
  stock:          product.stock,
  sold:           product.sold,
  image_url:      product.imageUrl       ?? null,
  images:         product.images?.map(img => ({ id: img.id, url: img.url, order: img.order })) ?? [],
  category_id:    product.categoryId,
  category:       product.category ? { id: product.category.id, name: product.category.name, slug: product.category.slug } : undefined,
  weight:         product.weight         ?? null,
  weight_unit:    product.weightUnit     ?? null,
  specifications: product.specifications ?? null,
  safety_note:    product.safetyNote     ?? null,
  hazard_level:   product.hazardLevel    ?? 'NONE',
  hazard_note:    product.hazardNote     ?? null,
  video_url:      product.videoUrl       ?? null,
  badge:          product.badge          ?? null,
  is_active:      product.isActive,
  created_at:     product.createdAt,
  updated_at:     product.updatedAt,
});

export const ProductListOutput = listOutput(ProductOutput);
