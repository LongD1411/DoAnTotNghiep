export const PostOutput = (p) => ({
  id:         p.id,
  title:      p.title,
  slug:       p.slug,
  content:    p.content,
  status:     p.status,
  view_count: p.viewCount,
  like_count: p.likeCount,
  is_pinned:  p.isPinned,
  category:   p.category ? { id: p.category.id, name: p.category.name, slug: p.category.slug } : undefined,
  user:       p.user ? { id: p.user.id, name: p.user.name, avatar: p.user.avatar ?? null } : undefined,
  comment_count: p._count?.comments ?? undefined,
  created_at: p.createdAt,
  updated_at: p.updatedAt,
});

export const PostListOutput = ({ data, total, page, limit }) => ({
  data: data.map(PostOutput),
  total,
  page,
  limit,
});
