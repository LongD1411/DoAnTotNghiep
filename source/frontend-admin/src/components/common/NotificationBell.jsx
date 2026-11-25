import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotificationStore } from '../../store/useNotificationStore';

const ICON = { order: 'shopping_bag', inventory: 'inventory_2', forum: 'forum', system: 'notifications' };
const ICON_CLS = {
  order:     'bg-blue-100 text-blue-600',
  inventory: 'bg-amber-100 text-amber-600',
  forum:     'bg-primary/15 text-[#2E7D32]',
  system:    'bg-slate-100 text-slate-600',
};

const relTime = (iso) => {
  if (!iso) return '';
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1)  return 'Vừa xong';
  if (m < 60) return `${m} phút trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ trước`;
  return `${Math.floor(h / 24)} ngày trước`;
};

// Đường dẫn chi tiết theo loại + scope (admin/customer)
const refLink = (n, scope) => {
  if (n.ref_type === 'order')   return scope === 'admin' ? `/admin/edit-order/${n.ref_id}` : `/dat-hang/${n.ref_id}`;
  if (n.ref_type === 'product') return scope === 'admin' ? `/admin/edit-product/${n.ref_id}` : null;
  if (n.ref_type === 'post')    return scope === 'admin' ? '/dien-dan/kiem-duyet' : null;
  return null;
};

// Chuông thông báo realtime dùng chung (admin + customer).
// Props: scope ('admin'|'customer'), triggerClassName (style nút chuông), viewAllTo (link "Xem tất cả")
const NotificationBell = ({ scope = 'customer', triggerClassName = '', viewAllTo }) => {
  const navigate = useNavigate();
  const items       = useNotificationStore(s => s.items);
  const unread      = useNotificationStore(s => s.unread);
  const markRead    = useNotificationStore(s => s.markRead);
  const markAllRead = useNotificationStore(s => s.markAllRead);

  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const onItem = (n) => {
    markRead(n.id);
    const to = refLink(n, scope);
    if (to) { setOpen(false); navigate(to); }
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className={triggerClassName || 'relative flex items-center justify-center rounded-full h-10 w-10 bg-[#e9f3e7] dark:bg-white/10 hover:bg-primary hover:text-black dark:hover:bg-primary transition-colors text-[#101b0d] dark:text-white'}
        title="Thông báo"
      >
        <span className="material-symbols-outlined text-[20px]">notifications</span>
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Thông báo</span>
            {unread > 0 && (
              <button onClick={markAllRead} className="text-xs font-semibold text-[#2E7D32] dark:text-primary hover:underline">
                Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>

          <ul className="divide-y divide-slate-100 dark:divide-slate-700 max-h-80 overflow-y-auto">
            {items.length === 0 && (
              <li className="px-4 py-8 text-center text-xs text-slate-400">Chưa có thông báo</li>
            )}
            {items.map(n => (
              <li
                key={n.id}
                onClick={() => onItem(n)}
                className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${!n.is_read ? 'bg-primary/5' : ''}`}
              >
                <div className={`size-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${ICON_CLS[n.type] ?? ICON_CLS.system}`}>
                  <span className="material-symbols-outlined text-sm">{ICON[n.type] ?? ICON.system}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs leading-snug ${!n.is_read ? 'font-bold text-slate-800 dark:text-slate-100' : 'font-semibold text-slate-600 dark:text-slate-300'}`}>
                    {n.title}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">{n.body}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{relTime(n.created_at)}</p>
                </div>
                {!n.is_read && <span className="size-2 bg-primary rounded-full shrink-0 mt-1.5" />}
              </li>
            ))}
          </ul>

          {viewAllTo && (
            <div className="px-4 py-2.5 border-t border-slate-100 dark:border-slate-700 text-center">
              <button
                onClick={() => { setOpen(false); navigate(viewAllTo); }}
                className="text-xs font-bold text-[#2E7D32] dark:text-primary hover:underline"
              >
                Xem tất cả thông báo
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
