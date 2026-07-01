import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import Select from '../../components/common/Select';
import { getAllProducts } from '../../services/productService';
import { toastService, errMsg } from '../../services/toastService';

// ── Constants ────────────────────────────────────────────────────────────────

const PER_PAGE = 10;

const BTN_ADD = 'bg-primary text-[#1B5E20] px-4 py-2 rounded-lg font-bold text-sm shadow-sm hover:opacity-90 transition-opacity flex items-center gap-2';

const STATUS_OPTIONS = [
  { value: 'all',       label: 'Tất cả trạng thái' },
  { value: 'dang-ban',  label: 'Đang bán'           },
  { value: 'het-hang',  label: 'Hết hàng'            },
  { value: 'ngung-ban', label: 'Ngừng bán'           },
];

const STATUS_CONFIG = {
  'dang-ban':  { label: 'Đang bán',  cls: 'bg-primary/20 text-[#1B5E20] border-primary/30 dark:text-primary'                                       },
  'het-hang':  { label: 'Hết hàng',  cls: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800'         },
  'ngung-ban': { label: 'Ngừng bán', cls: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-700 dark:text-slate-400 dark:border-slate-600' },
};

const STAT_COLORS = {
  blue:  { bg: 'bg-blue-100 dark:bg-blue-900/30',   text: 'text-blue-600'  },
  amber: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-600' },
  sky:   { bg: 'bg-sky-100 dark:bg-sky-900/30',     text: 'text-sky-600'   },
  green: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600' },
};

// ── Helpers ──────────────────────────────────────────────────────────────────

// Trạng thái suy ra từ is_active + stock (model không có field status riêng)
const getStatus = (p) => {
  if (!p.is_active)        return 'ngung-ban';
  if ((p.stock ?? 0) === 0) return 'het-hang';
  return 'dang-ban';
};

const formatPrice = (n) => (n != null ? `${Number(n).toLocaleString('vi-VN')}đ` : '—');

const formatDate = (iso) => (iso ? new Date(iso).toLocaleDateString('vi-VN') : '—');

const stockBadge = (stock) => {
  if (stock === 0) return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300';
  if (stock <= 30) return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300';
  return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300';
};

const getPageNumbers = (current, total) => {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 3) return [1, 2, 3, '...', total];
  if (current >= total - 2) return [1, '...', total - 2, total - 1, total];
  return [1, '...', current - 1, current, current + 1, '...', total];
};

// ── Page ─────────────────────────────────────────────────────────────────────

const ProductsPage = () => {
  const navigate = useNavigate();
  const listRef  = useRef(null);

  const [products,       setProducts]       = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [search,         setSearch]         = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter,   setStatusFilter]   = useState('all');
  const [currentPage,    setCurrentPage]    = useState(1);

  // Fetch toàn bộ sản phẩm (tập nhỏ → lấy 1 lần, filter/phân trang client-side)
  useEffect(() => {
    setLoading(true);
    getAllProducts({ limit: 100 })
      .then(res => setProducts(res.data.data.data))
      .catch(err => toastService.error(errMsg(err)))
      .finally(() => setLoading(false));
  }, []);

  // Dropdown danh mục dựng từ dữ liệu thật (slug khớp DB)
  const categoryOptions = useMemo(() => {
    const map = new Map();
    products.forEach(p => { if (p.category) map.set(p.category.slug, p.category.name); });
    return [
      { value: 'all', label: 'Tất cả danh mục' },
      ...[...map].map(([slug, name]) => ({ value: slug, label: name })),
    ];
  }, [products]);

  // Stats tính từ dữ liệu thật
  const stats = useMemo(() => {
    const active   = products.filter(p => p.is_active && (p.stock ?? 0) > 0).length;
    const outStock = products.filter(p => p.is_active && (p.stock ?? 0) === 0).length;
    const inactive = products.filter(p => !p.is_active).length;
    return [
      { label: 'Tổng sản phẩm', value: products.length, icon: 'inventory_2', color: 'blue'  },
      { label: 'Đang bán',      value: active,           icon: 'store',       color: 'green' },
      { label: 'Hết hàng',      value: outStock,         icon: 'warning',     color: 'sky'   },
      { label: 'Ngừng bán',     value: inactive,         icon: 'block',       color: 'amber' },
    ];
  }, [products]);

  const filtered = products.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      p.name.toLowerCase().includes(q) ||
      String(p.id).includes(q);
    const matchCat    = categoryFilter === 'all' || p.category?.slug === categoryFilter;
    const matchStatus = statusFilter   === 'all' || getStatus(p) === statusFilter;
    return matchSearch && matchCat && matchStatus;
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

  const handleSearch   = (e)   => { setSearch(e.target.value); setCurrentPage(1); };
  const handleCategory = (val) => { setCategoryFilter(val);    setCurrentPage(1); };
  const handleStatus   = (val) => { setStatusFilter(val);      setCurrentPage(1); };
  const handleReset    = () => { setSearch(''); setCategoryFilter('all'); setStatusFilter('all'); setCurrentPage(1); };

  const start = filtered.length === 0 ? 0 : (currentPage - 1) * PER_PAGE + 1;
  const end   = Math.min(currentPage * PER_PAGE, filtered.length);

  return (
    <AdminLayout>
      <>
        <LoadingOverlay visible={loading} />

        {/* ── Header ────────────────────────────────────────────────── */}
        <header className="sticky top-0 z-10 bg-white/80 dark:bg-[#152210]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">Quản lý sản phẩm</h2>
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-1.5 border border-slate-200 dark:border-slate-700">
              <span className="material-symbols-outlined text-slate-400 text-xl">search</span>
              <input
                className="bg-transparent border-none outline-none focus:ring-0 text-sm w-64 placeholder:text-slate-400"
                placeholder="Tìm tên sản phẩm, ID..."
                value={search}
                onChange={handleSearch}
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Select
              value={categoryFilter}
              options={categoryOptions}
              onChange={handleCategory}
            />
            <button
              onClick={() => navigate('/admin/add-product')}
              className={BTN_ADD}
            >
              <span className="material-symbols-outlined text-lg">add</span>
              Thêm sản phẩm
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
            {stats.map(stat => {
              const c = STAT_COLORS[stat.color];
              return (
                <div key={stat.label} className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
                  <div className={`${c.bg} ${c.text} p-3 rounded-xl`}>
                    <span className="material-symbols-outlined text-3xl">{stat.icon}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
                    <h3 className="text-2xl font-extrabold dark:text-white">{stat.value}</h3>
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
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Danh sách sản phẩm</h4>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Bộ lọc:</span>
                  <Select
                    value={statusFilter}
                    options={STATUS_OPTIONS}
                    onChange={handleStatus}
                  />
                </div>
              </div>
              <button
                onClick={handleReset}
                className="p-1.5 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition-colors"
                title="Làm mới"
              >
                <span className="material-symbols-outlined text-sm">refresh</span>
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Sản phẩm</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Danh mục</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Giá</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Tồn kho</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Trạng thái</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Cập nhật</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {paginated.length === 0 && !loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-400">
                        Không tìm thấy sản phẩm nào
                      </td>
                    </tr>
                  ) : paginated.map(product => {
                    const st = STATUS_CONFIG[getStatus(product)];
                    return (
                      <tr key={product.id} onClick={() => navigate(`/admin/edit-product/${product.id}`)} className="hover:bg-primary/5 transition-colors group cursor-pointer">

                        {/* Sản phẩm */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="size-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center border border-slate-200 dark:border-slate-600 shrink-0 overflow-hidden">
                              {product.image_url
                                ? <img src={product.image_url} alt={product.name} className="size-full object-cover" />
                                : <span className="material-symbols-outlined text-slate-500 dark:text-slate-400">inventory_2</span>
                              }
                            </div>
                            <div>
                              <span className="text-sm font-bold text-[#1B5E20] dark:text-primary block">{product.name}</span>
                              <p className="text-xs text-slate-500">Mã: #{product.id}</p>
                            </div>
                          </div>
                        </td>

                        {/* Danh mục */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                          {product.category?.name ?? '—'}
                        </td>

                        {/* Giá */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-right dark:text-slate-200">
                          {formatPrice(product.price)}
                        </td>

                        {/* Tồn kho */}
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${stockBadge(product.stock)}`}>
                            {product.stock}
                          </span>
                        </td>

                        {/* Trạng thái */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${st.cls}`}>
                            {st.label}
                          </span>
                        </td>

                        {/* Cập nhật */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                          {formatDate(product.updated_at)}
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
                {' '}sản phẩm
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
                    <span key={`e-${i}`} className="text-slate-400 px-1">...</span>
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

export default ProductsPage;
