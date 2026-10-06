export const ForumCategoryOutput = (c) => ({
  id:          c.id,
  name:        c.name,
  slug:        c.slug,
  description: c.description ?? null,
  order:       c.order,
  post_count:  c._count?.posts ?? undefined,
});
