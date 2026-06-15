import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import LoadingOverlay from '../../components/common/LoadingOverlay';

// ── Constants ────────────────────────────────────────────────────────────────

const TYPE_CONFIG = {
  order:     { label: 'Đơn hàng',      filterLabel: 'Đơn hàng'      },
  violation: { label: 'Vi phạm',       filterLabel: 'Vi phạm'        },
  inventory: { label: 'Hàng tồn kho',  filterLabel: 'Hàng tồn kho'  },
  member:    { label: 'Thành viên',     filterLabel: 'Thành viên'     },
};

const GROUP_LABELS = {
  today:     'Hôm nay',
  yesterday: 'Hôm qua',
  week:      'Tuần này',
};

const MOCK = [
  { id: 1,  type: 'order',     icon: 'shopping_bag', iconCls: 'bg-blue-100 text-blue-600',        title: 'Đơn hàng mới #AG-9025',         desc: 'Nguyễn Văn A vừa đặt đơn trị giá 2.500.000đ',                             time: '2 phút trước',   group: 'today',     unread: true,  link: '/admin/orders'   },
  { id: 2,  type: 'violation', icon: 'report',       iconCls: 'bg-red-100 text-red-600',           title: 'Bài viết bị báo cáo vi phạm',   desc: 'Bài viết #POST-2310 bị 3 người dùng báo cáo',                             time: '15 phút trước',  group: 'today',     unread: true,  link: '/admin/moderate' },
  { id: 3,  type: 'inventory', icon: 'inventory_2',  iconCls: 'bg-amber-100 text-amber-600',       title: 'Sản phẩm sắp hết hàng',         desc: 'SP003 - Hạt giống lúa ST25 chỉ còn 3 đơn vị trong kho',                  time: '32 phút trước',  group: 'today',     unread: true,  link: '/admin/products' },
  { id: 4,  type: 'member',    icon: 'person_add',   iconCls: 'bg-primary/20 text-[#1B5E20]',      title: 'Thành viên mới đăng ký',        desc: 'Nguyễn Văn X vừa tạo tài khoản và xác minh email thành công',            time: '1 giờ trước',    group: 'today',     unread: true,  link: null              },
  { id: 5,  type: 'order',     icon: 'check_circle', iconCls: 'bg-green-100 text-green-600',       title: 'Đơn hàng hoàn thành #AG-9020',  desc: 'Trần Thị B xác nhận đã nhận hàng, đơn đã hoàn thành',                   time: '3 giờ trước',    group: 'today',     unread: false, link: '/admin/orders'   },
  { id: 6,  type: 'violation', icon: 'gavel',        iconCls: 'bg-red-100 text-red-600',           title: 'Bài viết #POST-2305 đã bị ẩn',  desc: 'Bài viết đã được ẩn do vi phạm tiêu chuẩn cộng đồng',                   time: 'Hôm qua 16:30',  group: 'yesterday', unread: false, link: '/admin/moderate' },
  { id: 7,  type: 'order',     icon: 'shopping_bag', iconCls: 'bg-blue-100 text-blue-600',         title: '5 đơn hàng mới trong ngày',     desc: 'Tổng doanh thu đạt 12.4Mđ, cao hơn 18% so với ngày hôm kia',             time: 'Hôm qua 23:59',  group: 'yesterday', unread: false, link: '/admin/orders'   },
  { id: 8,  type: 'inventory', icon: 'warning',      iconCls: 'bg-amber-100 text-amber-600',       title: 'SP006 đã hết hàng',             desc: 'Hạt giống ngô nếp AG399 đã hết hàng, cần nhập thêm',                    time: 'Hôm qua 14:15',  group: 'yesterday', unread: true,  link: '/admin/products' },
  { id: 9,  type: 'member',    icon: 'people',       iconCls: 'bg-primary/20 text-[#1B5E20]',      title: '12 thành viên mới hôm qua',     desc: 'Tổng cộng 12 tài khoản mới đăng ký, tăng 31% so với ngày trước',        time: 'Hôm qua 23:59',  group: 'yesterday', unread: false, link: null              },
  { id: 10, type: 'order',     icon: 'local_shipping',iconCls: 'bg-sky-100 text-sky-600',          title: 'Đơn #AG-9010 giao thành công',  desc: 'Lê Văn C đã xác nhận nhận hàng thành công sau 2 ngày giao',             time: '3 ngày trước',   group: 'week',      unread: false, link: '/admin/orders'   },
  { id: 11, type: 'violation', icon: 'pending_actions',iconCls: 'bg-red-100 text-red-600',         title: '8 bài viết chờ kiểm duyệt',     desc: 'Có 8 bài viết đang chờ phê duyệt trong hàng đợi kiểm duyệt',            time: '4 ngày trước',   group: 'week',      unread: false, link: '/admin/moderate' },
  { id: 12, type: 'inventory', icon: 'inventory_2',  iconCls: 'bg-amber-100 text-amber-600',       title: 'Cảnh báo tồn kho thấp',         desc: '3 sản phẩm có tồn kho dưới 10 đơn vị, cần bổ sung ngay',                time: '5 ngày trước',   group: 'week',      unread: false, link: '/admin/products' },
  { id: 13, type: 'member',    icon: 'person_add',   iconCls: 'bg-primary/20 text-[#1B5E20]',      title: 'Thành viên mới: Phạm Minh Tuấn','desc': 'Phạm Minh Tuấn đăng ký và hoàn thành hồ sơ cá nhân',                  time: '5 ngày trước',   group: 'week',      unread: false, link: null              },
];

