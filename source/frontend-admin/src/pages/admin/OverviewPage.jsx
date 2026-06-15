import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import AdminLayout from '../../components/admin/AdminLayout';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import Select from '../../components/common/Select';

// ── Chart data helpers ────────────────────────────────────────────────────────

const NOW_YEAR  = new Date().getFullYear();
const NOW_MONTH = new Date().getMonth() + 1; // 1-12
const MONTHS    = ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'];

// Số tháng hiển thị: năm hiện tại → chỉ đến tháng trước; năm khác → 12 tháng
const monthCount = (year) => Number(year) === NOW_YEAR ? NOW_MONTH - 1 : 12;

const YEAR_BASE = {
  '2023': { rev: 180, ord: 95,  mem: 42 },
  '2024': { rev: 240, ord: 130, mem: 68 },
  '2025': { rev: 310, ord: 175, mem: 95 },
  '2026': { rev: 400, ord: 220, mem: 125 },
};
const REV_DELTA  = [0, 18, -8, 22, 15, -5, 30, 35, 40, 20, 48, 55];
const ORD_DELTA  = [0, 15, -8, 18, 10, -5, 20, 18, 25, 10, 28, 30];
const MEM_DELTA  = [0,  8, -4, 12,  7, -3, 14, 12, 18,  8, 20, 22];

const genRevenue = (year) => {
  const base = YEAR_BASE[year]?.rev ?? 200;
  return MONTHS.slice(0, monthCount(year)).map((month, i) => ({
    month,
    revenue: Math.round(base + i * 28 + REV_DELTA[i]),
  }));
};

const genOrders = (year) => {
  const b = YEAR_BASE[year] ?? { ord: 100, mem: 50 };
  return MONTHS.slice(0, monthCount(year)).map((month, i) => ({
    month,
    orders:  Math.round(b.ord + i * 9  + ORD_DELTA[i]),
    members: Math.round(b.mem + i * 6  + MEM_DELTA[i]),
  }));
};

const YEAR_OPTIONS = Array.from(
  { length: NOW_YEAR - 2023 + 1 },
  (_, i) => { const y = String(2023 + i); return { value: y, label: y }; }
);

// ── Static data ───────────────────────────────────────────────────────────────

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

const STATS_DATA = {
  month: [
    { label: 'Tổng doanh thu',     value: '428.5Mđ', icon: 'payments',    color: 'green', trend: '+18%', up: true,  sub: 'so với tháng trước' },
    { label: 'Tổng đơn hàng',      value: '1,542',   icon: 'shopping_bag', color: 'blue',  trend: '+12%', up: true,  sub: 'so với tháng trước' },
    { label: 'Thành viên mới',      value: '856',     icon: 'person_add',   color: 'amber', trend: '+24%', up: true,  sub: 'so với tháng trước' },
    { label: 'Hoạt động diễn đàn', value: '3,210',   icon: 'forum',        color: 'sky',   trend: '-3%',  up: false, sub: 'so với tháng trước' },
  ],
  week: [
    { label: 'Tổng doanh thu',     value: '98.2Mđ',  icon: 'payments',    color: 'green', trend: '+8%',  up: true,  sub: 'so với tuần trước' },
    { label: 'Tổng đơn hàng',      value: '342',     icon: 'shopping_bag', color: 'blue',  trend: '+5%',  up: true,  sub: 'so với tuần trước' },
    { label: 'Thành viên mới',      value: '187',     icon: 'person_add',   color: 'amber', trend: '+31%', up: true,  sub: 'so với tuần trước' },
    { label: 'Hoạt động diễn đàn', value: '745',     icon: 'forum',        color: 'sky',   trend: '+2%',  up: true,  sub: 'so với tuần trước' },
  ],
  quarter: [
    { label: 'Tổng doanh thu',     value: '1.24Tđ',  icon: 'payments',    color: 'green', trend: '+22%', up: true,  sub: 'so với quý trước' },
    { label: 'Tổng đơn hàng',      value: '4,821',   icon: 'shopping_bag', color: 'blue',  trend: '+15%', up: true,  sub: 'so với quý trước' },
    { label: 'Thành viên mới',      value: '2,640',   icon: 'person_add',   color: 'amber', trend: '+19%', up: true,  sub: 'so với quý trước' },
    { label: 'Hoạt động diễn đàn', value: '9,870',   icon: 'forum',        color: 'sky',   trend: '-1%',  up: false, sub: 'so với quý trước' },
  ],
  year: [
    { label: 'Tổng doanh thu',     value: '4.85Tđ',  icon: 'payments',    color: 'green', trend: '+35%', up: true,  sub: 'so với năm ngoái' },
    { label: 'Tổng đơn hàng',      value: '18,540',  icon: 'shopping_bag', color: 'blue',  trend: '+28%', up: true,  sub: 'so với năm ngoái' },
    { label: 'Thành viên mới',      value: '10,230',  icon: 'person_add',   color: 'amber', trend: '+42%', up: true,  sub: 'so với năm ngoái' },
    { label: 'Hoạt động diễn đàn', value: '38,450',  icon: 'forum',        color: 'sky',   trend: '+7%',  up: true,  sub: 'so với năm ngoái' },
  ],
};

