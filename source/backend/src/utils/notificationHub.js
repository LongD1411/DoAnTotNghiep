import prisma from '../config/database.js';
import { NotificationOutput } from '../models/output/notification.output.js';

// ── Registry kết nối SSE: userId -> Set<res> ─────────────────────────────────
// Một user có thể mở nhiều tab → nhiều kết nối. Đẩy sự kiện tới tất cả.
const clients = new Map();

export const addClient = (userId, res) => {
  if (!clients.has(userId)) clients.set(userId, new Set());
  clients.get(userId).add(res);
};

export const removeClient = (userId, res) => {
  const set = clients.get(userId);
  if (!set) return;
  set.delete(res);
  if (!set.size) clients.delete(userId);
};

const pushToUser = (userId, event, payload) => {
  const set = clients.get(userId);
  if (!set || !set.size) return;
  const frame = `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
  for (const res of set) {
    try { res.write(frame); } catch { /* kết nối đã đứt — bỏ qua, req.on('close') sẽ dọn */ }
  }
};

// ── Tạo notification (lưu DB) + đẩy SSE realtime tới 1 user ───────────────────
export const notify = async (userId, { type, title, body, refId = null, refType = null }) => {
  try {
    const n = await prisma.notification.create({ data: { userId, type, title, body, refId, refType } });
    pushToUser(userId, 'notification', NotificationOutput(n));
    return n;
  } catch (e) {
    console.error('[notify]', e?.message);
  }
};

// Tạo cho nhiều user (lọc trùng)
export const notifyMany = (userIds, data) =>
  Promise.all([...new Set(userIds)].map(uid => notify(uid, data)));

// Tạo cho toàn bộ staff (mod + admin) — dùng cho đơn mới, sắp hết hàng, bài chờ duyệt
export const notifyStaff = async (data) => {
  try {
    const staff = await prisma.user.findMany({ where: { role: { in: ['mod', 'admin'] } }, select: { id: true } });
    await notifyMany(staff.map(u => u.id), data);
  } catch (e) {
    console.error('[notifyStaff]', e?.message);
  }
};
