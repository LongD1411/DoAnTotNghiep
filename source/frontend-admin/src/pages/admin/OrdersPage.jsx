import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import Select from '../../components/common/Select';
import { getMyOrders } from '../../services/orderService';
import { toastService, errMsg } from '../../services/toastService';
import { ORDER_STATUS_LABEL } from '../../utils/orderStatus';

// ── Constants ────────────────────────────────────────────────────────────────

const PER_PAGE = 10;

const STATUS_OPTIONS = [
  { value: 'all',        label: 'Tất cả trạng thái' },
  { value: 'pending',    label: 'Chờ xử lý'   },
  { value: 'approved',   label: 'Đã xác nhận' },
  { value: 'delivering', label: 'Đang giao'   },
  { value: 'delivered',  label: 'Đã giao'     },
  { value: 'completed',  label: 'Hoàn tất'    },
  { value: 'cancelled',  label: 'Đã huỷ'      },
];

const PAYMENT_LABEL = { cod: 'COD', bank_transfer: 'Chuyển khoản', vnpay: 'VNPay' };

const STAT_COLORS = {
  blue:  { bg: 'bg-blue-100 dark:bg-blue-900/30',   text: 'text-blue-600'  },
  amber: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-600' },
  sky:   { bg: 'bg-sky-100 dark:bg-sky-900/30',     text: 'text-sky-600'   },
  green: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600' },
};

// ── Helpers ──────────────────────────────────────────────────────────────────

const fmtVnd = (n) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n || 0);
const fmtDateTime = (iso) => (iso
  ? new Date(iso).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  : '—');

const getInitials = (name = '') => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
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
  const [orders, setOrders]             = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage]   = useState(1);
  const listRef = useRef(null);

  useEffect(() => {
    getMyOrders({ limit: 100 })
      .then(res => setOrders(res.data.data.data ?? []))
      .catch(err => toastService.error(errMsg(err)))
      .finally(() => setLoading(false));
  }, []);

  const refresh = () => {
    setLoading(true);
    setSearch(''); setStatusFilter('all'); setCurrentPage(1);
    getMyOrders({ limit: 100 })
      .then(res => setOrders(res.data.data.data ?? []))
      .catch(err => toastService.error(errMsg(err)))
      .finally(() => setLoading(false));
  };

  // Stat cards tính từ dữ liệu thật
  const stats = useMemo(() => {
    const by = (fn) => orders.filter(fn).length;
    return [
      { label: 'Tổng đơn hàng', value: orders.length,                                           icon: 'list_alt',         color: 'blue'  },
      { label: 'Chờ xử lý',     value: by(o => o.status === 'pending'),                          icon: 'pending_actions',  color: 'amber' },
      { label: 'Đang giao',     value: by(o => o.status === 'delivering'),                       icon: 'local_shipping',   color: 'sky'   },
      { label: 'Hoàn thành',    value: by(o => o.status === 'delivered' || o.status === 'completed'), icon: 'check_circle', color: 'green' },
    ];
  }, [orders]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter(o => {
      const name = (o.address?.full_name ?? '').toLowerCase();
      const matchSearch = !q || o.code.toLowerCase().includes(q) || name.includes(q);
      const matchStatus = statusFilter === 'all' || o.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [orders, search, statusFilter]);

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
        <LoadingOverlay visible={loading} />

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
        </header>

        {/* ── Content ───────────────────────────────────────────────── */}
        <div className="p-8 space-y-8">

          {/* Stat Cards */}
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
                    <h3 className="text-2xl font-extrabold dark:text-white">{stat.value.toLocaleString('vi-VN')}</h3>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Table Card */}
          <div ref={listRef} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">

            {/* Toolbar */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50 rounded-t-xl">
              <div className="flex items-center gap-4">
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Danh sách đơn hàng</h4>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Bộ lọc:</span>
                  <Select value={statusFilter} options={STATUS_OPTIONS} onChange={handleStatusChange} />
                </div>
              </div>
              <button
                onClick={refresh}
                className="p-1.5 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition-colors"
                title="Tải lại"
              >
                <span className="material-symbols-outlined text-sm">refresh</span>
              </button>
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
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Thanh toán</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Ngày đặt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-400">
                        {loading ? 'Đang tải...' : 'Không tìm thấy đơn hàng nào'}
                      </td>
                    </tr>
                  ) : paginated.map(order => {
                    const st = ORDER_STATUS_LABEL[order.status] ?? ORDER_STATUS_LABEL.pending;
                    const customer = order.address?.full_name ?? 'Khách';
                    const unpaid = order.payment_status !== 'paid';
                    return (
                      <tr key={order.id} onClick={() => navigate(`/admin/edit-order/${order.id}`)} className="hover:bg-primary/5 transition-colors cursor-pointer">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-[#1B5E20] dark:text-primary">
                          {order.code}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="size-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-600 shrink-0">
                              {getInitials(customer)}
                            </div>
                            <span className="text-sm font-semibold dark:text-slate-200">{customer}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-right dark:text-slate-200">
                          {fmtVnd(order.total)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${st.cls}`}>
                            <span className={`size-1.5 rounded-full ${st.dot}`} />{st.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                          <span>{PAYMENT_LABEL[order.payment_method] ?? order.payment_method}</span>
                          {unpaid
                            ? <span className="ml-2 text-[10px] font-bold text-amber-600">Chưa TT</span>
                            : <span className="ml-2 text-[10px] font-bold text-green-600">Đã TT</span>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                          {fmtDateTime(order.created_at)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/30 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between flex-wrap gap-3 rounded-b-xl">
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
