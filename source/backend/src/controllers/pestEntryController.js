import prisma from '../config/database.js';
import { deleteFromT3 } from '../utils/t3Storage.js';
import {
  CreatePestEntrySchema,
  UpdatePestEntrySchema,
  PestEntryQuerySchema,
} from '../models/input/pestEntry.input.js';
import {
  PestEntryOutput,
  PestEntryListOutput,
} from '../models/output/pestEntry.output.js';
import { respond, ERR, SCN } from '../common/response.js';

// ── Helpers ───────────────────────────────────────────────────────────────────

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

const FULL_INCLUDE = {
  images:              { orderBy: { order: 'asc' } },
  symptoms:            { orderBy: { order: 'asc' } },
  treatments:          { orderBy: { order: 'asc' } },
  cropTypes:           true,
  recommendedProducts: true,
};

const LIST_INCLUDE = {
  images:    { orderBy: { order: 'asc' }, take: 1 },
  cropTypes: true,
  _count:    { select: { symptoms: true } },
};

// ── Controllers ───────────────────────────────────────────────────────────────

const getAll = async (req, res) => {
  const result = PestEntryQuerySchema.safeParse(req.query);
  if (!result.success) return respond.badRequest(res, ERR.VALIDATION);

  const { search, category, severity, page, limit } = result.data;
  try {
    const where = {
      ...(search   && { name: { contains: search } }),
      ...(category && { category }),
      ...(severity && { severity }),
    };

    const [entries, total] = await Promise.all([
      prisma.pestEntry.findMany({
        where,
        skip:     (page - 1) * limit,
        take:     limit,
        include:  LIST_INCLUDE,
        orderBy:  { createdAt: 'desc' },
      }),
      prisma.pestEntry.count({ where }),
    ]);

    respond.ok(res, SCN.OK, PestEntryListOutput({ data: entries, total, page, limit }));
  } catch {
    respond.serverError(res, ERR.SERVER);
  }
};

const getById = async (req, res) => {
  const { id } = req.params;
  const isNumeric = /^\d+$/.test(id);
  try {
    const entry = await prisma.pestEntry.findUnique({
      where:   isNumeric ? { id: parseInt(id) } : { slug: id },
      include: FULL_INCLUDE,
    });
    if (!entry) return respond.notFound(res, ERR.NOT_FOUND);

    // tăng viewCount
    prisma.pestEntry.update({ where: { id: entry.id }, data: { viewCount: { increment: 1 } } }).catch(() => {});

    respond.ok(res, SCN.OK, PestEntryOutput(entry));
  } catch {
    respond.serverError(res, ERR.SERVER);
  }
};

const create = async (req, res) => {
  const result = CreatePestEntrySchema.safeParse(req.body);
  if (!result.success) return respond.badRequest(res, ERR.VALIDATION);

  const {
    name, latin_name, slug: slugInput, category, severity,
    description, conditions, is_active,
    images, symptoms, treatment, crop_types, recommended_product_ids,
  } = result.data;

  const slug = slugInput ? slugInput : `${toSlug(name)}-${Date.now()}`;

  try {
    const entry = await prisma.pestEntry.create({
      data: {
        name,
        latinName:   latin_name   ?? null,
        slug,
        category,
        severity,
        description: description  ?? null,
        conditions:  conditions   ?? null,
        isActive:    is_active,
        images:              { create: images.map((url, i)     => ({ url, order: i }))          },
        symptoms:            { create: symptoms.map((content, i)  => ({ content, order: i }))   },
        treatments:          { create: treatment.map((content, i)  => ({ content, order: i }))  },
        cropTypes:           { create: crop_types.map(cropType      => ({ cropType }))           },
        recommendedProducts: { create: recommended_product_ids.map(productId => ({ productId })) },
      },
      include: FULL_INCLUDE,
    });

    respond.created(res, SCN.CREATED, PestEntryOutput(entry));
  } catch (err) {
    if (err.code === 'P2002') return respond.badRequest(res, ERR.VALIDATION); // slug trùng
    if (err.code === 'P2003') return respond.badRequest(res, ERR.VALIDATION); // productId không tồn tại
    respond.serverError(res, ERR.SERVER);
  }
};

