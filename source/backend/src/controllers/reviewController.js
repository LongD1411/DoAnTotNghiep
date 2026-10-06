import prisma from '../config/database.js';
import { CreateReviewSchema, ReviewQuerySchema } from '../models/input/review.input.js';
import { ReviewOutput, ReviewListOutput } from '../models/output/review.output.js';
import { respond, ERR, SCN } from '../common/response.js';

const USER_SELECT = { id: true, name: true, avatar: true };

// GET /reviews?product_id=&page=&limit= — danh sách review 1 sản phẩm + summary (average/total/distribution)
const getAll = async (req, res) => {
  const result = ReviewQuerySchema.safeParse(req.query);
  if (!result.success) return respond.badRequest(res, ERR.VALIDATION);

  const { product_id, page, limit } = result.data;
  const where = { productId: product_id };
  try {
    const [reviews, total, grouped] = await Promise.all([
      prisma.review.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: { user: { select: USER_SELECT } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.review.count({ where }),
      prisma.review.groupBy({ by: ['rating'], where, _count: { rating: true } }),
    ]);

    // distribution[0] = %5★ ... distribution[4] = %1★
    const counts = [0, 0, 0, 0, 0];
    let sum = 0;
    grouped.forEach(g => { counts[5 - g.rating] = g._count.rating; sum += g.rating * g._count.rating; });
    const average = total ? Math.round((sum / total) * 10) / 10 : 0;
    const distribution = counts.map(c => (total ? Math.round((c / total) * 100) : 0));

    respond.ok(res, SCN.OK, ReviewListOutput({ data: reviews, total, page, limit, summary: { average, total, distribution } }));
  } catch {
    respond.serverError(res, ERR.SERVER);
  }
};

// POST /reviews — đánh giá theo LẦN MUA: mỗi order item (đơn đã nhận của user) review 1 lần
const ORDER_DONE = ['delivered', 'completed'];

const create = async (req, res) => {
  const result = CreateReviewSchema.safeParse(req.body);
  if (!result.success) return respond.badRequest(res, ERR.VALIDATION);

  const { order_item_id, rating, comment } = result.data;
  const userId = req.user.id;
  try {
    const orderItem = await prisma.orderItem.findUnique({
      where:  { id: order_item_id },
      include: { order: { select: { userId: true, status: true } } },
    });
    // phải là order item của chính user + đơn đã nhận hàng
    if (!orderItem || orderItem.order.userId !== userId) return respond.badRequest(res, ERR.REVIEW_NOT_ALLOWED);
    if (!ORDER_DONE.includes(orderItem.order.status))     return respond.badRequest(res, ERR.REVIEW_NOT_ALLOWED);

    const review = await prisma.review.create({
      data: {
        productId:        orderItem.productId,
        userId,
        orderItemId:      order_item_id,
        rating,
        comment:          comment ?? null,
        verifiedPurchase: true,
      },
      include: { user: { select: USER_SELECT } },
    });
    respond.created(res, SCN.CREATED, ReviewOutput(review));
  } catch (err) {
    if (err.code === 'P2002') return respond.badRequest(res, ERR.REVIEW_DUP);   // lần mua này đã đánh giá
    if (err.code === 'P2003') return respond.badRequest(res, ERR.VALIDATION);
    respond.serverError(res, ERR.SERVER);
  }
};

export { getAll, create };
