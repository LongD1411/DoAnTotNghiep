import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import Select from '../../components/common/Select';

// ── Constants ────────────────────────────────────────────────────────────────

const PER_PAGE = 10;

const STATUS_CONFIG = {
  'xu-ly':     { label: 'Đang xử lý', cls: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800' },
  'dang-giao': { label: 'Đang giao',  cls: 'bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-900/40 dark:text-sky-300 dark:border-sky-800'             },
  'hoan-thanh':{ label: 'Hoàn thành', cls: 'bg-primary/20 text-[#1B5E20] border-primary/30 dark:text-primary'                                             },
  'da-huy':    { label: 'Đã hủy',     cls: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800'               },
};

const STATUS_OPTIONS = [
  { value: 'all',        label: 'Tất cả trạng thái' },
  { value: 'xu-ly',      label: 'Đang xử lý'        },
  { value: 'dang-giao',  label: 'Đang giao'          },
  { value: 'hoan-thanh', label: 'Hoàn thành'         },
  { value: 'da-huy',     label: 'Đã hủy'             },
];

const STATS = [
  { label: 'Tổng đơn hàng',  value: '1,240', icon: 'list_alt',        color: 'blue',  trend: '+12%', up: true  },
  { label: 'Đang xử lý',     value: '45',    icon: 'pending_actions',  color: 'amber', trend: '-5%',  up: false },
  { label: 'Đang giao',      value: '128',   icon: 'local_shipping',   color: 'sky',   trend: '+8%',  up: true  },
  { label: 'Đã hoàn thành',  value: '1,067', icon: 'check_circle',     color: 'green', trend: '+15%', up: true  },
];

const STAT_COLORS = {
  blue:  { bg: 'bg-blue-100 dark:bg-blue-900/30',   text: 'text-blue-600'  },
  amber: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-600' },
  sky:   { bg: 'bg-sky-100 dark:bg-sky-900/30',     text: 'text-sky-600'   },
  green: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600' },
};

const MOCK_ORDERS = [
  { id: 1,  code: '#AG-8821', customer: 'Nguyễn Văn A',    total: '2.500.000đ', status: 'xu-ly',      method: 'COD',          date: '12/10/2023 08:30' },
  { id: 2,  code: '#AG-8822', customer: 'Trần Thị B',      total: '1.200.000đ', status: 'dang-giao',  method: 'Chuyển khoản', date: '12/10/2023 09:15' },
  { id: 3,  code: '#AG-8823', customer: 'Lê Văn C',        total: '4.850.000đ', status: 'hoan-thanh', method: 'Ví điện tử',   date: '11/10/2023 16:45' },
  { id: 4,  code: '#AG-8824', customer: 'Phạm Minh D',     total: '950.000đ',   status: 'da-huy',     method: 'COD',          date: '11/10/2023 14:20' },
  { id: 5,  code: '#AG-8825', customer: 'Hoàng Thị E',     total: '3.100.000đ', status: 'dang-giao',  method: 'Chuyển khoản', date: '11/10/2023 11:00' },
  { id: 6,  code: '#AG-8826', customer: 'Vũ Thanh F',      total: '780.000đ',   status: 'hoan-thanh', method: 'COD',          date: '10/10/2023 17:30' },
  { id: 7,  code: '#AG-8827', customer: 'Đặng Quốc G',     total: '5.200.000đ', status: 'xu-ly',      method: 'Ví điện tử',   date: '10/10/2023 13:45' },
  { id: 8,  code: '#AG-8828', customer: 'Bùi Thị H',       total: '2.050.000đ', status: 'hoan-thanh', method: 'Chuyển khoản', date: '10/10/2023 10:00' },
  { id: 9,  code: '#AG-8829', customer: 'Ngô Văn I',       total: '1.650.000đ', status: 'dang-giao',  method: 'COD',          date: '09/10/2023 15:20' },
  { id: 10, code: '#AG-8830', customer: 'Lý Thị K',        total: '3.400.000đ', status: 'hoan-thanh', method: 'Ví điện tử',   date: '09/10/2023 09:50' },
  { id: 11, code: '#AG-8831', customer: 'Trịnh Văn L',     total: '620.000đ',   status: 'da-huy',     method: 'COD',          date: '08/10/2023 16:10' },
  { id: 12, code: '#AG-8832', customer: 'Đinh Thị M',      total: '4.100.000đ', status: 'xu-ly',      method: 'Chuyển khoản', date: '08/10/2023 11:35' },
  { id: 13, code: '#AG-8833', customer: 'Phan Quốc N',     total: '1.890.000đ', status: 'dang-giao',  method: 'Ví điện tử',   date: '08/10/2023 08:00' },
  { id: 14, code: '#AG-8834', customer: 'Mai Thị O',       total: '2.750.000đ', status: 'hoan-thanh', method: 'COD',          date: '07/10/2023 17:00' },
  { id: 15, code: '#AG-8835', customer: 'Cao Văn P',       total: '990.000đ',   status: 'xu-ly',      method: 'Chuyển khoản', date: '07/10/2023 14:30' },
  { id: 16, code: '#AG-8836', customer: 'Lương Thị Q',     total: '3.700.000đ', status: 'hoan-thanh', method: 'Ví điện tử',   date: '07/10/2023 10:15' },
  { id: 17, code: '#AG-8837', customer: 'Tô Minh R',       total: '1.350.000đ', status: 'dang-giao',  method: 'COD',          date: '06/10/2023 16:45' },
  { id: 18, code: '#AG-8838', customer: 'Hà Thị S',        total: '2.200.000đ', status: 'da-huy',     method: 'Chuyển khoản', date: '06/10/2023 13:00' },
  { id: 19, code: '#AG-8839', customer: 'Lâm Quốc T',     total: '4.600.000đ', status: 'hoan-thanh', method: 'Ví điện tử',   date: '06/10/2023 09:20' },
  { id: 20, code: '#AG-8840', customer: 'Châu Thị U',      total: '1.080.000đ', status: 'xu-ly',      method: 'COD',          date: '05/10/2023 15:40' },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

const getInitials = (name) => {
  const parts = name.trim().split(' ');
  return (parts[0][0] + (parts[parts.length - 1][0] ?? '')).toUpperCase();
};

const getPageNumbers = (current, total) => {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 3) return [1, 2, 3, '...', total];
  if (current >= total - 2) return [1, '...', total - 2, total - 1, total];
  return [1, '...', current - 1, current, current + 1, '...', total];
};

// ── Page ─────────────────────────────────────────────────────────────────────

const OrdersPage = () => {
  const navigate = useNavigate();
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const listRef = useRef(null);

  const filtered = MOCK_ORDERS.filter(o => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      o.code.toLowerCase().includes(q) ||
      o.customer.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated  = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const goToPage = (page) => {
    setCurrentPage(page);
    if (listRef.current) {
      const y = listRef.current.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const handleStatusChange = (val) => { setStatusFilter(val); setCurrentPage(1); };
  const handleSearch = (e) => { setSearch(e.target.value); setCurrentPage(1); };

  const start = filtered.length === 0 ? 0 : (currentPage - 1) * PER_PAGE + 1;
  const end   = Math.min(currentPage * PER_PAGE, filtered.length);

  return (
    <AdminLayout>
      <>
        <LoadingOverlay visible={false} />

        {/* ── Header ────────────────────────────────────────────────── */}
        <header className="sticky top-0 z-10 bg-white/80 dark:bg-[#152210]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">Quản lý đơn hàng</h2>
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-1.5 border border-slate-200 dark:border-slate-700">
              <span className="material-symbols-outlined text-slate-400 text-xl">search</span>
              <input
                className="bg-transparent border-none outline-none focus:ring-0 text-sm w-64 placeholder:text-slate-400"
                placeholder="Tìm mã đơn, khách hàng..."
                value={search}
                onChange={handleSearch}
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 cursor-pointer hover:border-primary transition-all">
              <span className="material-symbols-outlined text-slate-500 text-lg">calendar_month</span>
              <span className="text-xs font-semibold">12/10/2023 - 19/10/2023</span>
            </div>
            <button className="flex items-center gap-2 bg-primary text-[#1B5E20] px-4 py-2 rounded-lg font-bold text-sm shadow-sm hover:opacity-90 transition-opacity">
              <span className="material-symbols-outlined text-lg">download</span>
              Tải báo cáo
            </button>
            <div className="flex items-center gap-1 border-l border-slate-200 dark:border-slate-700 ml-2 pl-4">
              <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                <span className="material-symbols-outlined">notifications</span>
              </button>
              <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                <span className="material-symbols-outlined">help</span>
              </button>
            </div>
          </div>
        </header>

        {/* ── Content ───────────────────────────────────────────────── */}
        <div className="p-8 space-y-8">

          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS.map(stat => {
              const c = STAT_COLORS[stat.color];
              return (
                <div key={stat.label} className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
                  <div className={`${c.bg} ${c.text} p-3 rounded-xl`}>
                    <span className="material-symbols-outlined text-3xl">{stat.icon}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
                    <h3 className="text-2xl font-extrabold dark:text-white">{stat.value}</h3>
                    <p className={`text-xs font-bold flex items-center gap-0.5 ${stat.up ? 'text-green-600' : 'text-red-500'}`}>
                      {stat.trend}
                      <span className="material-symbols-outlined text-xs">{stat.up ? 'trending_up' : 'trending_down'}</span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Table Card */}
          <div ref={listRef} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">

            {/* Toolbar */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
              <div className="flex items-center gap-4">
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Danh sách đơn hàng</h4>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Bộ lọc:</span>
                  <Select
                    value={statusFilter}
                    options={STATUS_OPTIONS}
                    onChange={handleStatusChange}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setSearch(''); setStatusFilter('all'); setCurrentPage(1); }}
                  className="p-1.5 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition-colors"
                  title="Làm mới"
                >
                  <span className="material-symbols-outlined text-sm">refresh</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Mã đơn hàng</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Khách hàng</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Tổng tiền</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Trạng thái</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Phương thức</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Ngày đặt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-400">
                        Không tìm thấy đơn hàng nào
                      </td>
                    </tr>
                  ) : paginated.map(order => {
                    const st = STATUS_CONFIG[order.status];
                    return (
                      <tr key={order.id} onClick={() => navigate(`/admin/edit-order/${order.id}`)} className="hover:bg-primary/5 transition-colors cursor-pointer">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-[#1B5E20] dark:text-primary">
                          {order.code}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="size-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-600 shrink-0">
                              {getInitials(order.customer)}
                            </div>
                            <span className="text-sm font-semibold dark:text-slate-200">{order.customer}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-right dark:text-slate-200">
                          {order.total}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${st.cls}`}>
                            {st.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                          {order.method}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                          {order.date}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/30 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between flex-wrap gap-3">
              <p className="text-sm text-slate-500 font-medium">
                Hiển thị{' '}
                <span className="text-slate-900 dark:text-white font-bold">{start}-{end}</span>
                {' '}trong số{' '}
                <span className="text-slate-900 dark:text-white font-bold">{filtered.length}</span>
                {' '}đơn hàng
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-sm">chevron_left</span>
                </button>

                {getPageNumbers(currentPage, totalPages).map((p, i) =>
                  p === '...' ? (
                    <span key={`ellipsis-${i}`} className="text-slate-400 px-1">...</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => goToPage(p)}
                      className={`size-8 rounded-lg text-sm font-bold flex items-center justify-center transition-colors ${
                        p === currentPage
                          ? 'bg-primary text-[#1B5E20]'
                          : 'hover:bg-slate-200 dark:hover:bg-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      </>
    </AdminLayout>
  );
};

export default OrdersPage;
