// Coi là đã sửa nếu updatedAt lệch createdAt > 1s (tránh false-positive do rounding lúc tạo)
const _isEdited = (c) =>
  !!(c.createdAt && c.updatedAt && new Date(c.updatedAt).getTime() - new Date(c.createdAt).getTime() > 1000);

export const CommentOutput = (c) => ({
  id:         c.id,
  post_id:    c.postId,
  content:    c.content,
  user:       c.user ? { id: c.user.id, name: c.user.name, avatar: c.user.avatar ?? null } : undefined,
  is_edited:  _isEdited(c),
  created_at: c.createdAt,
  updated_at: c.updatedAt,
});

export const CommentListOutput = ({ data, total, page, limit }) => ({
  data: data.map(CommentOutput),
  total,
  page,
  limit,
});
