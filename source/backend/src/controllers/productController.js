import prisma from '../config/database.js';
import { CreateProductSchema, UpdateProductSchema, ProductQuerySchema } from '../models/input/product.input.js';
import { ProductOutput, ProductListOutput } from '../models/output/product.output.js';
import { respond, ERR, SCN } from '../common/response.js';
import { uploadToT3, deleteFromT3 } from '../utils/t3Storage.js';

const VI_MAP = {
  'à':'a','á':'a','ả':'a','ã':'a','ạ':'a','ă':'a','ắ':'a','ằ':'a','ẳ':'a','ẵ':'a','ặ':'a','â':'a','ấ':'a','ầ':'a','ẩ':'a','ẫ':'a','ậ':'a',
  'đ':'d',
  'è':'e','é':'e','ẻ':'e','ẽ':'e','ẹ':'e','ê':'e','ế':'e','ề':'e','ể':'e','ễ':'e','ệ':'e',
  'ì':'i','í':'i','ỉ':'i','ĩ':'i','ị':'i',
  'ò':'o','ó':'o','ỏ':'o','õ':'o','ọ':'o','ô':'o','ố':'o','ồ':'o','ổ':'o','ỗ':'o','ộ':'o','ơ':'o','ớ':'o','ờ':'o','ở':'o','ỡ':'o','ợ':'o',
  'ù':'u','ú':'u','ủ':'u','ũ':'u','ụ':'u','ư':'u','ứ':'u','ừ':'u','ử':'u','ữ':'u','ự':'u',
  'ỳ':'y','ý':'y','ỷ':'y','ỹ':'y','ỵ':'y',
};

const toSlug = (str) => {
  let s = str.toLowerCase();
  for (const [k, v] of Object.entries(VI_MAP)) s = s.split(k).join(v);
  return s.replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-');
};

// ── Ảnh (multipart) ────────────────────────────────────────────────────────────
// Form gửi multipart: field `data` (JSON các trường) + field `images` (các File mới).
// Upload chỉ chạy SAU khi validate; nếu lưu DB lỗi thì rollback ảnh vừa upload.
const MAX_IMAGES = 5;

const parseData = (req) => {
  try { return JSON.parse(req.body?.data ?? '{}'); }
  catch { return null; }
};

const deleteImages = (urls) => Promise.all(urls.map(u => deleteFromT3(u).catch(() => {})));

// Upload các File → URL. Nếu 1 file lỗi → rollback các file đã lên rồi throw.
const uploadFiles = async (files = []) => {
  const results = await Promise.allSettled(files.map(f => {
    const ext  = f.originalname.split('.').pop().toLowerCase();
    const name = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    return uploadToT3(f.buffer, name, f.mimetype);
  }));
  const ok = results.filter(r => r.status === 'fulfilled').map(r => r.value);
  if (results.some(r => r.status === 'rejected')) {
    await deleteImages(ok);
    throw new Error('upload failed');
  }
  return ok;
};

const getAll = async (req, res) => {
  const result = ProductQuerySchema.safeParse(req.query);
  if (!result.success) return respond.badRequest(res, ERR.VALIDATION);

  const { search, page, limit } = result.data;
  const isAdmin = req.user?.role === 'admin';
  try {
    const where = {
      deletedAt: null, // ẩn sản phẩm đã xóa (soft-delete)
      ...(search ? { name: { contains: search } } : {}),
      ...(isAdmin ? {} : { isActive: true }), // khách chỉ thấy sản phẩm đang bán
    };
    const [products, total] = await Promise.all([
      prisma.product.findMany({ where, skip: (page - 1) * limit, take: limit, include: { category: true }, orderBy: { createdAt: 'desc' } }),
      prisma.product.count({ where }),
    ]);
    respond.ok(res, SCN.OK, ProductListOutput({ data: products, total, page, limit }));
  } catch {
    respond.serverError(res, ERR.SERVER);
  }
};