const RECENT_ORDERS = [
  { id: 9021, code: '#AG-9021', customer: 'Nguyễn Hoàng Nam', total: '3.200.000đ', status: 'Hoàn thành', statusClass: 'bg-primary/20 text-[#1B5E20] border-primary/30' },
  { id: 9022, code: '#AG-9022', customer: 'Lê Thị Cẩm Tú',   total: '1.450.000đ', status: 'Đang xử lý', statusClass: 'bg-amber-100 text-amber-800 border-amber-200'   },
  { id: 9023, code: '#AG-9023', customer: 'Phạm Văn Đồng',    total: '5.800.000đ', status: 'Đang giao',  statusClass: 'bg-sky-100 text-sky-800 border-sky-200'         },
  { id: 9024, code: '#AG-9024', customer: 'Trần Minh Quân',   total: '950.000đ',   status: 'Hoàn thành', statusClass: 'bg-primary/20 text-[#1B5E20] border-primary/30' },
];

const RECENT_POSTS = [
  { title: 'Cách xử lý rầy nâu cho lúa...', author: 'Lê Minh', time: '5 phút trước',  comments: 12, likes: 45,  icon: 'psychology_alt' },
  { title: 'Phân bón NPK loại nào tốt?',    author: 'Bùi Anh', time: '22 phút trước', comments: 8,  likes: 21,  icon: 'potted_plant'   },
  { title: 'Cập nhật giá nông sản hôm nay', author: 'Admin',   time: '1 giờ trước',   comments: 56, likes: 120, icon: 'news'           },
];

const NOTIFICATIONS = [
  { id: 1, icon: 'shopping_bag', iconCls: 'bg-blue-100 text-blue-600',       text: 'Đơn hàng #AG-9025 vừa được đặt',         time: '2 phút trước',  unread: true  },
  { id: 2, icon: 'report',       iconCls: 'bg-red-100 text-red-600',         text: 'Bài viết #POST-2310 bị báo cáo vi phạm', time: '15 phút trước', unread: true  },
  { id: 3, icon: 'person_add',   iconCls: 'bg-primary/15 text-[#1B5E20]',   text: 'Thành viên mới: Nguyễn Văn X đã đăng ký',time: '1 giờ trước',   unread: false },
  { id: 4, icon: 'inventory_2',  iconCls: 'bg-amber-100 text-amber-600',    text: 'Sản phẩm SP003 sắp hết hàng (còn 3)',    time: '2 giờ trước',   unread: false },
];

