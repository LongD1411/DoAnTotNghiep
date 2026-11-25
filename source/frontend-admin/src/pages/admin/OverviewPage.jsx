import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import AdminLayout from '../../components/admin/AdminLayout';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import Select from '../../components/common/Select';
import NotificationBell from '../../components/common/NotificationBell';
import { getMyOrders } from '../../services/orderService';
import { getPosts } from '../../services/postService';
import { getAllUsers } from '../../services/userService';
import { toastService, errMsg } from '../../services/toastService';
import { ORDER_STATUS_LABEL } from '../../utils/orderStatus';

// ── Hằng số & helper ──────────────────────────────────────────────────────────

const NOW        = new Date();
const NOW_YEAR   = NOW.getFullYear();
const NOW_MONTH  = NOW.getMonth() + 1; // 1-12
const MONTHS     = ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'];

// Năm hiện tại → hiển thị đến tháng hiện tại; năm khác → đủ 12 tháng
const monthCount = (year) => Number(year) === NOW_YEAR ? NOW_MONTH : 12;

const YEAR_OPTIONS = Array.from(
  { length: NOW_YEAR - 2023 + 1 },
  (_, i) => { const y = String(2023 + i); return { value: y, label: y }; }
);

const STAT_COLORS = {
  green: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600' },
  blue:  { bg: 'bg-blue-100 dark:bg-blue-900/30',   text: 'text-blue-600'  },
  amber: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-600' },
  sky:   { bg: 'bg-sky-100 dark:bg-sky-900/30',     text: 'text-sky-600'   },
};

const PERIODS = [
  { value: 'month',   label: 'Tháng này'  },
  { value: 'week',    label: '7 ngày qua' },
  { value: 'quarter', label: 'Quý này'    },
  { value: 'year',    label: 'Năm nay'    },
];

const HELP_ITEMS = [
  { icon: 'payments',    title: 'Stat cards',            desc: 'Doanh thu, đơn hàng, thành viên và hoạt động diễn đàn theo kỳ đã chọn (so với kỳ trước). Tính từ dữ liệu thật.' },
  { icon: 'show_chart',  title: 'Biểu đồ doanh thu',    desc: 'Tổng doanh thu theo tháng (triệu đồng), tính từ các đơn không bị huỷ. Chọn năm ở góc phải.' },
  { icon: 'bar_chart',   title: 'Biểu đồ đơn & thành viên', desc: 'Số đơn hàng và thành viên mới theo tháng.' },
  { icon: 'receipt_long',title: 'Giao dịch gần đây',    desc: 'Các đơn hàng mới nhất. Click để vào trang Đơn hàng.' },
  { icon: 'forum',       title: 'Bài viết mới nhất',    desc: 'Bài viết cộng đồng mới nhất. Click để vào trang Quản lý cộng đồng.' },
];

const fmtVnd     = (n) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n || 0);
const compactVnd = (n) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', notation: 'compact', maximumFractionDigits: 1 }).format(n || 0);
const inRange    = (iso, start, end) => { const t = new Date(iso).getTime(); return t >= start && t < end; };

const relTime = (iso) => {
  if (!iso) return '';
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1)  return 'Vừa xong';
  if (m < 60) return `${m} phút trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ trước`;
  return `${Math.floor(h / 24)} ngày trước`;
};

// ── Custom Tooltip ────────────────────────────────────────────────────────────

const RevenueTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-lg text-sm">
      <p className="font-bold text-slate-700 mb-1">{label}</p>
      <p className="text-[#1B5E20] font-semibold">{payload[0].value}Mđ</p>
    </div>
  );
};

const OrdersTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-lg text-sm">
      <p className="font-bold text-slate-700 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-semibold">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

// ── Page ─────────────────────────────────────────────────────────────────────

const OverviewPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading]   = useState(true);
  const [orders, setOrders]     = useState([]);
  const [posts, setPosts]       = useState([]);
  const [users, setUsers]       = useState([]);

  const [search, setSearch]           = useState('');
  const [showHelp, setShowHelp]       = useState(false);
  const [period, setPeriod]           = useState('month');
  const [revenueYear, setRevenueYear] = useState(String(NOW_YEAR));
  const [ordersYear, setOrdersYear]   = useState(String(NOW_YEAR));
  const [nowTs]                       = useState(() => Date.now()); // mốc "bây giờ" cố định trong phiên (tránh gọi Date.now() khi render)

  // Nạp dữ liệu thật (giới hạn 100 bản ghi mỗi loại — max của API)
  useEffect(() => {
    Promise.all([
      getMyOrders({ limit: 100 }),
      getPosts({ limit: 100 }),
      getAllUsers({ limit: 100 }),
    ])
      .then(([o, po, u]) => {
        setOrders(o.data.data.data ?? []);
        setPosts(po.data.data.data ?? []);
        setUsers(u.data.data.data ?? []);
      })
      .catch(err => toastService.error(errMsg(err)))
      .finally(() => setLoading(false));
  }, []);

  // ── Stat cards (kỳ hiện tại vs kỳ trước) ─────────────────────────────────────
  const stats = useMemo(() => {
    const d = new Date(nowTs);
    const y = d.getFullYear(), mo = d.getMonth();
    let curStart, prevStart, prevEnd;
    if (period === 'week')        { curStart = nowTs - 7 * 864e5; prevEnd = curStart; prevStart = curStart - 7 * 864e5; }
    else if (period === 'month')  { curStart = new Date(y, mo, 1).getTime();      prevStart = new Date(y, mo - 1, 1).getTime(); prevEnd = curStart; }
    else if (period === 'quarter'){ const q = Math.floor(mo / 3); curStart = new Date(y, q * 3, 1).getTime(); prevStart = new Date(y, q * 3 - 3, 1).getTime(); prevEnd = curStart; }
    else                          { curStart = new Date(y, 0, 1).getTime();       prevStart = new Date(y - 1, 0, 1).getTime(); prevEnd = curStart; }

    const metric = (start, end) => {
      const os = orders.filter(o => inRange(o.created_at, start, end));
      return {
        revenue:    os.filter(o => o.status !== 'cancelled').reduce((s, o) => s + (o.total || 0), 0),
        orderCount: os.length,
        members:    users.filter(u => u.role === 'customer' && inRange(u.createdAt, start, end)).length,
        forum:      posts.filter(p => inRange(p.created_at, start, end)).length,
      };
    };
    const cur  = metric(curStart, nowTs);
    const prev = metric(prevStart, prevEnd);
    const sub  = { month: 'so với tháng trước', week: 'so với tuần trước', quarter: 'so với quý trước', year: 'so với năm ngoái' }[period];

    const mk = (label, icon, color, c, p, fmt) => {
      const diff = c - p;
      const pct  = p > 0 ? Math.round((diff / p) * 100) : (c > 0 ? 100 : 0);
      const up   = diff >= 0;
      return { label, icon, color, value: fmt(c), trend: pct === 0 ? '0%' : `${up ? '+' : ''}${pct}%`, up, sub };
    };
    const num = (n) => n.toLocaleString('vi-VN');
    return [
      mk('Tổng doanh thu',     'payments',    'green', cur.revenue,    prev.revenue,    compactVnd),
      mk('Tổng đơn hàng',      'shopping_bag', 'blue',  cur.orderCount, prev.orderCount, num),
      mk('Thành viên mới',      'person_add',   'amber', cur.members,    prev.members,    num),
      mk('Hoạt động diễn đàn', 'forum',        'sky',   cur.forum,      prev.forum,      num),
    ];
  }, [orders, users, posts, period, nowTs]);

  // ── Dữ liệu biểu đồ ──────────────────────────────────────────────────────────
  const revenueData = useMemo(() => {
    const arr = MONTHS.slice(0, monthCount(revenueYear)).map(month => ({ month, revenue: 0 }));
    orders.filter(o => o.status !== 'cancelled').forEach(o => {
      const d = new Date(o.created_at);
      if (d.getFullYear() !== Number(revenueYear)) return;
      const mi = d.getMonth();
      if (mi < arr.length) arr[mi].revenue += (o.total || 0);
    });
    return arr.map(x => ({ month: x.month, revenue: Math.round((x.revenue / 1e6) * 10) / 10 }));
  }, [orders, revenueYear]);

  const ordersData = useMemo(() => {
    const arr = MONTHS.slice(0, monthCount(ordersYear)).map(month => ({ month, orders: 0, members: 0 }));
    orders.forEach(o => {
      const d = new Date(o.created_at);
      if (d.getFullYear() === Number(ordersYear)) { const mi = d.getMonth(); if (mi < arr.length) arr[mi].orders += 1; }
    });
    users.filter(u => u.role === 'customer').forEach(u => {
      const d = new Date(u.createdAt);
      if (d.getFullYear() === Number(ordersYear)) { const mi = d.getMonth(); if (mi < arr.length) arr[mi].members += 1; }
    });
    return arr;
  }, [orders, users, ordersYear]);

  const recentOrders = useMemo(
    () => [...orders].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5),
    [orders],
  );
  const recentPosts = useMemo(
    () => [...posts].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 3),
    [posts],
  );

  return (
    <AdminLayout>
      <>
        <LoadingOverlay visible={loading} />

        {/* ── Header ──────────────────────────────────────────────────── */}
        <header className="sticky top-0 z-10 bg-white/80 dark:bg-[#152210]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">Tổng quan hệ thống</h2>
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-1.5 border border-slate-200 dark:border-slate-700">
              <span className="material-symbols-outlined text-slate-400 text-xl">search</span>
              <input
                className="bg-transparent border-none outline-none focus:ring-0 text-sm w-64 placeholder:text-slate-400"
                placeholder="Tìm kiếm thông tin..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-1">

            {/* Notification (realtime SSE) */}
            <NotificationBell
              scope="admin"
              viewAllTo="/admin/notifications"
              triggerClassName="relative p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            />

            {/* Help */}
            <button
              onClick={() => setShowHelp(true)}
              className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              title="Hướng dẫn"
            >
              <span className="material-symbols-outlined">help</span>
            </button>
          </div>
        </header>

        {/* ── Content ─────────────────────────────────────────────────── */}
        <div className="p-8 space-y-8">

          {/* Period tabs + Stat Cards */}
          <div className="space-y-4">
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
              {PERIODS.map(p => (
                <button
                  key={p.value}
                  onClick={() => setPeriod(p.value)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                    period === p.value
                      ? 'bg-white dark:bg-slate-700 text-[#1B5E20] dark:text-primary shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map(stat => {
                const c = STAT_COLORS[stat.color];
                return (
                  <div key={stat.label} className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
                    <div className={`${c.bg} ${c.text} p-3 rounded-xl shrink-0`}>
                      <span className="material-symbols-outlined text-3xl">{stat.icon}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate">{stat.label}</p>
                      <h3 className="text-2xl font-extrabold dark:text-white">{stat.value}</h3>
                      <p className={`text-xs font-bold flex items-center gap-0.5 ${stat.up ? 'text-green-600' : 'text-red-500'}`}>
                        <span className="material-symbols-outlined text-xs">{stat.up ? 'trending_up' : 'trending_down'}</span>
                        {stat.trend}
                        <span className="text-slate-400 font-normal ml-1">{stat.sub}</span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Area chart — Doanh thu */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50 rounded-t-xl">
                <div>
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Doanh thu theo tháng</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Đơn vị: triệu đồng</p>
                </div>
                <Select value={revenueYear} options={YEAR_OPTIONS} onChange={setRevenueYear} />
              </div>
              <div className="p-4 pt-6">
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={revenueData} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#4bee2b" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#4bee2b" stopOpacity={0}    />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}M`} />
                    <Tooltip content={<RevenueTooltip />} />
                    <Area
                      type="monotone" dataKey="revenue" name="Doanh thu"
                      stroke="#1B5E20" strokeWidth={2.5} fill="url(#revenueGradient)"
                      dot={{ r: 3, fill: '#1B5E20', strokeWidth: 0 }}
                      activeDot={{ r: 5, fill: '#4bee2b', stroke: '#1B5E20', strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bar chart — Đơn hàng & Thành viên */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50 rounded-t-xl">
                <div>
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Đơn hàng & Thành viên mới</h4>
                  <p className="text-xs text-slate-400 mt-0.5">So sánh theo tháng</p>
                </div>
                <Select value={ordersYear} options={YEAR_OPTIONS} onChange={setOrdersYear} />
              </div>
              <div className="p-4 pt-6">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={ordersData} margin={{ top: 4, right: 8, left: -10, bottom: 0 }} barGap={3}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip content={<OrdersTooltip />} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Bar dataKey="orders"  name="Đơn hàng"      fill="#1B5E20" radius={[4, 4, 0, 0]} maxBarSize={20} />
                    <Bar dataKey="members" name="Thành viên mới" fill="#4bee2b" radius={[4, 4, 0, 0]} maxBarSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Two-column: Recent Orders + Posts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Recent Orders — 2/3 */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
              <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Giao dịch gần đây</h4>
                <Link to="/admin/orders" className="text-xs font-bold text-[#1B5E20] dark:text-primary hover:text-primary transition-colors">
                  Xem tất cả
                </Link>
              </div>
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Mã đơn</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Khách hàng</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Tổng tiền</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {recentOrders.length === 0 && !loading && (
                      <tr><td colSpan={4} className="px-6 py-10 text-center text-sm text-slate-400">Chưa có đơn hàng nào</td></tr>
                    )}
                    {recentOrders.map(order => {
                      const st = ORDER_STATUS_LABEL[order.status] ?? ORDER_STATUS_LABEL.pending;
                      return (
                        <tr
                          key={order.id}
                          onClick={() => navigate(`/admin/edit-order/${order.id}`)}
                          className="hover:bg-primary/5 transition-colors cursor-pointer"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-[#1B5E20] dark:text-primary">{order.code}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold dark:text-slate-200">{order.address?.full_name ?? 'Khách'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-right dark:text-slate-200">{fmtVnd(order.total)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${st.cls}`}>
                              {st.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Posts — 1/3 */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
              <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Bài viết mới nhất</h4>
                <Link to="/dien-dan/kiem-duyet" className="text-xs font-bold text-[#1B5E20] dark:text-primary hover:text-primary transition-colors">
                  Xem diễn đàn
                </Link>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {recentPosts.length === 0 && !loading && (
                  <p className="p-6 text-center text-sm text-slate-400">Chưa có bài viết nào</p>
                )}
                {recentPosts.map(post => (
                  <div
                    key={post.id}
                    onClick={() => navigate(`/dien-dan/${post.slug}`)}
                    className="p-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-[#1B5E20] dark:text-primary shrink-0">
                        <span className="material-symbols-outlined text-xl">forum</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="text-sm font-bold text-slate-800 dark:text-slate-200 line-clamp-1 group-hover:text-[#1B5E20] dark:group-hover:text-primary">
                          {post.title}
                        </h5>
                        <p className="text-xs text-slate-500 mt-1">
                          Bởi <span className="font-semibold">{post.user?.name ?? 'Ẩn danh'}</span> • {relTime(post.created_at)}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                            <span className="material-symbols-outlined text-xs">chat_bubble</span>{post.comment_count ?? 0}
                          </span>
                          <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                            <span className="material-symbols-outlined text-xs">visibility</span>{post.view_count ?? 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Help modal ──────────────────────────────────────────────── */}
        {showHelp && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => setShowHelp(false)}
          >
            <div
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#1B5E20] dark:text-primary">help</span>
                  <h3 className="text-base font-bold text-slate-800 dark:text-white">Hướng dẫn sử dụng Dashboard</h3>
                </div>
                <button onClick={() => setShowHelp(false)} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <ul className="divide-y divide-slate-100 dark:divide-slate-700">
                {HELP_ITEMS.map(item => (
                  <li key={item.title} className="flex items-start gap-4 px-6 py-4">
                    <div className="bg-primary/10 text-[#1B5E20] dark:text-primary p-2 rounded-lg shrink-0 mt-0.5">
                      <span className="material-symbols-outlined text-xl">{item.icon}</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{item.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-700">
                <button
                  onClick={() => setShowHelp(false)}
                  className="w-full py-2 bg-primary text-[#1B5E20] rounded-lg font-bold text-sm hover:opacity-90 transition-opacity"
                >
                  Đã hiểu
                </button>
              </div>
            </div>
          </div>
        )}

      </>
    </AdminLayout>
  );
};

export default OverviewPage;
