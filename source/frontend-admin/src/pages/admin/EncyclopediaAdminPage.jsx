import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import Select from '../../components/common/Select';
import { getAllEntries, deleteEntry } from '../../services/encyclopediaService';
import { toastService, errMsg } from '../../services/toastService';
import { SEVERITY_BADGE } from '../../data/encyclopediaData';

// ── Constants ────────────────────────────────────────────────────────────────

const PER_PAGE = 10;

const BTN_ADD = 'bg-primary text-[#1B5E20] px-4 py-2 rounded-lg font-bold text-sm shadow-sm hover:opacity-90 transition-opacity flex items-center gap-2';

const SEVERITY_OPTIONS = [
  { value: '',           label: 'Tất cả mức độ'  },
  { value: 'NGUY_HIEM',  label: 'Nguy hiểm'       },
  { value: 'NANG',       label: 'Nặng'             },
  { value: 'TRUNG_BINH', label: 'Trung bình'       },
];

const CATEGORY_OPTIONS = [
  { value: '',            label: 'Tất cả loại'  },
  { value: 'Côn trùng',   label: 'Côn trùng'    },
  { value: 'Bệnh nấm',    label: 'Bệnh nấm'     },
  { value: 'Vi khuẩn',    label: 'Vi khuẩn'     },
  { value: 'Virus',       label: 'Virus'         },
  { value: 'Tuyến trùng', label: 'Tuyến trùng'  },
  { value: 'Nhện hại',    label: 'Nhện hại'      },
];

const STAT_COLORS = {
  blue:  { bg: 'bg-blue-100 dark:bg-blue-900/30',   text: 'text-blue-600'  },
  red:   { bg: 'bg-red-100 dark:bg-red-900/30',     text: 'text-red-600'   },
  amber: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-600' },
  green: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600' },
};

// ── Component ─────────────────────────────────────────────────────────────────

