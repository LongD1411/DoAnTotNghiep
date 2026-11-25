import { create } from 'zustand';
import {
  getNotifications, markNotificationRead, markAllNotificationsRead, openNotificationStream,
} from '../services/notificationService';
import { getCurrentUser } from '../services/authService';

// EventSource giữ ở module-level để tồn tại qua các lần điều hướng (layout remount)
let es = null;

export const useNotificationStore = create((set, get) => ({
  items:  [],
  unread: 0,
  loaded: false,

  // Gọi ở CustomerLayout / AdminLayout khi đã đăng nhập (idempotent)
  init: async () => {
    if (!getCurrentUser() || get().loaded) return;
    set({ loaded: true });
    try {
      const res = await getNotifications({ limit: 30 });
      set({ items: res.data.data.data ?? [], unread: res.data.data.unread ?? 0 });
    } catch { /* lỗi mạng — không chặn UI */ }

    if (!es) {
      es = openNotificationStream();
      if (es) {
        es.addEventListener('notification', (e) => {
          try {
            const n = JSON.parse(e.data);
            set(s => ({ items: [n, ...s.items].slice(0, 50), unread: s.unread + 1 }));
          } catch { /* bỏ qua frame hỏng */ }
        });
        // EventSource tự reconnect khi đứt — không cần xử lý thêm
      }
    }
  },

  markRead: async (id) => {
    const wasUnread = get().items.some(n => n.id === id && !n.is_read);
    set(s => ({
      items:  s.items.map(n => (n.id === id ? { ...n, is_read: true } : n)),
      unread: Math.max(0, s.unread - (wasUnread ? 1 : 0)),
    }));
    try { await markNotificationRead(id); } catch { /* */ }
  },

  markAllRead: async () => {
    set(s => ({ items: s.items.map(n => ({ ...n, is_read: true })), unread: 0 }));
    try { await markAllNotificationsRead(); } catch { /* */ }
  },

  // Gọi khi đăng xuất: đóng SSE + xoá state
  reset: () => {
    if (es) { es.close(); es = null; }
    set({ items: [], unread: 0, loaded: false });
  },
}));
