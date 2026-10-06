import prisma from '../config/database.js';
import { CreatePostSchema, PostQuerySchema, ModeratePostSchema } from '../models/input/post.input.js';
import { PostOutput, PostListOutput } from '../models/output/post.output.js';
import { respond, ERR, SCN } from '../common/response.js';
import { uploadToT3, deleteFromT3 } from '../utils/t3Storage.js';

const VI_MAP = {'à':'a','á':'a','ả':'a','ã':'a','ạ':'a','ă':'a','ắ':'a','ằ':'a','ẳ':'a','ẵ':'a','ặ':'a','â':'a','ấ':'a','ầ':'a','ẩ':'a','ẫ':'a','ậ':'a','đ':'d','è':'e','é':'e','ẻ':'e','ẽ':'e','ẹ':'e','ê':'e','ế':'e','ề':'e','ể':'e','ễ':'e','ệ':'e','ì':'i','í':'i','ỉ':'i','ĩ':'i','ị':'i','ò':'o','ó':'o','ỏ':'o','õ':'o','ọ':'o','ô':'o','ố':'o','ồ':'o','ổ':'o','ỗ':'o','ộ':'o','ơ':'o','ớ':'o','ờ':'o','ở':'o','ỡ':'o','ợ':'o','ù':'u','ú':'u','ủ':'u','ũ':'u','ụ':'u','ư':'u','ứ':'u','ừ':'u','ử':'u','ữ':'u','ự':'u','ỳ':'y','ý':'y','ỷ':'y','ỹ':'y','ỵ':'y'};
const toSlug = (str) => { let s = str.toLowerCase(); for (const [k,v] of Object.entries(VI_MAP)) s = s.split(k).join(v); return s.replace(/[^a-z0-9\s-]/g,'').trim().replace(/\s+/g,'-').replace(/-+/g,'-'); };

const USER_SELECT = { id: true, name: true, avatar: true };
const CAT_SELECT  = { select: { id: true, name: true, slug: true } };
const STAFF = ['mod', 'admin'];
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // tổng dung lượng ảnh mỗi bài tối đa 10MB

// ── Ảnh (multipart) ────────────────────────────────────────────────────────────
// content chứa placeholder __IMG_i__; files[i] tương ứng. Upload sau khi validate.
const parseData = (req) => { try { return JSON.parse(req.body?.data ?? '{}'); } catch { return null; } };
const deleteImages = (urls) => Promise.all(urls.map(u => deleteFromT3(u).catch(e => console.error('[deleteImages]', u, e?.message))));
// Trích URL ảnh (Cloudinary) đang nhúng trong content HTML.
const extractImageUrls = (html) => (html || '').match(/https?:\/\/res\.cloudinary\.com\/[^\s"'<>)]+/g) || [];
const uploadFiles = async (files = []) => {
  const results = await Promise.allSettled(files.map(f => {
    const ext = f.originalname.split('.').pop().toLowerCase();
    return uploadToT3(f.buffer, `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`, f.mimetype);
  }));
  const ok = results.filter(r => r.status === 'fulfilled').map(r => r.value);
  if (results.some(r => r.status === 'rejected')) { await deleteImages(ok); throw new Error('upload failed'); }
  return ok;
};

const getAll = async (req, res) => {
  const result = PostQuerySchema.safeParse(req.query);
  if (!result.success) return respond.badRequest(res, ERR.VALIDATION);

  const { search, category_id, page, limit } = result.data;
  const where = {
    // Feed chỉ hiện bài đã duyệt; RIÊNG bài của chính người đang đăng nhập thì
    // hiện mọi trạng thái (kể cả pending/hidden) để họ theo dõi & sửa.
    // Bài pending của người khác chỉ xem ở trang kiểm duyệt (GET /posts/pending).
    ...(req.user
      ? { OR: [{ status: 'published' }, { userId: req.user.id }] }
      : { status: 'published' }),
    ...(search ? { title: { contains: search } } : {}),
    ...(category_id ? { categoryId: category_id } : {}),
  };
  try {
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where, skip: (page - 1) * limit, take: limit,
        include: { category: CAT_SELECT, user: { select: USER_SELECT }, _count: { select: { comments: true } } },
        orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
      }),
      prisma.post.count({ where }),
    ]);
    respond.ok(res, SCN.OK, PostListOutput({ data: posts, total, page, limit }));
  } catch {
    respond.serverError(res, ERR.SERVER);
  }
};