const EncyclopediaAdminPage = () => {
  const navigate = useNavigate();
  const tableRef = useRef(null);

  const [entries,      setEntries]      = useState([]);
  const [total,        setTotal]        = useState(0);
  const [stats,        setStats]        = useState({ total: 0, nguyHiem: 0, nang: 0, trungBinh: 0 });
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState('');
  const [severity,     setSeverity]     = useState('');
  const [category,     setCategory]     = useState('');
  const [page,         setPage]         = useState(1);
  const [confirmEntry, setConfirmEntry] = useState(null); // entry đang chờ xác nhận xóa
  const [deleting,     setDeleting]     = useState(false);

  // Fetch stats on mount (4 lightweight calls với limit=1)
  useEffect(() => {
    Promise.all([
      getAllEntries({ limit: 1 }),
      getAllEntries({ limit: 1, severity: 'NGUY_HIEM'  }),
      getAllEntries({ limit: 1, severity: 'NANG'        }),
      getAllEntries({ limit: 1, severity: 'TRUNG_BINH'  }),
    ]).then(([all, nh, n, tb]) => {
      setStats({
        total:     all.data.data.total,
        nguyHiem:  nh.data.data.total,
        nang:      n.data.data.total,
        trungBinh: tb.data.data.total,
      });
    }).catch(() => {});
  }, []);

  // Fetch table — triggered by filter/page changes
  const fetchEntries = useCallback(() => {
    setLoading(true);
    const params = { page, limit: PER_PAGE };
    if (search)   params.search   = search;
    if (severity) params.severity = severity;
    if (category) params.category = category;

    getAllEntries(params)
      .then(res => {
        setEntries(res.data.data.data);
        setTotal(res.data.data.total);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, search, severity, category]);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  const totalPages = Math.ceil(total / PER_PAGE);
  const start      = total === 0 ? 0 : (page - 1) * PER_PAGE + 1;
  const end        = Math.min(page * PER_PAGE, total);

  const goToPage = (p) => {
    setPage(p);
    if (tableRef.current) {
      const y = tableRef.current.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const handleSearch = (val) => { setSearch(val); setPage(1); };
  const handleSeverity = (val) => { setSeverity(val); setPage(1); };
  const handleCategory = (val) => { setCategory(val); setPage(1); };
  const resetFilters = () => { setSearch(''); setSeverity(''); setCategory(''); setPage(1); };

  const handleDelete = async () => {
    if (!confirmEntry) return;
    setDeleting(true);
    try {
      await deleteEntry(confirmEntry.id);
      toastService.success('Xóa bài viết thành công');
      setConfirmEntry(null);
      // Nếu trang hiện tại không còn bài nào, lùi về trang trước
      const newTotal = total - 1;
      const maxPage  = Math.max(1, Math.ceil(newTotal / PER_PAGE));
      if (page > maxPage) setPage(maxPage);
      else fetchEntries();
    } catch (err) {
      toastService.error(errMsg(err));
    } finally {
      setDeleting(false);
    }
  };

  const hasFilter = search || severity || category;

  const STATS_CONFIG = [
    { label: 'Tổng bài',   value: stats.total,     icon: 'menu_book',  color: 'blue'  },
    { label: 'Nguy hiểm',  value: stats.nguyHiem,  icon: 'dangerous',  color: 'red'   },
    { label: 'Mức nặng',   value: stats.nang,       icon: 'warning',    color: 'amber' },
    { label: 'Trung bình', value: stats.trungBinh,  icon: 'info',       color: 'green' },
  ];

  return (
    <>
      <LoadingOverlay visible={loading} />
      <AdminLayout>
        <div className="p-6 flex flex-col gap-6">

          {/* ── Header ─────────────────────────────────────────────────── */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Bách khoa sâu bệnh</h2>
              <p className="text-sm text-slate-500 mt-0.5">Quản lý nội dung tra cứu sâu bệnh & hướng dẫn xử lý</p>
            </div>
            <button onClick={() => navigate('/admin/encyclopedia/add')} className={BTN_ADD}>
              <span className="material-symbols-outlined text-lg">add</span>
              Thêm bài mới
            </button>
          </div>

          {/* ── Stats ──────────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {STATS_CONFIG.map(s => {
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
                  placeholder="Tìm tên, tên khoa học..."
                  value={search}
                  onChange={e => handleSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
              <Select value={severity} options={SEVERITY_OPTIONS} onChange={handleSeverity} />
              <Select value={category} options={CATEGORY_OPTIONS} onChange={handleCategory} />
              {hasFilter && (
                <button onClick={resetFilters} className="text-sm text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center gap-1">
                  <span className="material-symbols-outlined text-base">close</span>
                  Xóa lọc
                </button>
              )}
              <p className="text-sm text-slate-500 ml-auto">
                <span className="font-bold text-slate-900 dark:text-white">{total}</span> bài viết
              </p>
            </div>

            {/* Table */}
            <div ref={tableRef} className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30">
                    <th className="px-6 py-3 text-left font-semibold text-slate-600 dark:text-slate-400 uppercase text-xs tracking-wider">Tên bài</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-600 dark:text-slate-400 uppercase text-xs tracking-wider">Loại</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-600 dark:text-slate-400 uppercase text-xs tracking-wider">Mức độ</th>
                    <th className="px-6 py-3 text-center font-semibold text-slate-600 dark:text-slate-400 uppercase text-xs tracking-wider">Triệu chứng</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-600 dark:text-slate-400 uppercase text-xs tracking-wider">Loại cây</th>
                    <th className="px-6 py-3 text-right font-semibold text-slate-600 dark:text-slate-400 uppercase text-xs tracking-wider">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {entries.length === 0 && !loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-400">
                        <span className="material-symbols-outlined text-4xl block mb-2 opacity-30">search_off</span>
                        Không tìm thấy bài nào phù hợp
                      </td>
                    </tr>
                  ) : entries.map(entry => {
                    const sv = SEVERITY_BADGE[entry.severity] ?? { label: entry.severity, cls: 'bg-slate-100 text-slate-600' };
                    return (
                      <tr
                        key={entry.id}
                        onClick={() => navigate(`/admin/encyclopedia/edit/${entry.id}`)}
                        className="hover:bg-primary/5 transition-colors cursor-pointer"
                      >
                        {/* Tên */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="size-10 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-700 shrink-0">
                              {entry.thumbnail
                                ? <img src={entry.thumbnail} alt={entry.name} className="size-full object-cover" />
                                : <span className="material-symbols-outlined text-slate-400 text-xl flex items-center justify-center size-full">image</span>
                              }
                            </div>
                            <div>
                              <p className="font-bold text-[#1B5E20] dark:text-primary">{entry.name}</p>
                              <p className="text-xs text-slate-400 italic">{entry.latin_name}</p>
                            </div>
                          </div>
                        </td>

                        {/* Loại */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                          {entry.category}
                        </td>

                        {/* Mức độ */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${sv.cls}`}>
                            {sv.label}
                          </span>
                        </td>

                        {/* Số triệu chứng */}
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="inline-flex items-center justify-center size-7 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold">
                            {entry.symptom_count ?? 0}
                          </span>
                        </td>

                        {/* Loại cây */}
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {(entry.crop_types ?? []).slice(0, 2).map(c => (
                              <span key={c} className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full">
                                {c}
                              </span>
                            ))}
                            {(entry.crop_types ?? []).length > 2 && (
                              <span className="text-xs text-slate-400">+{entry.crop_types.length - 2}</span>
                            )}
                          </div>
                        </td>

                        {/* Thao tác */}
                        <td className="px-6 py-4 whitespace-nowrap text-right" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => navigate(`/admin/encyclopedia/edit/${entry.id}`)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors"
                              title="Chỉnh sửa"
                            >
                              <span className="material-symbols-outlined text-base">edit</span>
                            </button>
                            <button
                              onClick={() => setConfirmEntry(entry)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                              title="Xóa"
                            >
                              <span className="material-symbols-outlined text-base">delete</span>
                            </button>
                          </div>
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
                <span className="text-slate-900 dark:text-white font-bold">{start}–{end}</span>
                {' '}trong số{' '}
                <span className="text-slate-900 dark:text-white font-bold">{total}</span>
                {' '}bài
              </p>
              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <button onClick={() => goToPage(page - 1)} disabled={page === 1}
                    className="size-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-600 text-slate-500 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                    <span className="material-symbols-outlined text-base">chevron_left</span>
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button key={p} onClick={() => goToPage(p)}
                      className={`size-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                        p === page
                          ? 'bg-primary text-[#1B5E20] font-bold shadow-sm'
                          : 'border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}>{p}</button>
                  ))}
                  <button onClick={() => goToPage(page + 1)} disabled={page === totalPages}
                    className="size-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-600 text-slate-500 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                    <span className="material-symbols-outlined text-base">chevron_right</span>
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </AdminLayout>

      {/* ── Confirm Delete Modal ──────────────────────────────────────── */}
      {confirmEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !deleting && setConfirmEntry(null)} />
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 w-full max-w-sm flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="size-11 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-red-600 dark:text-red-400">delete_forever</span>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Xóa bài viết?</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Hành động này không thể hoàn tác.</p>
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl px-4 py-3">
              <p className="font-semibold text-slate-800 dark:text-white text-sm">{confirmEntry.name}</p>
              {confirmEntry.latin_name && (
                <p className="text-xs text-slate-400 italic mt-0.5">{confirmEntry.latin_name}</p>
              )}
            </div>
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setConfirmEntry(null)}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 text-sm font-semibold border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-40"
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 text-sm font-bold bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {deleting
                  ? <span className="size-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  : <span className="material-symbols-outlined text-base">delete</span>
                }
                {deleting ? 'Đang xóa...' : 'Xóa bài viết'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EncyclopediaAdminPage;
