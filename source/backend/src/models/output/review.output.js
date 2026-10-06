export const ReviewOutput = (r) => ({
  id:                r.id,
  rating:            r.rating,
  comment:           r.comment ?? null,
  verified_purchase: r.verifiedPurchase,
  order_item_id:     r.orderItemId,
  user:              r.user ? { id: r.user.id, name: r.user.name, avatar: r.user.avatar ?? null } : undefined,
  created_at:        r.createdAt,
});

// List kèm summary: average (1 số thập phân), total, distribution [%5★, %4★, %3★, %2★, %1★]
export const ReviewListOutput = ({ data, total, page, limit, summary }) => ({
  data: data.map(ReviewOutput),
  total,
  page,
  limit,
  summary,
});