const getById = async (req, res) => {
  const { id } = req.params;
  const isNumeric = /^\d+$/.test(id);
  const isStaff = STAFF.includes(req.user?.role);
  try {
    const post = await prisma.post.findUnique({
      where:   isNumeric ? { id: parseInt(id) } : { slug: id },
      include: { category: CAT_SELECT, user: { select: USER_SELECT }, _count: { select: { comments: true } } },
    });
    if (!post) return respond.notFound(res, ERR.NOT_FOUND);
    // Bài chưa duyệt: chỉ staff hoặc chính tác giả xem được
    if (post.status !== 'published' && !isStaff && post.userId !== req.user?.id) {
      return respond.notFound(res, ERR.NOT_FOUND);
    }
    prisma.post.update({ where: { id: post.id }, data: { viewCount: { increment: 1 } } }).catch(() => {});
    respond.ok(res, SCN.OK, PostOutput(post));
  } catch (err) {
    console.error('[post.getById]', err.code, err.message);
    respond.serverError(res, ERR.SERVER);
  }
};

// POST /posts (multipart: data JSON + images files). Bài mới ở trạng thái pending (chờ duyệt).
const create = async (req, res) => {
  const body = parseData(req);
  if (!body) return respond.badRequest(res, ERR.VALIDATION);

  const result = CreatePostSchema.safeParse(body);
  if (!result.success) return respond.badRequest(res, ERR.VALIDATION); // chưa upload gì

  const { title, category_id, content } = result.data;
  const userId = req.user.id;
  const files = req.files ?? [];

  // Tổng dung lượng ảnh không vượt quá 10MB (nhiều ảnh cộng lại)
  const totalBytes = files.reduce((sum, f) => sum + f.size, 0);
  if (totalBytes > MAX_UPLOAD_BYTES) return respond.badRequest(res, ERR.FILE_TOO_LARGE);

  let uploaded = [];
  try {
    // Chủ đề phải tồn tại TRƯỚC khi upload → tạo bài thất bại (chủ đề sai) thì KHÔNG đẩy ảnh lên cloud
    const cat = await prisma.forumCategory.findUnique({ where: { id: category_id }, select: { id: true } });
    if (!cat) return respond.badRequest(res, ERR.VALIDATION);

    // Mọi kiểm tra đã qua → mới upload ảnh
    uploaded = await uploadFiles(files);

    // Thay placeholder __IMG_i__ = URL thật (theo thứ tự file). Content có thể null → giữ null.
    let finalContent = content ?? null;
    if (finalContent) uploaded.forEach((url, i) => { finalContent = finalContent.split(`__IMG_${i}__`).join(url); });

    const slug = `${toSlug(title)}-${Date.now()}`;
    const post = await prisma.post.create({
      data: { title, slug, content: finalContent, categoryId: category_id, userId, status: 'pending' },
      include: { category: CAT_SELECT, user: { select: USER_SELECT }, _count: { select: { comments: true } } },
    });
    respond.created(res, SCN.CREATED, PostOutput(post));
  } catch (err) {
    await deleteImages(uploaded); // lỗi sau khi đã upload → dọn ảnh (không để mồ côi)
    console.error('[post.create]', err.code, err.message);
    if (err.code === 'P2002') return respond.badRequest(res, ERR.VALIDATION); // slug trùng (hiếm)
    respond.serverError(res, ERR.SERVER);
  }
};

// PUT /posts/:id (multipart) — tác giả sửa bài CỦA MÌNH (mọi trạng thái, KHÔNG đổi status).
// content có thể chứa URL ảnh cũ (giữ nguyên) + placeholder __IMG_i__ cho ảnh mới.
const update = async (req, res) => {
  const body = parseData(req);
  if (!body) return respond.badRequest(res, ERR.VALIDATION);

  const result = CreatePostSchema.safeParse(body);
  if (!result.success) return respond.badRequest(res, ERR.VALIDATION);

  const id = parseInt(req.params.id);
  const { title, category_id, content } = result.data;
  const files = req.files ?? [];

  // Tổng dung lượng ảnh MỚI không vượt quá 10MB
  const totalBytes = files.reduce((sum, f) => sum + f.size, 0);
  if (totalBytes > MAX_UPLOAD_BYTES) return respond.badRequest(res, ERR.FILE_TOO_LARGE);

  let uploaded = [];
  try {
    const existing = await prisma.post.findUnique({ where: { id }, select: { userId: true, content: true } });
    if (!existing) return respond.notFound(res, ERR.NOT_FOUND);
    if (existing.userId !== req.user.id) return respond.forbidden(res, ERR.NO_PERM); // chỉ tác giả

    const cat = await prisma.forumCategory.findUnique({ where: { id: category_id }, select: { id: true } });
    if (!cat) return respond.badRequest(res, ERR.VALIDATION);

    // Upload ảnh mới → thay placeholder. Ảnh cũ (URL) trong content giữ nguyên.
    uploaded = await uploadFiles(files);
    let finalContent = content ?? null;
    if (finalContent) uploaded.forEach((url, i) => { finalContent = finalContent.split(`__IMG_${i}__`).join(url); });

    // Slug & status GIỮ NGUYÊN (không đổi). Đánh dấu đã sửa.
    const post = await prisma.post.update({
      where: { id },
      data:  { title, content: finalContent, categoryId: category_id, isEdited: true },
      include: { category: CAT_SELECT, user: { select: USER_SELECT }, _count: { select: { comments: true } } },
    });

    // Dọn ảnh cũ đã bị gỡ khỏi content (có ở bản cũ, không còn ở bản mới)
    const removed = extractImageUrls(existing.content).filter(u => !extractImageUrls(finalContent).includes(u));
    await deleteImages(removed);

    respond.ok(res, SCN.UPDATED, PostOutput(post));
  } catch (err) {
    await deleteImages(uploaded); // lỗi sau khi upload → dọn ảnh mới (không để mồ côi)
    if (err.code === 'P2025') return respond.notFound(res, ERR.NOT_FOUND);
    console.error('[post.update]', err.code, err.message);
    respond.serverError(res, ERR.SERVER);
  }
};

