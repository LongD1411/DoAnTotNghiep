import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { useNotificationStore } from '../../store/useNotificationStore';

// ── Hằng số ──────────────────────────────────────────────────────────────────

const FILTERS = [
  { value: 'all',       label: 'Tất cả'    },
  { value: 'unread',    label: 'Chưa đọc'  },
  { value: 'order',     label: 'Đơn hàng'  },
  { value: 'inventory', label: 'Tồn kho'   },
  { value: 'forum',     label: 'Diễn đàn'  },
];

const ICON = { order: 'shopping_bag', inventory: 'inventory_2', forum: 'forum', system: 'notifications' };
const ICON_CLS = {
  order:     'bg-blue-100 text-blue-600',
  inventory: 'bg-amber-100 text-amber-600',
  forum:     'bg-primary/15 text-[#1B5E20]',
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

const refLink = (n) => {
  if (n.ref_type === 'order')   return `/admin/edit-order/${n.ref_id}`;
  if (n.ref_type === 'product') return `/admin/edit-product/${n.ref_id}`;
  if (n.ref_type === 'post')    return '/dien-dan/kiem-duyet';
  return null;
};

// ── Page ─────────────────────────────────────────────────────────────────────

const NotificationsPage = () => {
  const navigate = useNavigate();
  const items       = useNotificationStore(s => s.items);
  const unread      = useNotificationStore(s => s.unread);
  const init        = useNotificationStore(s => s.init);
  const markRead    = useNotificationStore(s => s.markRead);
  const markAllRead = useNotificationStore(s => s.markAllRead);

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => { init(); }, [init]);

  const matchFilter = (n) =>
    filter === 'all'    ? true :
    filter === 'unread' ? !n.is_read :
    n.type === filter;

  const filtered = items.filter(n => {
    const q = search.trim().toLowerCase();
    const matchSearch = !q || n.title.toLowerCase().includes(q) || (n.body ?? '').toLowerCase().includes(q);
    return matchFilter(n) && matchSearch;
  });

  const countOf = (f) =>
    f === 'all'    ? items.length :
    f === 'unread' ? items.filter(n => !n.is_read).length :
    items.filter(n => n.type === f).length;

  const onItem = (n) => {
    if (!n.is_read) markRead(n.id);
    const to = refLink(n);
    if (to) navigate(to);
  };

  return (
    <AdminLayout>
      <>
        {/* ── Header ────────────────────────────────────────────────── */}
        <header className="sticky top-0 z-10 bg-white/80 dark:bg-[#152210]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">Thông báo</h2>
              {unread > 0 && (
                <span className="min-w-[22px] h-5 px-1.5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {unread}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-1.5 border border-slate-200 dark:border-slate-700">
              <span className="material-symbols-outlined text-slate-400 text-xl">search</span>
              <input
                className="bg-transparent border-none outline-none focus:ring-0 text-sm w-64 placeholder:text-slate-400"
                placeholder="Tìm kiếm thông báo..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            {unread > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-2 text-sm font-semibold text-[#1B5E20] dark:text-primary hover:underline"
              >
                <span className="material-symbols-outlined text-lg">done_all</span>
                Đánh dấu tất cả đã đọc
              </button>
            )}
            <button
              onClick={() => navigate('/admin/overview')}
              className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              title="Quay lại Dashboard"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
          </div>
        </header>

        {/* ── Content ───────────────────────────────────────────────── */}
        <div className="p-8 space-y-6 max-w-4xl mx-auto w-full">

          {/* Filter tabs */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex-wrap">
            {FILTERS.map(f => {
              const count = countOf(f.value);
              return (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                    filter === f.value
                      ? 'bg-white dark:bg-slate-700 text-[#1B5E20] dark:text-primary shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  {f.label}
                  <span className={`text-[10px] font-bold min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center tabular-nums ${
                    filter === f.value
                      ? 'bg-primary/20 text-[#1B5E20] dark:text-primary'
                      : 'bg-slate-200 dark:bg-slate-600 text-slate-500 dark:text-slate-400'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* List */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
              <span className="material-symbols-outlined text-5xl">notifications_off</span>
              <p className="text-base font-semibold">Không có thông báo nào</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm divide-y divide-slate-100 dark:divide-slate-700">
              {filtered.map(n => (
                <div
                  key={n.id}
                  onClick={() => onItem(n)}
                  className={`flex items-start gap-4 px-5 py-4 cursor-pointer transition-colors ${
                    !n.is_read ? 'bg-primary/[0.03] hover:bg-primary/[0.06]' : 'hover:bg-slate-50 dark:hover:bg-slate-700/30'
                  }`}
                >
                  <div className="flex items-center justify-center w-2 shrink-0 mt-3">
                    {!n.is_read && <span className="size-2 rounded-full bg-primary shrink-0" />}
                  </div>
                  <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${ICON_CLS[n.type] ?? ICON_CLS.system}`}>
                    <span className="material-symbols-outlined text-xl">{ICON[n.type] ?? ICON.system}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-snug ${!n.is_read ? 'font-bold text-slate-800 dark:text-slate-100' : 'font-semibold text-slate-700 dark:text-slate-300'}`}>
                      {n.title}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{n.body}</p>
                    <p className="text-[11px] text-slate-400 mt-1.5 font-medium">{relTime(n.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </>
    </AdminLayout>
  );
};

export default NotificationsPage;