const update = async (req, res) => {
  const { id } = req.params;
  const pestId  = parseInt(id);

  const result = UpdatePestEntrySchema.safeParse(req.body);
  if (!result.success) return respond.badRequest(res, ERR.VALIDATION);

  const {
    name, latin_name, slug, category, severity,
    description, conditions, is_active,
    images, symptoms, treatment, crop_types, recommended_product_ids,
  } = result.data;

  // Scalar fields
  const scalarData = {
    ...(name        !== undefined && { name                        }),
    ...(latin_name  !== undefined && { latinName:   latin_name    }),
    ...(slug        !== undefined && { slug                        }),
    ...(category    !== undefined && { category                    }),
    ...(severity    !== undefined && { severity                    }),
    ...(description !== undefined && { description                 }),
    ...(conditions  !== undefined && { conditions                  }),
    ...(is_active   !== undefined && { isActive:    is_active      }),
  };

  const hasRelations = [images, symptoms, treatment, crop_types, recommended_product_ids]
    .some(v => v !== undefined);

  if (Object.keys(scalarData).length === 0 && !hasRelations)
    return respond.badRequest(res, ERR.NO_UPDATE);

  try {
    // Cập nhật scalars
    if (Object.keys(scalarData).length > 0) {
      await prisma.pestEntry.update({ where: { id: pestId }, data: scalarData });
    }

    // Replace relations bằng deleteMany + createMany
    if (images !== undefined) {
      await prisma.pestImage.deleteMany({ where: { pestId } });
      if (images.length) await prisma.pestImage.createMany({
        data: images.map((url, i) => ({ pestId, url, order: i })),
      });
    }
    if (symptoms !== undefined) {
      await prisma.pestSymptom.deleteMany({ where: { pestId } });
      if (symptoms.length) await prisma.pestSymptom.createMany({
        data: symptoms.map((content, i) => ({ pestId, content, order: i })),
      });
    }
    if (treatment !== undefined) {
      await prisma.pestTreatment.deleteMany({ where: { pestId } });
      if (treatment.length) await prisma.pestTreatment.createMany({
        data: treatment.map((content, i) => ({ pestId, content, order: i })),
      });
    }
    if (crop_types !== undefined) {
      await prisma.pestCropType.deleteMany({ where: { pestId } });
      if (crop_types.length) await prisma.pestCropType.createMany({
        data: crop_types.map(cropType => ({ pestId, cropType })),
      });
    }
    if (recommended_product_ids !== undefined) {
      await prisma.pestProduct.deleteMany({ where: { pestId } });
      if (recommended_product_ids.length) await prisma.pestProduct.createMany({
        data: recommended_product_ids.map(productId => ({ pestId, productId })),
      });
    }

    const entry = await prisma.pestEntry.findUnique({ where: { id: pestId }, include: FULL_INCLUDE });
    if (!entry) return respond.notFound(res, ERR.NOT_FOUND);

    respond.ok(res, SCN.UPDATED, PestEntryOutput(entry));
  } catch (err) {
    if (err.code === 'P2025') return respond.notFound(res, ERR.NOT_FOUND);
    if (err.code === 'P2002') return respond.badRequest(res, ERR.VALIDATION);
    if (err.code === 'P2003') return respond.badRequest(res, ERR.VALIDATION);
    respond.serverError(res, ERR.SERVER);
  }
};

const remove = async (req, res) => {
  const { id } = req.params;
  const pestId  = parseInt(id);
  try {
    // Lấy danh sách ảnh trước khi xóa
    const entry = await prisma.pestEntry.findUnique({
      where:  { id: pestId },
      select: { images: { select: { url: true } } },
    });
    if (!entry) return respond.notFound(res, ERR.NOT_FOUND);

    const imageUrls = entry.images.map(img => img.url);

    // Xóa record DB (cascade xóa PestImage, PestSymptom, ... theo schema)
    await prisma.pestEntry.delete({ where: { id: pestId } });

    // Xóa ảnh trên Cloudinary — best-effort, không block response
    if (imageUrls.length) {
      Promise.allSettled(imageUrls.map(url => deleteFromT3(url))).catch(() => {});
    }

    respond.ok(res, SCN.DELETED, null);
  } catch (err) {
    if (err.code === 'P2025') return respond.notFound(res, ERR.NOT_FOUND);
    respond.serverError(res, ERR.SERVER);
  }
};

export { getAll, getById, create, update, remove };
