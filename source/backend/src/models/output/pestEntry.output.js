const sortByOrder = (arr) => [...arr].sort((a, b) => a.order - b.order);

export const PestEntryOutput = (entry) => ({
  id:          entry.id,
  name:        entry.name,
  latin_name:  entry.latinName   ?? null,
  slug:        entry.slug,
  category:    entry.category,
  severity:    entry.severity,
  description: entry.description ?? null,
  conditions:  entry.conditions  ?? null,
  is_active:   entry.isActive,
  view_count:  entry.viewCount,
  images:      entry.images     ? sortByOrder(entry.images).map(i => i.url)       : [],
  symptoms:    entry.symptoms   ? sortByOrder(entry.symptoms).map(s => s.content) : [],
  treatment:   entry.treatments ? sortByOrder(entry.treatments).map(t => t.content) : [],
  crop_types:  entry.cropTypes  ? entry.cropTypes.map(c => c.cropType)             : [],
  recommended_product_ids: entry.recommendedProducts
    ? entry.recommendedProducts.map(p => p.productId)
    : [],
  created_at: entry.createdAt,
  updated_at: entry.updatedAt,
});

// List: chỉ lấy ảnh đầu + số triệu chứng, không cần toàn bộ arrays
export const PestEntryListItemOutput = (entry) => ({
  id:           entry.id,
  name:         entry.name,
  latin_name:   entry.latinName ?? null,
  slug:         entry.slug,
  category:     entry.category,
  severity:     entry.severity,
  is_active:    entry.isActive,
  thumbnail:    entry.images?.length ? sortByOrder(entry.images)[0].url : null,
  symptom_count: entry._count?.symptoms ?? entry.symptoms?.length ?? 0,
  crop_types:   entry.cropTypes ? entry.cropTypes.map(c => c.cropType) : [],
});

export const PestEntryListOutput = ({ data, total, page, limit }) => ({
  data: data.map(PestEntryListItemOutput),
  total,
  page,
  limit,
});
