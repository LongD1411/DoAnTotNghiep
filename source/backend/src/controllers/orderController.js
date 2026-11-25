import prisma from '../config/database.js';
import { CreateOrderSchema, UpdateOrderSchema, OrderQuerySchema, CancelOrderSchema } from '../models/input/order.input.js';
import { OrderOutput, OrderListOutput, orderCode } from '../models/output/order.output.js';
import { respond, ERR, SCN } from '../common/response.js';
import { notify, notifyStaff } from '../utils/notificationHub.js';

// Nhãn trạng thái (VN) cho nội dung thông báo
const STATUS_VI = { pending: 'Chờ xử lý', approved: 'Đã xác nhận', delivering: 'Đang giao', delivered: 'Đã giao', completed: 'Hoàn tất', cancelled: 'Đã huỷ' };

// Phí ship tính SERVER (không tin client): phẳng 30k, miễn phí khi đạt ngưỡng.
const SHIPPING_FEE = 30000;
const FREE_SHIP_THRESHOLD = 500000;

// Include chuẩn để serialize 1 đơn đầy đủ (địa chỉ + item + ảnh chính sản phẩm)
const ORDER_INCLUDE = {
  address: true,
  orderItems: {
    orderBy: { id: 'asc' },
    include: {
      product: {
        select: {
          id: true, name: true, slug: true, unit: true, imageUrl: true,
          images: { select: { url: true }, orderBy: { order: 'asc' }, take: 1 },
        },
      },
    },
  },
};

const priceOf = (p) => p.discountPrice ?? p.price; // giá hiệu lực tại thời điểm mua

// POST /orders — tạo đơn từ giỏ server-side của user hiện tại (atomic qua $transaction)
const create = async (req, res) => {
  const result = CreateOrderSchema.safeParse(req.body);
  if (!result.success) return respond.badRequest(res, ERR.VALIDATION);

  const { address, payment_method, note } = result.data;
  const userId = req.user.id;
  try {
    // Giỏ server-side
    const cart = await prisma.cart.findUnique({ where: { userId } });
    const items = cart
      ? await prisma.cartItem.findMany({ where: { cartId: cart.id }, include: { product: true } })
      : [];
    if (!items.length) return respond.badRequest(res, ERR.CART_EMPTY);

    // Chặn sản phẩm hết hàng / ngừng kinh doanh / vượt tồn kho — tính tiền theo GIÁ DB
    for (const it of items) {
      const p = it.product;
      if (!p || !p.isActive || p.deletedAt || p.stock <= 0 || it.quantity > p.stock)
        return respond.badRequest(res, ERR.OUT_OF_STOCK);
    }
    const subtotal    = items.reduce((s, it) => s + priceOf(it.product) * it.quantity, 0);
    const shippingFee = subtotal >= FREE_SHIP_THRESHOLD ? 0 : SHIPPING_FEE;
    const total       = subtotal + shippingFee;

    const order = await prisma.$transaction(async (tx) => {
      const addr = await tx.address.create({
        data: {
          userId,
          fullName: address.full_name,
          phone:    address.phone,
          street:   address.street,
          ward:     address.ward ?? null,
          district: address.district,
          city:     address.city,
          zip:      address.zip ?? null,
        },
      });
      const created = await tx.order.create({
        data: {
          userId,
          addressId:     addr.id,
          status:        'pending',
          paymentMethod: payment_method,
          paymentStatus: 'unpaid',
          total,
          shippingFee,
          discount:      0,
          note:          note ?? null,
          orderItems: {
            create: items.map(it => ({ productId: it.productId, quantity: it.quantity, price: priceOf(it.product) })),
          },
        },
      });
      // Trừ tồn kho + tăng lượt bán
      for (const it of items) {
        await tx.product.update({
          where: { id: it.productId },
          data:  { stock: { decrement: it.quantity }, sold: { increment: it.quantity } },
        });
      }
      // Xoá sạch giỏ sau khi đã chuyển thành đơn
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      return tx.order.findUnique({ where: { id: created.id }, include: ORDER_INCLUDE });
    });

    // ── Thông báo realtime (fire-and-forget) ────────────────────────────────
    const code = orderCode(order.id);
    notifyStaff({ type: 'order', title: 'Đơn hàng mới', body: `${code} vừa được đặt · ${total.toLocaleString('vi-VN')}đ`, refId: order.id, refType: 'order' });
    for (const it of items) {
      const left = it.product.stock - it.quantity;
      if (left <= 5) notifyStaff({ type: 'inventory', title: 'Sắp hết hàng', body: `"${it.product.name}" chỉ còn ${left} trong kho`, refId: it.productId, refType: 'product' });
    }

    respond.created(res, SCN.CREATED, OrderOutput(order));
  } catch (err) {
    console.error('[order.create]', err.code, err.message);
    respond.serverError(res, ERR.SERVER);
  }
};

