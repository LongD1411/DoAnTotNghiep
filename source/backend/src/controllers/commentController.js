import prisma from '../config/database.js';
import { CreateCommentSchema, UpdateCommentSchema, CommentQuerySchema } from '../models/input/comment.input.js';
import { CommentOutput, CommentListOutput } from '../models/output/comment.output.js';
import { respond, ERR, SCN } from '../common/response.js';
import { uploadToT3, deleteFromT3 } from '../utils/t3Storage.js';

const USER_SELECT = { id: true, name: true, avatar: true };
const STAFF = ['mod', 'admin'];
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // tổng dung lượng ảnh mỗi bình luận tối đa 10MB

// ── Ảnh (multipart) — cùng cơ chế với bài viết ──────────────────────────────────
// content chứa placeholder __IMG_i__; files[i] tương ứng. Upload sau khi validate.
const parseData = (req) => { try { return JSON.parse(req.body?.data ?? '{}'); } catch { return null; } };
const deleteImages = (urls) => Promise.all(urls.map(u => deleteFromT3(u).catch(e => console.error('[deleteImages]', u, e?.message))));
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

// GET /comments?post_id=&page=&limit= — danh sách bình luận của 1 bài (công khai)
const getAll = async (req, res) => {
  const result = CommentQuerySchema.safeParse(req.query);
  if (!result.success) return respond.badRequest(res, ERR.VALIDATION);

  const { post_id, page, limit } = result.data;
  const where = { postId: post_id };
  try {
    const [comments, total] = await Promise.all([
      prisma.postComment.findMany({
        where, skip: (page - 1) * limit, take: limit,
        include: { user: { select: USER_SELECT } },
        orderBy: { createdAt: 'asc' }, // cũ nhất trước
      }),
      prisma.postComment.count({ where }),
    ]);
    respond.ok(res, SCN.OK, CommentListOutput({ data: comments, total, page, limit }));
  } catch (err) {
    console.error('[comment.getAll]', err.code, err.message);
    respond.serverError(res, ERR.SERVER);
  }
};

// POST /comments (multipart: data JSON + images) — đăng bình luận (đăng nhập)
const create = async (req, res) => {
  const body = parseData(req);
  if (!body) return respond.badRequest(res, ERR.VALIDATION);

  const result = CreateCommentSchema.safeParse(body);
  if (!result.success) return respond.badRequest(res, ERR.VALIDATION);

  const { post_id, content } = result.data;
  const userId = req.user.id;
  const files = req.files ?? [];

  const totalBytes = files.reduce((sum, f) => sum + f.size, 0);
  if (totalBytes > MAX_UPLOAD_BYTES) return respond.badRequest(res, ERR.FILE_TOO_LARGE);

  let uploaded = [];
  try {
    const post = await prisma.post.findUnique({ where: { id: post_id }, select: { id: true } });
    if (!post) return respond.badRequest(res, ERR.VALIDATION);

    uploaded = await uploadFiles(files);
    let finalContent = content;
    uploaded.forEach((url, i) => { finalContent = finalContent.split(`__IMG_${i}__`).join(url); });

    const comment = await prisma.postComment.create({
      data: { postId: post_id, userId, content: finalContent },
      include: { user: { select: USER_SELECT } },
    });
    respond.created(res, SCN.CREATED, CommentOutput(comment));
  } catch (err) {
    await deleteImages(uploaded);
    console.error('[comment.create]', err.code, err.message);
    respond.serverError(res, ERR.SERVER);
  }
};

// PUT /comments/:id (multipart) — chỉ tác giả bình luận được sửa
const update = async (req, res) => {
  const body = parseData(req);
  if (!body) return respond.badRequest(res, ERR.VALIDATION);

  const result = UpdateCommentSchema.safeParse(body);
  if (!result.success) return respond.badRequest(res, ERR.VALIDATION);

  const id = parseInt(req.params.id);
  const { content } = result.data;
  const files = req.files ?? [];

  const totalBytes = files.reduce((sum, f) => sum + f.size, 0);
  if (totalBytes > MAX_UPLOAD_BYTES) return respond.badRequest(res, ERR.FILE_TOO_LARGE);

  let uploaded = [];
  try {
    const existing = await prisma.postComment.findUnique({ where: { id }, select: { userId: true, content: true } });
    if (!existing) return respond.notFound(res, ERR.NOT_FOUND);
    if (existing.userId !== req.user.id) return respond.forbidden(res, ERR.NO_PERM); // chỉ tác giả sửa

    uploaded = await uploadFiles(files);
    let finalContent = content;
    uploaded.forEach((url, i) => { finalContent = finalContent.split(`__IMG_${i}__`).join(url); });

    const comment = await prisma.postComment.update({
      where: { id },
      data:  { content: finalContent },
      include: { user: { select: USER_SELECT } },
    });

    // Dọn ảnh cũ đã bị gỡ khỏi content
    const removed = extractImageUrls(existing.content).filter(u => !extractImageUrls(finalContent).includes(u));
    await deleteImages(removed);

    respond.ok(res, SCN.UPDATED, CommentOutput(comment));
  } catch (err) {
    await deleteImages(uploaded);
    if (err.code === 'P2025') return respond.notFound(res, ERR.NOT_FOUND);
    console.error('[comment.update]', err.code, err.message);
    respond.serverError(res, ERR.SERVER);
  }
};

// DELETE /comments/:id — tác giả bình luận HOẶC mod/admin
const remove = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const comment = await prisma.postComment.findUnique({ where: { id }, select: { userId: true, content: true } });
    if (!comment) return respond.notFound(res, ERR.NOT_FOUND);

    const isOwner = comment.userId === req.user.id;
    const isStaff = STAFF.includes(req.user.role);
    if (!isOwner && !isStaff) return respond.forbidden(res, ERR.NO_PERM);

    await prisma.postComment.delete({ where: { id } });
    await deleteImages(extractImageUrls(comment.content)); // dọn ảnh nhúng (không chặn response)

    respond.ok(res, SCN.DELETED);
  } catch (err) {
    if (err.code === 'P2025') return respond.notFound(res, ERR.NOT_FOUND);
    console.error('[comment.remove]', err.code, err.message);
    respond.serverError(res, ERR.SERVER);
  }
};

export { getAll, create, update, remove };
