import prisma from '../config/database.js';
import { CreateProductSchema, UpdateProductSchema, ProductQuerySchema } from '../models/input/product.input.js';
import { ProductOutput, ProductListOutput } from '../models/output/product.output.js';
import { respond, ERR, SCN } from '../common/response.js';

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

const getAll = async (req, res) => {
  const result = ProductQuerySchema.safeParse(req.query);
  if (!result.success) return respond.badRequest(res, ERR.VALIDATION);

  const { search, page, limit } = result.data;
  try {
    const where = search ? { name: { contains: search, mode: 'insensitive' } } : {};
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
  try {
    const product = await prisma.product.findUnique({
      where:   { id: parseInt(id) },
      include: { category: true, images: { orderBy: { order: 'asc' } } },
    });
    if (!product) return respond.notFound(res, ERR.NOT_FOUND);
    respond.ok(res, SCN.OK, ProductOutput(product));
  } catch {
    respond.serverError(res, ERR.SERVER);
  }
};

const create = async (req, res) => {
  const result = CreateProductSchema.safeParse(req.body);
  if (!result.success) return respond.badRequest(res, ERR.VALIDATION);

  const {
    name, price, category_id, description, stock, images,
    unit, discount_price, origin, weight, expiry_days, is_active,
  } = result.data;

  const slug = `${toSlug(name)}-${Date.now()}`;

  try {
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description:   description    ?? null,
        price,
        stock,
        unit:          unit            ?? 'kg',
        imageUrl:      images?.[0]    ?? null,
        categoryId:    category_id,
        discountPrice: discount_price  ?? null,
        origin:        origin          ?? null,
        weight:        weight          ?? null,
        expiryDays:    expiry_days     ?? null,
        isActive:      is_active       ?? true,
        ...(images?.length && {
          images: { create: images.map((url, i) => ({ url, order: i })) },
        }),
      },
      include: { category: true, images: { orderBy: { order: 'asc' } } },
    });
    respond.created(res, SCN.CREATED, ProductOutput(product));
  } catch (err) {
    if (err.code === 'P2003') return respond.badRequest(res, ERR.VALIDATION);
    respond.serverError(res, ERR.SERVER);
  }
};

const update = async (req, res) => {
  const { id } = req.params;
  const result = UpdateProductSchema.safeParse(req.body);
  if (!result.success) return respond.badRequest(res, ERR.VALIDATION);

  const { category_id, images, discount_price, expiry_days, is_active, ...rest } = result.data;
  const scalarData = {
    ...rest,
    ...(category_id    !== undefined && { categoryId:    category_id    }),
    ...(discount_price !== undefined && { discountPrice: discount_price }),
    ...(expiry_days    !== undefined && { expiryDays:    expiry_days    }),
    ...(is_active      !== undefined && { isActive:      is_active      }),
    ...(images         !== undefined && { imageUrl:      images[0] ?? null }),
  };

  if (Object.keys(scalarData).length === 0 && images === undefined) {
    return respond.badRequest(res, ERR.NO_UPDATE);
  }

  const data = {
    ...scalarData,
    ...(images !== undefined && {
      images: {
        deleteMany: {},
        create: images.map((url, i) => ({ url, order: i })),
      },
    }),
  };

  try {
    const product = await prisma.product.update({
      where:   { id: parseInt(id) },
      data,
      include: { category: true, images: { orderBy: { order: 'asc' } } },
    });
    respond.ok(res, SCN.UPDATED, ProductOutput(product));
  } catch (err) {
    if (err.code === 'P2025') return respond.notFound(res, ERR.NOT_FOUND);
    if (err.code === 'P2003') return respond.badRequest(res, ERR.VALIDATION);
    respond.serverError(res, ERR.SERVER);
  }
};

const remove = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.product.delete({ where: { id: parseInt(id) } });
    respond.ok(res, SCN.DELETED, null);
  } catch (err) {
    if (err.code === 'P2025') return respond.notFound(res, ERR.NOT_FOUND);
    respond.serverError(res, ERR.SERVER);
  }
};

export { getAll, getById, create, update, remove };