// ── Page ─────────────────────────────────────────────────────────────────────

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [items, setItems]       = useState(MOCK);
  const [search, setSearch]     = useState('');
  const [filter, setFilter]     = useState('all');

  const unreadCount = items.filter(n => n.unread).length;

  const filtered = items.filter(n => {
    const matchSearch = !search ||
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.desc.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === 'all'       ? true :
      filter === 'unread'    ? n.unread :
      n.type === filter;
    return matchSearch && matchFilter;
  });

  const countOf = (f) =>
    f === 'all'    ? items.length :
    f === 'unread' ? items.filter(n => n.unread).length :
    items.filter(n => n.type === f).length;

  const FILTERS = [
    { value: 'all',       label: 'Tất cả'       },
    { value: 'unread',    label: 'Chưa đọc'      },
    { value: 'order',     label: 'Đơn hàng'      },
    { value: 'violation', label: 'Vi phạm'        },
    { value: 'inventory', label: 'Hàng tồn kho'  },
    { value: 'member',    label: 'Thành viên'     },
  ];

  const markAllRead = () => setItems(prev => prev.map(n => ({ ...n, unread: false })));

  const markOne = (id) =>
    setItems(prev => prev.map(n => n.id === id ? { ...n, unread: !n.unread } : n));

  const deleteOne = (id) =>
    setItems(prev => prev.filter(n => n.id !== id));

  // Group filtered items by time group preserving order
  const groups = ['today', 'yesterday', 'week'].reduce((acc, g) => {
    const list = filtered.filter(n => n.group === g);
    if (list.length) acc.push({ key: g, label: GROUP_LABELS[g], items: list });
    return acc;
  }, []);

  return (
    <AdminLayout>
      <>
        <LoadingOverlay visible={false} />

        {/* ── Header ────────────────────────────────────────────────── */}
        <header className="sticky top-0 z-10 bg-white/80 dark:bg-[#152210]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">Thông báo</h2>
              {unreadCount > 0 && (
                <span className="min-w-[22px] h-5 px-1.5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
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
            {unreadCount > 0 && (
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

          {/* Notification groups */}
          {groups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
              <span className="material-symbols-outlined text-5xl">notifications_off</span>
              <p className="text-base font-semibold">Không có thông báo nào</p>
            </div>
          ) : (
            <div className="space-y-6">
              {groups.map(group => (
                <div key={group.key}>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                    {group.label}
                  </p>
                  <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-slate-700">
                    {group.items.map(notif => (
                      <div
                        key={notif.id}
                        className={`flex items-start gap-4 px-5 py-4 group transition-colors ${
                          notif.unread
                            ? 'bg-primary/[0.03] hover:bg-primary/[0.06]'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-700/30'
                        }`}
                      >
                        {/* Unread dot */}
                        <div className="flex items-center justify-center w-2 shrink-0 mt-3">
                          {notif.unread && (
                            <span className="size-2 rounded-full bg-primary shrink-0" />
                          )}
                        </div>

                        {/* Icon */}
                        <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${notif.iconCls}`}>
                          <span className="material-symbols-outlined text-xl">{notif.icon}</span>
                        </div>

                        {/* Content */}
                        <div
                          className="flex-1 min-w-0 cursor-pointer"
                          onClick={() => {
                            if (notif.unread) markOne(notif.id);
                            if (notif.link) navigate(notif.link);
                          }}
                        >
                          <p className={`text-sm leading-snug ${
                            notif.unread
                              ? 'font-bold text-slate-800 dark:text-slate-100'
                              : 'font-semibold text-slate-700 dark:text-slate-300'
                          }`}>
                            {notif.title}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                            {notif.desc}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-1.5 font-medium">
                            {notif.time}
                          </p>
                        </div>

                        {/* Actions — show on hover */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1">
                          <button
                            onClick={() => markOne(notif.id)}
                            className="p-1.5 text-slate-400 hover:text-[#1B5E20] dark:hover:text-primary rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                            title={notif.unread ? 'Đánh dấu đã đọc' : 'Đánh dấu chưa đọc'}
                          >
                            <span className="material-symbols-outlined text-lg">
                              {notif.unread ? 'mark_email_read' : 'mark_email_unread'}
                            </span>
                          </button>
                          <button
                            onClick={() => deleteOne(notif.id)}
                            className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            title="Xóa thông báo"
                          >
                            <span className="material-symbols-outlined text-lg">delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
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