// GET /orders — đơn của user hiện tại; admin thấy tất cả + lọc status/payment_status
const getAll = async (req, res) => {
  const result = OrderQuerySchema.safeParse(req.query);
  if (!result.success) return respond.badRequest(res, ERR.VALIDATION);

  const { page, limit, status, payment_status } = result.data;
  const isAdmin = req.user.role === 'admin';
  const where = {
    ...(isAdmin ? {} : { userId: req.user.id }),
    ...(status ? { status } : {}),
    ...(payment_status ? { paymentStatus: payment_status } : {}),
  };
  try {
    const [orders, total] = await Promise.all([
      prisma.order.findMany({ where, skip: (page - 1) * limit, take: limit, include: ORDER_INCLUDE, orderBy: { createdAt: 'desc' } }),
      prisma.order.count({ where }),
    ]);
    respond.ok(res, SCN.OK, OrderListOutput({ data: orders, total, page, limit }));
  } catch (err) {
    console.error('[order.getAll]', err.code, err.message);
    respond.serverError(res, ERR.SERVER);
  }
};

// GET /orders/:id — chi tiết 1 đơn (chỉ chủ đơn hoặc admin)
const getById = async (req, res) => {
  const id = parseInt(req.params.id);
  if (Number.isNaN(id)) return respond.badRequest(res, ERR.VALIDATION);
  try {
    const order = await prisma.order.findUnique({ where: { id }, include: ORDER_INCLUDE });
    if (!order) return respond.notFound(res, ERR.NOT_FOUND);
    if (order.userId !== req.user.id && req.user.role !== 'admin') return respond.forbidden(res, ERR.NO_PERM);
    respond.ok(res, SCN.OK, OrderOutput(order));
  } catch (err) {
    console.error('[order.getById]', err.code, err.message);
    respond.serverError(res, ERR.SERVER);
  }
};

// PUT /orders/:id (admin) — cập nhật trạng thái đơn / thanh toán / lý do huỷ
const update = async (req, res) => {
  const id = parseInt(req.params.id);
  if (Number.isNaN(id)) return respond.badRequest(res, ERR.VALIDATION);

  const result = UpdateOrderSchema.safeParse(req.body);
  if (!result.success) return respond.badRequest(res, ERR.VALIDATION);

  const { status, payment_status, cancel_reason } = result.data;
  if (!status && !payment_status && cancel_reason === undefined) return respond.badRequest(res, ERR.NO_UPDATE);

  const data = {};
  if (status) {
    data.status = status;
    if (status === 'delivered') data.deliveredAt = new Date(); // mốc giao thành công
  }
  if (payment_status) data.paymentStatus = payment_status;
  if (cancel_reason !== undefined) data.cancelReason = cancel_reason;

  try {
    await prisma.order.update({ where: { id }, data });
    const order = await prisma.order.findUnique({ where: { id }, include: ORDER_INCLUDE });
    // Thông báo chủ đơn về thay đổi trạng thái / thanh toán
    const parts = [];
    if (status) parts.push(`trạng thái: ${STATUS_VI[status] ?? status}`);
    if (payment_status) parts.push(payment_status === 'paid' ? 'đã thanh toán' : payment_status === 'refunded' ? 'đã hoàn tiền' : 'chưa thanh toán');
    notify(order.userId, { type: 'order', title: 'Cập nhật đơn hàng', body: `Đơn ${orderCode(order.id)} — ${parts.join(', ')}`, refId: order.id, refType: 'order' });
    respond.ok(res, SCN.UPDATED, OrderOutput(order));
  } catch (err) {
    if (err.code === 'P2025') return respond.notFound(res, ERR.NOT_FOUND);
    console.error('[order.update]', err.code, err.message);
    respond.serverError(res, ERR.SERVER);
  }
};

// PUT /orders/:id/cancel — chủ đơn (hoặc admin) huỷ đơn khi còn 'pending'; hoàn lại tồn kho đã trừ
const cancel = async (req, res) => {
  const id = parseInt(req.params.id);
  if (Number.isNaN(id)) return respond.badRequest(res, ERR.VALIDATION);

  const result = CancelOrderSchema.safeParse(req.body);
  if (!result.success) return respond.badRequest(res, ERR.VALIDATION);

  try {
    const existing = await prisma.order.findUnique({ where: { id }, include: { orderItems: true } });
    if (!existing) return respond.notFound(res, ERR.NOT_FOUND);
    if (existing.userId !== req.user.id && req.user.role !== 'admin') return respond.forbidden(res, ERR.NO_PERM);
    if (existing.status !== 'pending') return respond.badRequest(res, ERR.ORDER_NOT_CANCELABLE);

    const order = await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id },
        data:  { status: 'cancelled', cancelReason: result.data.cancel_reason ?? null },
      });
      // Hoàn lại tồn kho + giảm lượt bán (đã cộng/trừ khi tạo đơn)
      for (const it of existing.orderItems) {
        await tx.product.update({
          where: { id: it.productId },
          data:  { stock: { increment: it.quantity }, sold: { decrement: it.quantity } },
        });
      }
      return tx.order.findUnique({ where: { id }, include: ORDER_INCLUDE });
    });

    notifyStaff({ type: 'order', title: 'Đơn hàng bị huỷ', body: `Đơn ${orderCode(order.id)} đã bị huỷ`, refId: order.id, refType: 'order' });
    respond.ok(res, SCN.UPDATED, OrderOutput(order));
  } catch (err) {
    console.error('[order.cancel]', err.code, err.message);
    respond.serverError(res, ERR.SERVER);
  }
};

export { create, getAll, getById, update, cancel };
