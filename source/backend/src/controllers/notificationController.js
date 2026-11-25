import jwt from 'jsonwebtoken';
import prisma from '../config/database.js';
import { NotificationQuerySchema } from '../models/input/notification.input.js';
import { NotificationListOutput } from '../models/output/notification.output.js';
import { respond, ERR, SCN } from '../common/response.js';
import { addClient, removeClient } from '../utils/notificationHub.js';

// GET /notifications — danh sách thông báo của user hiện tại + số chưa đọc
const getAll = async (req, res) => {
  const result = NotificationQuerySchema.safeParse(req.query);
  if (!result.success) return respond.badRequest(res, ERR.VALIDATION);

  const { page, limit } = result.data;
  const where = { userId: req.user.id };
  try {
    const [items, total, unread] = await Promise.all([
      prisma.notification.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { ...where, isRead: false } }),
    ]);
    respond.ok(res, SCN.OK, { ...NotificationListOutput({ data: items, total, page, limit }), unread });
  } catch (err) {
    console.error('[notif.getAll]', err?.message);
    respond.serverError(res, ERR.SERVER);
  }
};

// PUT /notifications/:id/read — đánh dấu 1 thông báo đã đọc (chỉ của chính mình)
const markRead = async (req, res) => {
  const id = parseInt(req.params.id);
  if (Number.isNaN(id)) return respond.badRequest(res, ERR.VALIDATION);
  try {
    await prisma.notification.updateMany({ where: { id, userId: req.user.id }, data: { isRead: true } });
    respond.ok(res, SCN.UPDATED, { id });
  } catch (err) {
    console.error('[notif.markRead]', err?.message);
    respond.serverError(res, ERR.SERVER);
  }
};

// PUT /notifications/read-all — đánh dấu tất cả đã đọc
const markAllRead = async (req, res) => {
  try {
    await prisma.notification.updateMany({ where: { userId: req.user.id, isRead: false }, data: { isRead: true } });
    respond.ok(res, SCN.UPDATED, { ok: true });
  } catch (err) {
    console.error('[notif.markAllRead]', err?.message);
    respond.serverError(res, ERR.SERVER);
  }
};

// GET /notifications/stream — SSE realtime. EventSource không gửi được header nên
// xác thực qua query ?token=. KHÔNG dùng respond.* vì đây là stream (ngoại lệ có chủ đích).
const stream = (req, res) => {
  let user;
  try { user = jwt.verify(req.query.token, process.env.JWT_SECRET); }
  catch { return res.status(401).end(); }

  res.writeHead(200, {
    'Content-Type':  'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection:      'keep-alive',
  });
  res.write('retry: 5000\n\n');   // client tự kết nối lại sau 5s nếu đứt
  res.write(': connected\n\n');

  addClient(user.id, res);

  // Heartbeat giữ kết nối sống (tránh timeout proxy/trình duyệt)
  const hb = setInterval(() => { try { res.write(': ping\n\n'); } catch { /* */ } }, 25000);

  req.on('close', () => { clearInterval(hb); removeClient(user.id, res); });
};

export { getAll, markRead, markAllRead, stream };
