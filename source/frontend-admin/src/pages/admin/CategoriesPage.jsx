import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import { getAllCategories, deleteCategory } from '../../services/categoryService';
import { toastService, errMsg } from '../../services/toastService';

// ── Constants ────────────────────────────────────────────────────────────────

const PER_PAGE = 10;

const BTN_ADD = 'bg-primary text-[#1B5E20] px-4 py-2 rounded-lg font-bold text-sm shadow-sm hover:opacity-90 transition-opacity flex items-center gap-2';

const STAT_COLORS = {
  blue:  { bg: 'bg-blue-100 dark:bg-blue-900/30',   text: 'text-blue-600'  },
  green: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600' },
  amber: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-600' },
  sky:   { bg: 'bg-sky-100 dark:bg-sky-900/30',     text: 'text-sky-600'   },
};

// ── Component ─────────────────────────────────────────────────────────────────

const CategoriesPage = () => {
  const navigate = useNavigate();
  const tableRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [page,       setPage]       = useState(1);
  const [confirmCat, setConfirmCat] = useState(null); // danh mục đang chờ xác nhận xóa
  const [deleting,   setDeleting]   = useState(false);

  // Fetch toàn bộ danh mục (tập nhỏ → lấy 1 lần, filter/phân trang client-side)
  useEffect(() => {
    setLoading(true);
    getAllCategories({ limit: 100 })
      .then(res => setCategories(res.data.data.data))
      .catch(err => toastService.error(errMsg(err)))
      .finally(() => setLoading(false));
  }, []);

  // Filter
  const filtered = categories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.slug.toLowerCase().includes(search.toLowerCase())
  );

  // Stats tính từ dữ liệu thật
  const stats = useMemo(() => {
    const withProducts  = categories.filter(c => (c.product_count ?? 0) > 0).length;
    const totalProducts = categories.reduce((sum, c) => sum + (c.product_count ?? 0), 0);
    return [
      { label: 'Tổng danh mục', value: categories.length,               icon: 'category',     color: 'blue'  },
      { label: 'Có sản phẩm',   value: withProducts,                     icon: 'check_circle', color: 'green' },
      { label: 'Chưa có SP',    value: categories.length - withProducts, icon: 'inbox',        color: 'amber' },
      { label: 'Tổng sản phẩm', value: totalProducts,                    icon: 'inventory_2',  color: 'sky'   },
    ];
  }, [categories]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const start      = (page - 1) * PER_PAGE + 1;
  const end        = Math.min(page * PER_PAGE, filtered.length);
  const paged      = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const goToPage = (p) => {
    setPage(p);
    if (tableRef.current) {
      const y = tableRef.current.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const handleDelete = async () => {
    if (!confirmCat) return;
    setDeleting(true);
    try {
      await deleteCategory(confirmCat.id);
      toastService.success('Xóa danh mục thành công');
      setCategories(prev => prev.filter(c => c.id !== confirmCat.id));
      setConfirmCat(null);
      // Nếu trang hiện tại rỗng sau khi xóa, lùi về trang trước
      const maxPage = Math.max(1, Math.ceil((filtered.length - 1) / PER_PAGE));
      if (page > maxPage) setPage(maxPage);
    } catch (err) {
      toastService.error(errMsg(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <LoadingOverlay visible={loading} />
      <AdminLayout>
        <div className="p-6 flex flex-col gap-6">

          {/* ── Header ─────────────────────────────────────────────────── */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Danh mục sản phẩm</h2>
              <p className="text-sm text-slate-500 mt-0.5">Quản lý cây phân loại sản phẩm trong hệ thống</p>
            </div>
            <button onClick={() => navigate('/admin/add-category')} className={BTN_ADD}>
              <span className="material-symbols-outlined text-lg">add</span>
              Thêm danh mục
            </button>
          </div>

          {/* ── Stats ──────────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map(s => {
              const c = STAT_COLORS[s.color];
              return (
                <div key={s.label} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 flex items-center gap-3">
                  <div className={`size-10 rounded-lg ${c.bg} flex items-center justify-center shrink-0`}>
                    <span className={`material-symbols-outlined ${c.text}`}>{s.icon}</span>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">{s.label}</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">{s.value}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Table card ─────────────────────────────────────────────── */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">

            {/* Toolbar */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3 flex-wrap rounded-t-xl">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none">search</span>
                <input
                  type="text"
                  placeholder="Tìm danh mục..."
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); }}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
              <p className="text-sm text-slate-500 ml-auto">
                <span className="font-bold text-slate-900 dark:text-white">{filtered.length}</span> danh mục
              </p>
            </div>

            {/* Table */}
            <div ref={tableRef} className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30">
                    <th className="px-6 py-3 text-left font-semibold text-slate-600 dark:text-slate-400 uppercase text-xs tracking-wider">Danh mục</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-600 dark:text-slate-400 uppercase text-xs tracking-wider">Slug</th>
                    <th className="px-6 py-3 text-center font-semibold text-slate-600 dark:text-slate-400 uppercase text-xs tracking-wider">Sản phẩm</th>
                    <th className="px-6 py-3 text-right font-semibold text-slate-600 dark:text-slate-400 uppercase text-xs tracking-wider">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {paged.length === 0 && !loading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-sm text-slate-400">
                        <span className="material-symbols-outlined text-4xl block mb-2 opacity-30">category</span>
                        Không tìm thấy danh mục nào
                      </td>
                    </tr>
                  ) : paged.map(cat => (
                    <tr
                      key={cat.id}
                      onClick={() => navigate(`/admin/edit-category/${cat.id}`)}
                      className="hover:bg-primary/5 transition-colors cursor-pointer"
                    >
                      {/* Tên */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-bold text-[#1B5E20] dark:text-primary">{cat.name}</span>
                      </td>

                      {/* Slug */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <code className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded font-mono">
                          {cat.slug}
                        </code>
                      </td>

                      {/* Số sản phẩm */}
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="inline-flex items-center justify-center size-7 rounded-full bg-primary/20 text-[#1B5E20] dark:text-primary text-xs font-bold">
                          {cat.product_count ?? 0}
                        </span>
                      </td>

                      {/* Thao tác */}
                      <td className="px-6 py-4 whitespace-nowrap text-right" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => setConfirmCat(cat)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                          title="Xóa danh mục"
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/30 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between flex-wrap gap-3 rounded-b-xl">
              <p className="text-sm text-slate-500 font-medium">
                Hiển thị{' '}
                <span className="text-slate-900 dark:text-white font-bold">{filtered.length === 0 ? 0 : start}–{end}</span>
                {' '}trong số{' '}
                <span className="text-slate-900 dark:text-white font-bold">{filtered.length}</span>
                {' '}danh mục
              </p>
              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => goToPage(page - 1)}
                    disabled={page === 1}
                    className="size-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-600 text-slate-500 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <span className="material-symbols-outlined text-base">chevron_left</span>
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => goToPage(p)}
                      className={`size-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                        p === page
                          ? 'bg-primary text-[#1B5E20] font-bold shadow-sm'
                          : 'border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => goToPage(page + 1)}
                    disabled={page === totalPages}
                    className="size-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-600 text-slate-500 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <span className="material-symbols-outlined text-base">chevron_right</span>
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </AdminLayout>

      {/* ── Confirm Delete Modal ──────────────────────────────────────── */}
      {confirmCat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !deleting && setConfirmCat(null)} />
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 w-full max-w-sm flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="size-11 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-red-600 dark:text-red-400">delete_forever</span>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Xóa danh mục?</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Hành động này không thể hoàn tác.</p>
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl px-4 py-3">
              <p className="font-semibold text-slate-800 dark:text-white text-sm">{confirmCat.name}</p>
              <p className="text-xs text-slate-400 font-mono mt-0.5">/{confirmCat.slug}</p>
            </div>
            {(confirmCat.product_count ?? 0) > 0 && (
              <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">warning</span>
                Danh mục đang có {confirmCat.product_count} sản phẩm — không thể xóa.
              </p>
            )}
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setConfirmCat(null)}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 text-sm font-semibold border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-40"
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting || (confirmCat.product_count ?? 0) > 0}
                className="flex-1 px-4 py-2.5 text-sm font-bold bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {deleting
                  ? <span className="size-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  : <span className="material-symbols-outlined text-base">delete</span>
                }
                {deleting ? 'Đang xóa...' : 'Xóa danh mục'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CategoriesPage;