const HELP_ITEMS = [
  { icon: 'payments',    title: 'Stat cards',            desc: 'Tổng hợp doanh thu, đơn hàng, thành viên và hoạt động diễn đàn.' },
  { icon: 'show_chart',  title: 'Biểu đồ doanh thu',    desc: 'Doanh thu theo từng tháng (triệu đồng). Chọn năm bằng dropdown góc phải.' },
  { icon: 'bar_chart',   title: 'Biểu đồ đơn & thành viên', desc: 'So sánh số đơn hàng và thành viên mới. Năm hiện tại chỉ hiện đến tháng trước.' },
  { icon: 'receipt_long',title: 'Giao dịch gần đây',    desc: 'Danh sách 4 đơn hàng mới nhất. Click vào hàng để vào trang Đơn hàng.' },
  { icon: 'forum',       title: 'Bài viết mới nhất',    desc: 'Bài viết cộng đồng mới nhất. Click để vào trang Quản lý cộng đồng.' },
];

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
  const [search, setSearch]               = useState('');
  const [showNotifs, setShowNotifs]       = useState(false);
  const [showHelp, setShowHelp]           = useState(false);
  const [period, setPeriod]               = useState('month');
  const [revenueYear, setRevenueYear]     = useState(String(NOW_YEAR));
  const [ordersYear, setOrdersYear]       = useState(String(NOW_YEAR));
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const notifRef = useRef(null);

  const unreadCount = notifications.filter(n => n.unread).length;

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAllRead = () =>
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));

  const revenueData = genRevenue(revenueYear);
  const ordersData  = genOrders(ordersYear);

  return (
    <AdminLayout>
      <>
        <LoadingOverlay visible={false} />

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

            {/* Notification */}
            <div ref={notifRef} className="relative">
              <button
                onClick={() => setShowNotifs(v => !v)}
                className="relative p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <span className="material-symbols-outlined">notifications</span>
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifs && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Thông báo</span>
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} className="text-xs font-semibold text-[#1B5E20] dark:text-primary hover:underline">
                        Đánh dấu tất cả đã đọc
                      </button>
                    )}
                  </div>
                  <ul className="divide-y divide-slate-100 dark:divide-slate-700 max-h-72 overflow-y-auto">
                    {notifications.map(n => (
                      <li
                        key={n.id}
                        onClick={() => setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, unread: false } : x))}
                        className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${n.unread ? 'bg-primary/5' : ''}`}
                      >
                        <div className={`size-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${n.iconCls}`}>
                          <span className="material-symbols-outlined text-sm">{n.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs leading-snug ${n.unread ? 'font-semibold text-slate-800 dark:text-slate-100' : 'text-slate-600 dark:text-slate-400'}`}>
                            {n.text}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{n.time}</p>
                        </div>
                        {n.unread && <span className="size-2 bg-primary rounded-full shrink-0 mt-1.5" />}
                      </li>
                    ))}
                  </ul>
                  <div className="px-4 py-2.5 border-t border-slate-100 dark:border-slate-700 text-center">
                    <button
                      onClick={() => { setShowNotifs(false); navigate('/admin/notifications'); }}
                      className="text-xs font-bold text-[#1B5E20] dark:text-primary hover:underline"
                    >
                      Xem tất cả thông báo
                    </button>
                  </div>
                </div>
              )}
            </div>

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
            {/* Pill tabs */}
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

            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {STATS_DATA[period].map(stat => {
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
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                <div>
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Doanh thu theo tháng</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Đơn vị: triệu đồng</p>
                </div>
                <Select
                  value={revenueYear}
                  options={YEAR_OPTIONS}
                  onChange={setRevenueYear}
                />
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
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                <div>
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Đơn hàng & Thành viên mới</h4>
                  <p className="text-xs text-slate-400 mt-0.5">So sánh theo tháng</p>
                </div>
                <Select
                  value={ordersYear}
                  options={YEAR_OPTIONS}
                  onChange={setOrdersYear}
                />
              </div>
              <div className="p-4 pt-6">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={ordersData} margin={{ top: 4, right: 8, left: -10, bottom: 0 }} barGap={3}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
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
                    {RECENT_ORDERS.map(order => (
                      <tr
                        key={order.id}
                        onClick={() => navigate('/admin/orders')}
                        className="hover:bg-primary/5 transition-colors cursor-pointer"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-[#1B5E20] dark:text-primary">{order.code}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold dark:text-slate-200">{order.customer}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-right dark:text-slate-200">{order.total}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${order.statusClass}`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Posts — 1/3 */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
              <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Bài viết mới nhất</h4>
                <Link to="/admin/moderate" className="text-xs font-bold text-[#1B5E20] dark:text-primary hover:text-primary transition-colors">
                  Xem diễn đàn
                </Link>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {RECENT_POSTS.map(post => (
                  <div
                    key={post.title}
                    onClick={() => navigate('/admin/moderate')}
                    className="p-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-[#1B5E20] dark:text-primary shrink-0">
                        <span className="material-symbols-outlined text-xl">{post.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="text-sm font-bold text-slate-800 dark:text-slate-200 line-clamp-1 group-hover:text-[#1B5E20] dark:group-hover:text-primary">
                          {post.title}
                        </h5>
                        <p className="text-xs text-slate-500 mt-1">
                          Bởi <span className="font-semibold">{post.author}</span> • {post.time}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                            <span className="material-symbols-outlined text-xs">chat_bubble</span>{post.comments}
                          </span>
                          <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                            <span className="material-symbols-outlined text-xs">favorite</span>{post.likes}
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
