import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import LoadingOverlay from '../../components/common/LoadingOverlay';

// ── Constants ────────────────────────────────────────────────────────────────

const PER_PAGE = 10;

const BTN_ADD = 'bg-primary text-[#1B5E20] px-4 py-2 rounded-lg font-bold text-sm shadow-sm hover:opacity-90 transition-opacity flex items-center gap-2';

const MOCK_CATEGORIES = [
  { id: 1, name: 'Phân bón',               slug: 'phan-bon',              description: 'Các loại phân bón hóa học và vô cơ',           imageUrl: null, productCount: 6 },
  { id: 2, name: 'Thuốc bảo vệ thực vật', slug: 'thuoc-bao-ve-thuc-vat', description: 'Thuốc trừ sâu, thuốc trừ cỏ đặc trị',           imageUrl: null, productCount: 5 },
  { id: 3, name: 'Hạt giống cây trồng',   slug: 'hat-giong-cay-trong',   description: 'Hạt giống F1, hạt giống thuần chủng',            imageUrl: null, productCount: 5 },
  { id: 4, name: 'Thuốc trừ nấm',         slug: 'thuoc-tru-nam',         description: 'Nhóm thuốc chuyên trị nấm bệnh cây trồng',       imageUrl: null, productCount: 3 },
  { id: 5, name: 'Phân hữu cơ',           slug: 'phan-huu-co',           description: 'Phân compost, phân vi sinh, phân hữu cơ khoáng', imageUrl: null, productCount: 2 },
];

const ICON_MAP = {
  1: 'grass',
  2: 'bug_report',
  3: 'psychiatry',
  4: 'science',
  5: 'compost',
};

const STATS = [
  { label: 'Tổng danh mục',  value: '5',  icon: 'category',    color: 'blue'  },
  { label: 'Có sản phẩm',    value: '5',  icon: 'check_circle', color: 'green' },
  { label: 'Chưa có SP',     value: '0',  icon: 'inbox',        color: 'amber' },
  { label: 'Tổng sản phẩm',  value: '21', icon: 'inventory_2',  color: 'sky'   },
];

const STAT_COLORS = {
  blue:  { bg: 'bg-blue-100 dark:bg-blue-900/30',   text: 'text-blue-600'  },
  green: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600' },
  amber: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-600' },
  sky:   { bg: 'bg-sky-100 dark:bg-sky-900/30',     text: 'text-sky-600'   },
};

// ── Component ─────────────────────────────────────────────────────────────────

const CategoriesPage = () => {
  const navigate  = useNavigate();
  const tableRef  = useRef(null);
  const [search,  setSearch]  = useState('');
  const [loading] = useState(false);
  const [page,    setPage]    = useState(1);

  // Filter
  const filtered = MOCK_CATEGORIES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.slug.toLowerCase().includes(search.toLowerCase())
  );

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
            {STATS.map(s => {
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
                    <th className="px-6 py-3 text-left font-semibold text-slate-600 dark:text-slate-400 uppercase text-xs tracking-wider">Mô tả</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {paged.length === 0 ? (
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
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center border border-green-100 dark:border-green-800 shrink-0">
                            {cat.imageUrl ? (
                              <img src={cat.imageUrl} alt={cat.name} className="size-full object-cover rounded-lg" />
                            ) : (
                              <span className="material-symbols-outlined text-[#2E7D32] dark:text-primary text-lg">
                                {ICON_MAP[cat.id] ?? 'category'}
                              </span>
                            )}
                          </div>
                          <span className="font-bold text-[#1B5E20] dark:text-primary">{cat.name}</span>
                        </div>
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
                          {cat.productCount}
                        </span>
                      </td>

                      {/* Mô tả */}
                      <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 max-w-xs truncate">
                        {cat.description || <span className="text-slate-300 dark:text-slate-600">—</span>}
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
    </>
  );
};

export default CategoriesPage;