const getById = async (req, res) => {
  const { id } = req.params;
  const isNumeric = /^\d+$/.test(id);
  const isAdmin = req.user?.role === 'admin';
  try {
    const product = await prisma.product.findUnique({
      where:   isNumeric ? { id: parseInt(id) } : { slug: id }, // hỗ trợ cả id và slug
      include: { category: true, images: { orderBy: { order: 'asc' } } },
    });
    if (!product || product.deletedAt) return respond.notFound(res, ERR.NOT_FOUND); // đã xóa (soft-delete)
    if (!isAdmin && !product.isActive) return respond.notFound(res, ERR.NOT_FOUND); // ẩn hàng đã tắt với khách
    respond.ok(res, SCN.OK, ProductOutput(product));
  } catch (err) {
    console.error('[product.getById]', err.code, err.message); // lộ lỗi thật để debug
    respond.serverError(res, ERR.SERVER);
  }
};

const create = async (req, res) => {
  const body = parseData(req);
  if (!body) { console.error('[product.create] JSON parse fail; body.data =', req.body?.data); return respond.badRequest(res, ERR.VALIDATION); }

  const result = CreateProductSchema.safeParse(body);
  if (!result.success) {
    console.error('[product.create] validation FAIL:', JSON.stringify(result.error.issues));
    console.error('[product.create] body keys =', Object.keys(body), '| files =', (req.files ?? []).length);
    return respond.badRequest(res, ERR.VALIDATION); // ← chưa upload gì
  }

  const {
    name, slug: inputSlug, price, category_id, description, stock, existing_images,
    unit, discount_price, weight, weight_unit, is_active,
    specifications, safety_note, hazard_level, hazard_note, video_url, badge,
  } = result.data;

  const files = req.files ?? [];
  if ((existing_images?.length ?? 0) + files.length > MAX_IMAGES) {
    return respond.badRequest(res, ERR.VALIDATION);
  }

  const slug = inputSlug?.trim() || `${toSlug(name)}-${Date.now()}`;

  // Upload SAU khi validate — validate lỗi thì không có ảnh nào lên server
  let uploaded;
  try {
    uploaded = await uploadFiles(files);
  } catch {
    return respond.serverError(res, ERR.SERVER);
  }
  const images = [...(existing_images ?? []), ...uploaded];

  try {
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description:   description    ?? null,
        price,
        stock,
        unit:          unit            ?? 'bao',
        imageUrl:      images[0]      ?? null,
        categoryId:    category_id,
        discountPrice: discount_price  ?? null,
        weight:        weight          ?? null,
        weightUnit:    weight_unit     ?? 'kg',
        specifications: specifications ?? null,
        safetyNote:    safety_note     ?? null,
        hazardLevel:   hazard_level    ?? 'NONE',
        hazardNote:    hazard_note     ?? null,
        videoUrl:      video_url       ?? null,
        badge:         badge           ?? null,
        isActive:      is_active       ?? true,
        ...(images.length && {
          images: { create: images.map((url, i) => ({ url, order: i })) },
        }),
      },
      include: { category: true, images: { orderBy: { order: 'asc' } } },
    });
    respond.created(res, SCN.CREATED, ProductOutput(product));
  } catch (err) {
    await deleteImages(uploaded); // ← lưu DB lỗi → xóa ảnh vừa upload, không để rác
    console.error('[product.create]', err.code, err.message);
    if (err.code === 'P2002') return respond.badRequest(res, ERR.VALIDATION); // slug trùng
    if (err.code === 'P2003') return respond.badRequest(res, ERR.VALIDATION);
    respond.serverError(res, ERR.SERVER);
  }
};

