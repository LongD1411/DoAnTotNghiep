import prisma from '../config/database.js';
import { AddCartItemSchema, UpdateCartItemSchema, SyncCartSchema } from '../models/input/cart.input.js';
import { CartOutput } from '../models/output/cart.output.js';
import { respond, ERR, SCN } from '../common/response.js';

const PRODUCT_SELECT = {
  select: {
    id: true, name: true, slug: true, price: true, discountPrice: true,
    unit: true, stock: true, imageUrl: true,
    images: { select: { url: true }, orderBy: { order: 'asc' }, take: 1 },
  },
};

const _getOrCreateCart = (userId) =>
  prisma.cart.upsert({ where: { userId }, create: { userId }, update: {} });

// Giỏ đầy đủ (kèm thông tin sản phẩm) — dùng làm response cho mọi mutation
const _fullCart = async (userId) => {
  const cart = await _getOrCreateCart(userId);
  const cartItems = await prisma.cartItem.findMany({
    where:   { cartId: cart.id },
    include: { product: PRODUCT_SELECT },
    orderBy: { id: 'asc' },
  });
  return CartOutput({ ...cart, cartItems });
};

// GET /cart — giỏ hàng của user hiện tại
const getCart = async (req, res) => {
  try {
    respond.ok(res, SCN.OK, await _fullCart(req.user.id));
  } catch (err) {
    console.error('[cart.getCart]', err.code, err.message);
    respond.serverError(res, ERR.SERVER);
  }
};

// Upsert 1 item: cộng dồn quantity (chặn trần theo stock). Trả false nếu sản phẩm không hợp lệ.
const _addItem = async (cartId, productId, quantity) => {
  const product = await prisma.product.findUnique({
    where:  { id: productId },
    select: { id: true, stock: true, isActive: true, deletedAt: true },
  });
  if (!product || !product.isActive || product.deletedAt || product.stock <= 0) return false;

  const existing = await prisma.cartItem.findUnique({
    where: { cartId_productId: { cartId, productId } },
  });
  const newQty = Math.min((existing?.quantity ?? 0) + quantity, product.stock);

  await prisma.cartItem.upsert({
    where:  { cartId_productId: { cartId, productId } },
    create: { cartId, productId, quantity: newQty },
    update: { quantity: newQty },
  });
  return true;
};

// POST /cart/items — thêm sản phẩm vào giỏ (cộng dồn nếu đã có)
const addItem = async (req, res) => {
  const result = AddCartItemSchema.safeParse(req.body);
  if (!result.success) return respond.badRequest(res, ERR.VALIDATION);

  const { product_id, quantity } = result.data;
  try {
    const cart = await _getOrCreateCart(req.user.id);
    const ok = await _addItem(cart.id, product_id, quantity);
    if (!ok) return respond.badRequest(res, ERR.OUT_OF_STOCK);
    respond.ok(res, SCN.OK, await _fullCart(req.user.id));
  } catch (err) {
    console.error('[cart.addItem]', err.code, err.message);
    respond.serverError(res, ERR.SERVER);
  }
};

// PUT /cart/items/:productId — đặt lại số lượng (chặn trần theo stock)
const updateItem = async (req, res) => {
  const result = UpdateCartItemSchema.safeParse(req.body);
  if (!result.success) return respond.badRequest(res, ERR.VALIDATION);

  const productId = parseInt(req.params.productId);
  try {
    const cart = await _getOrCreateCart(req.user.id);
    const product = await prisma.product.findUnique({ where: { id: productId }, select: { stock: true } });
    if (!product) return respond.notFound(res, ERR.NOT_FOUND);
    if (product.stock <= 0) return respond.badRequest(res, ERR.OUT_OF_STOCK); // nhất quán với addItem

    const updated = await prisma.cartItem.updateMany({
      where: { cartId: cart.id, productId },
      data:  { quantity: Math.min(result.data.quantity, product.stock) },
    });
    if (updated.count === 0) return respond.notFound(res, ERR.NOT_FOUND);
    respond.ok(res, SCN.UPDATED, await _fullCart(req.user.id));
  } catch (err) {
    console.error('[cart.updateItem]', err.code, err.message);
    respond.serverError(res, ERR.SERVER);
  }
};

// DELETE /cart/items/:productId — bỏ sản phẩm khỏi giỏ
const removeItem = async (req, res) => {
  const productId = parseInt(req.params.productId);
  try {
    const cart = await _getOrCreateCart(req.user.id);
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id, productId } });
    respond.ok(res, SCN.DELETED, await _fullCart(req.user.id));
  } catch (err) {
    console.error('[cart.removeItem]', err.code, err.message);
    respond.serverError(res, ERR.SERVER);
  }
};

// POST /cart/sync — merge giỏ guest (localStorage) vào giỏ user khi đăng nhập.
// Cộng dồn số lượng, sản phẩm không hợp lệ/hết hàng bị bỏ qua (không làm fail cả batch).
const sync = async (req, res) => {
  const result = SyncCartSchema.safeParse(req.body);
  if (!result.success) return respond.badRequest(res, ERR.VALIDATION);

  try {
    const cart = await _getOrCreateCart(req.user.id);
    for (const item of result.data.items) {
      await _addItem(cart.id, item.product_id, item.quantity);
    }
    respond.ok(res, SCN.OK, await _fullCart(req.user.id));
  } catch (err) {
    console.error('[cart.sync]', err.code, err.message);
    respond.serverError(res, ERR.SERVER);
  }
};

export { getCart, addItem, updateItem, removeItem, sync };