// GET /posts/pending — mod/admin: danh sách bài cần duyệt (mặc định pending, lọc thêm ?status=)
const getModeration = async (req, res) => {
  const result = PostQuerySchema.safeParse(req.query);
  if (!result.success) return respond.badRequest(res, ERR.VALIDATION);

  const { search, category_id, status, page, limit } = result.data;
  const where = {
    status: status ?? 'pending',
    ...(search ? { title: { contains: search } } : {}),
    ...(category_id ? { categoryId: category_id } : {}),
  };
  try {
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where, skip: (page - 1) * limit, take: limit,
        include: { category: CAT_SELECT, user: { select: USER_SELECT }, _count: { select: { comments: true } } },
        orderBy: [{ createdAt: 'asc' }], // hàng chờ: bài cũ nhất duyệt trước
      }),
      prisma.post.count({ where }),
    ]);
    respond.ok(res, SCN.OK, PostListOutput({ data: posts, total, page, limit }));
  } catch (err) {
    console.error('[post.getModeration]', err.code, err.message);
    respond.serverError(res, ERR.SERVER);
  }
};

// PATCH /posts/:id/status — mod/admin duyệt bài (published) / ẩn (hidden) / trả lại chờ (pending)
const moderate = async (req, res) => {
  const result = ModeratePostSchema.safeParse(req.body);
  if (!result.success) return respond.badRequest(res, ERR.VALIDATION);

  try {
    const post = await prisma.post.update({
      where: { id: parseInt(req.params.id) },
      data:  { status: result.data.status },
      include: { category: CAT_SELECT, user: { select: USER_SELECT }, _count: { select: { comments: true } } },
    });
    respond.ok(res, SCN.UPDATED, PostOutput(post));
  } catch (err) {
    if (err.code === 'P2025') return respond.notFound(res, ERR.NOT_FOUND);
    console.error('[post.moderate]', err.code, err.message);
    respond.serverError(res, ERR.SERVER);
  }
};

// DELETE /posts/:id — tác giả xoá bài của mình HOẶC mod/admin. Cascade xoá comment/image/report.
const remove = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const post = await prisma.post.findUnique({ where: { id }, select: { userId: true, content: true } });
    if (!post) return respond.notFound(res, ERR.NOT_FOUND);
    if (post.userId !== req.user.id && !STAFF.includes(req.user.role)) return respond.forbidden(res, ERR.NO_PERM);

    // Gom ảnh nhúng trong các bình luận TRƯỚC khi xoá (cascade sẽ xoá row comment)
    const comments = await prisma.postComment.findMany({ where: { postId: id }, select: { content: true } });

    await prisma.post.delete({ where: { id } }); // FK onDelete: Cascade lo phần con

    // Dọn ảnh nhúng của bài + của tất cả bình luận trên Cloudinary (không chặn response nếu lỗi)
    const urls = [
      ...extractImageUrls(post.content),
      ...comments.flatMap(c => extractImageUrls(c.content)),
    ];
    console.log(`[post.remove] bài #${id}: xoá ${comments.length} bình luận, dọn ${urls.length} ảnh`);
    await deleteImages(urls);

    respond.ok(res, SCN.DELETED);
  } catch (err) {
    if (err.code === 'P2025') return respond.notFound(res, ERR.NOT_FOUND);
    console.error('[post.remove]', err.code, err.message);
    respond.serverError(res, ERR.SERVER);
  }
};

export { getAll, getById, create, update, getModeration, moderate, remove };