const update = async (req, res) => {
  const { id } = req.params;
  if (!/^\d+$/.test(id)) return respond.notFound(res, ERR.NOT_FOUND);

  const body = parseData(req);
  if (!body) { console.error('[product.update] JSON parse fail; body.data =', req.body?.data); return respond.badRequest(res, ERR.VALIDATION); }

  const result = UpdateProductSchema.safeParse(body);
  if (!result.success) {
    console.error('[product.update] validation FAIL:', JSON.stringify(result.error.issues));
    return respond.badRequest(res, ERR.VALIDATION);
  }

  const {
    category_id, existing_images, discount_price, is_active, safety_note,
    hazard_level, weight_unit, hazard_note, video_url, ...rest
  } = result.data;

  const files = req.files ?? [];
  const hasImageIntent = existing_images !== undefined || files.length > 0;
  if ((existing_images?.length ?? 0) + files.length > MAX_IMAGES) {
    return respond.badRequest(res, ERR.VALIDATION);
  }

  const scalarData = {
    ...rest,
    ...(category_id    !== undefined && { categoryId:    category_id    }),
    ...(discount_price !== undefined && { discountPrice: discount_price }),
    ...(is_active      !== undefined && { isActive:      is_active      }),
    ...(safety_note    !== undefined && { safetyNote:    safety_note    }),
    ...(hazard_level   !== undefined && { hazardLevel:   hazard_level   }),
    ...(weight_unit    !== undefined && { weightUnit:    weight_unit    }),
    ...(hazard_note    !== undefined && { hazardNote:    hazard_note     }),
    ...(video_url      !== undefined && { videoUrl:      video_url      }),
  };

  if (Object.keys(scalarData).length === 0 && !hasImageIntent) {
    return respond.badRequest(res, ERR.NO_UPDATE);
  }

  // Ảnh cũ (để dọn file bị gỡ sau khi update thành công)
  let oldUrls = [];
  if (hasImageIntent) {
    const current = await prisma.product.findUnique({
      where:  { id: parseInt(id) },
      select: { imageUrl: true, images: { select: { url: true } } },
    });
    if (!current) return respond.notFound(res, ERR.NOT_FOUND);
    oldUrls = [...new Set([current.imageUrl, ...current.images.map(i => i.url)].filter(Boolean))];
  }

  // Upload SAU khi validate
  let uploaded = [];
  try {
    uploaded = await uploadFiles(files);
  } catch {
    return respond.serverError(res, ERR.SERVER);
  }

  const finalImages = hasImageIntent ? [...(existing_images ?? []), ...uploaded] : [];
  const data = { ...scalarData };
  if (hasImageIntent) {
    data.imageUrl = finalImages[0] ?? null;
    data.images   = { deleteMany: {}, create: finalImages.map((url, i) => ({ url, order: i })) };
  }

  try {
    const product = await prisma.product.update({
      where:   { id: parseInt(id) },
      data,
      include: { category: true, images: { orderBy: { order: 'asc' } } },
    });
    // Dọn ảnh cũ đã bị gỡ (không còn trong danh sách mới) — tránh rác trên storage
    if (hasImageIntent) {
      await deleteImages(oldUrls.filter(u => !finalImages.includes(u)));
    }
    respond.ok(res, SCN.UPDATED, ProductOutput(product));
  } catch (err) {
    await deleteImages(uploaded); // ← lưu DB lỗi → xóa ảnh vừa upload
    console.error('[product.update]', err.code, err.message);
    if (err.code === 'P2025') return respond.notFound(res, ERR.NOT_FOUND);
    if (err.code === 'P2002') return respond.badRequest(res, ERR.VALIDATION); // slug trùng
    if (err.code === 'P2003') return respond.badRequest(res, ERR.VALIDATION);
    respond.serverError(res, ERR.SERVER);
  }
};

const remove = async (req, res) => {
  const { id } = req.params;
  try {
    // Soft-delete: đánh dấu deletedAt thay vì xóa cứng — giữ lịch sử đơn hàng, tránh FK với OrderItem
    await prisma.product.update({ where: { id: parseInt(id) }, data: { deletedAt: new Date() } });
    respond.ok(res, SCN.DELETED, null);
  } catch (err) {
    if (err.code === 'P2025') return respond.notFound(res, ERR.NOT_FOUND);
    respond.serverError(res, ERR.SERVER);
  }
};

export { getAll, getById, create, update, remove };
