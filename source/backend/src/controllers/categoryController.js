import prisma from '../config/database.js';
import { CreateCategorySchema, UpdateCategorySchema, CategoryQuerySchema } from '../models/input/category.input.js';
import { CategoryOutput, CategoryListOutput } from '../models/output/category.output.js';
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
  const result = CategoryQuerySchema.safeParse(req.query);
  if (!result.success) return respond.badRequest(res, ERR.VALIDATION);

  const { search, page, limit } = result.data;
  try {
    const where = search ? { name: { contains: search } } : {};
    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: { _count: { select: { products: true } } },
        orderBy: { name: 'asc' },
      }),
      prisma.category.count({ where }),
    ]);
    respond.ok(res, SCN.OK, CategoryListOutput({ data: categories, total, page, limit }));
  } catch {
    respond.serverError(res, ERR.SERVER);
  }
};

const getById = async (req, res) => {
  const { id } = req.params;
  try {
    const category = await prisma.category.findUnique({
      where:   { id: parseInt(id) },
      include: { _count: { select: { products: true } } },
    });
    if (!category) return respond.notFound(res, ERR.NOT_FOUND);
    respond.ok(res, SCN.OK, CategoryOutput(category));
  } catch {
    respond.serverError(res, ERR.SERVER);
  }
};

const create = async (req, res) => {
  const result = CreateCategorySchema.safeParse(req.body);
  if (!result.success) return respond.badRequest(res, ERR.VALIDATION);

  const { name, description, image_url } = result.data;
  const slug = `${toSlug(name)}-${Date.now()}`;

  try {
    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description: description ?? null,
        imageUrl:    image_url   ?? null,
      },
      include: { _count: { select: { products: true } } },
    });
    respond.created(res, SCN.CREATED, CategoryOutput(category));
  } catch (err) {
    if (err.code === 'P2002') return respond.badRequest(res, ERR.VALIDATION);
    if (err.code === 'P2003') return respond.badRequest(res, ERR.VALIDATION);
    respond.serverError(res, ERR.SERVER);
  }
};

const update = async (req, res) => {
  const { id } = req.params;
  const result = UpdateCategorySchema.safeParse(req.body);
  if (!result.success) return respond.badRequest(res, ERR.VALIDATION);

  const { name, slug, description, image_url } = result.data;
  const data = {
    ...(name        !== undefined && { name                        }),
    ...(slug        !== undefined && { slug                        }),
    ...(description !== undefined && { description                 }),
    ...(image_url   !== undefined && { imageUrl: image_url ?? null }),
  };

  if (Object.keys(data).length === 0) return respond.badRequest(res, ERR.NO_UPDATE);

  try {
    const category = await prisma.category.update({
      where:   { id: parseInt(id) },
      data,
      include: { _count: { select: { products: true } } },
    });
    respond.ok(res, SCN.UPDATED, CategoryOutput(category));
  } catch (err) {
    if (err.code === 'P2025') return respond.notFound(res, ERR.NOT_FOUND);
    if (err.code === 'P2002') return respond.badRequest(res, ERR.VALIDATION);
    if (err.code === 'P2003') return respond.badRequest(res, ERR.VALIDATION);
    respond.serverError(res, ERR.SERVER);
  }
};

const remove = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.category.delete({ where: { id: parseInt(id) } });
    respond.ok(res, SCN.DELETED, null);
  } catch (err) {
    if (err.code === 'P2025') return respond.notFound(res, ERR.NOT_FOUND);
    if (err.code === 'P2003') return respond.badRequest(res, ERR.VALIDATION);
    respond.serverError(res, ERR.SERVER);
  }
};

export { getAll, getById, create, update, remove };
