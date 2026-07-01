import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import CustomerLayout from '../../components/customer/CustomerLayout';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import Select from '../../components/common/Select';
import { getAllEntries } from '../../services/encyclopediaService';
import { SEVERITY_BADGE } from '../../data/encyclopediaData';

const ITEMS_PER_PAGE = 6;

const CATEGORY_OPTIONS = [
  { value: '',            label: 'Tất cả danh mục' },
  { value: 'Côn trùng',   label: 'Côn trùng'       },
  { value: 'Bệnh nấm',    label: 'Bệnh nấm'        },
  { value: 'Vi khuẩn',    label: 'Vi khuẩn'        },
  { value: 'Virus',       label: 'Virus'            },
  { value: 'Tuyến trùng', label: 'Tuyến trùng'     },
  { value: 'Nhện hại',    label: 'Nhện hại'         },
];

const SEVERITY_OPTIONS = [
  { value: '',           label: 'Tất cả mức độ' },
  { value: 'NGUY_HIEM',  label: 'Nguy hiểm'     },
  { value: 'NANG',       label: 'Nặng'           },
  { value: 'TRUNG_BINH', label: 'Trung bình'     },
];

// Mỗi chip map sang (severity, category) gửi lên API
const QUICK_FILTERS = [
  { id: 'all',      label: 'Tất cả',      severity: '',           category: ''           },
  { id: 'danger',   label: 'Nguy hiểm',   severity: 'NGUY_HIEM',  category: ''           },
  { id: 'insects',  label: 'Côn trùng',   severity: '',           category: 'Côn trùng'  },
  { id: 'fungal',   label: 'Bệnh nấm',    severity: '',           category: 'Bệnh nấm'   },
  { id: 'nematode', label: 'Tuyến trùng', severity: '',           category: 'Tuyến trùng'},
];

const EncyclopediaPage = () => {
  const [entries,     setEntries]     = useState([]);
  const [total,       setTotal]       = useState(0);
  const [loading,     setLoading]     = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [search,      setSearch]      = useState('');
  const [severity,    setSeverity]    = useState('');
  const [category,    setCategory]    = useState('');
  const [page,        setPage]        = useState(1);
  const gridRef = useRef(null);

  const fetchEntries = useCallback(() => {
    setLoading(true);
    const params = { page, limit: ITEMS_PER_PAGE };
    if (search)   params.search   = search;
    if (severity) params.severity = severity;
    if (category) params.category = category;
    getAllEntries(params)
      .then(res => {
        setEntries(res.data.data.data ?? []);
        setTotal(res.data.data.total ?? 0);
      })
      .catch(() => { setEntries([]); setTotal(0); })
      .finally(() => setLoading(false));
  }, [page, search, severity, category]);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));
  const start = total === 0 ? 0 : (page - 1) * ITEMS_PER_PAGE + 1;
  const end   = Math.min(page * ITEMS_PER_PAGE, total);

  const goToPage = (p) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
    if (gridRef.current) {
      const y = gridRef.current.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const handleSearch = () => { setSearch(searchInput.trim()); setPage(1); };

  const handleChip = (chip) => {
    setSeverity(chip.severity);
    setCategory(chip.category);
    setPage(1);
  };

  const handleCategory = (val) => { setCategory(val); setPage(1); };
  const handleSeverity = (val) => { setSeverity(val); setPage(1); };

  const resetFilters = () => {
    setSearchInput(''); setSearch('');
    setSeverity(''); setCategory('');
    setPage(1);
  };

  // Chip nào đang active — match theo severity+category
  const activeChipId = QUICK_FILTERS.find(
    c => c.severity === severity && c.category === category
  )?.id;

  const hasFilter = search || severity || category;

  return (
    <CustomerLayout>
      <>
        <LoadingOverlay visible={loading} />

        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section
          className="relative flex min-h-[400px] flex-col gap-6 bg-cover bg-center bg-no-repeat items-center justify-center p-4"
          style={{
            backgroundImage:
              'linear-gradient(rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.7) 100%), url("https://picsum.photos/seed/agro-hero/1440/600")',
          }}
        >
          <div className="flex flex-col gap-2 text-center max-w-2xl z-10">
            <h1 className="text-white text-4xl md:text-5xl font-black leading-tight tracking-[-0.033em]">
              Bách Khoa Sâu Bệnh &amp; Dịch Hại
            </h1>
            <p className="text-gray-200 text-lg md:text-xl font-medium leading-normal">
              Nhận biết mối nguy hại với cây trồng và tìm biện pháp xử lý phù hợp ngay lập tức.
            </p>
          </div>

          {/* Search box */}
          <div className="w-full max-w-xl z-10 mt-4">
            <div className="flex w-full items-stretch rounded-lg shadow-lg">
              <div className="flex bg-white dark:bg-[#1c3019] items-center justify-center pl-4 rounded-l-lg">
                <span className="material-symbols-outlined text-[#599a4c] text-[20px]">search</span>
              </div>
              <input
                className="flex w-full min-w-0 flex-1 bg-white dark:bg-[#1c3019] text-[#101b0d] dark:text-white focus:outline-none h-12 placeholder:text-[#599a4c] dark:placeholder:text-gray-500 px-3 text-base font-normal"
                placeholder="Tìm tên sâu bệnh, triệu chứng..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <div className="flex items-center justify-center rounded-r-lg bg-white dark:bg-[#1c3019] pr-1">
                <button
                  onClick={handleSearch}
                  className="flex h-10 px-6 cursor-pointer items-center justify-center rounded-lg bg-primary hover:bg-[#3dd122] transition-colors text-[#101b0d] text-sm font-bold"
                >
                  Tìm kiếm
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── Body ─────────────────────────────────────────────────────── */}
        <div className="w-full px-4 md:px-10 lg:px-20 xl:px-40 py-8 flex flex-col gap-6">

          {/* Breadcrumb */}
          <div className="flex gap-2 items-center text-sm">
            <Link to="/trang-chu" className="text-[#599a4c] hover:text-primary transition-colors font-medium">Trang chủ</Link>
            <span className="text-[#599a4c]">/</span>
            <span className="text-[#101b0d] dark:text-white font-medium">Tra cứu</span>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">

            {/* ── Sidebar ───────────────────────────────────────────────── */}
            <aside className="w-full lg:w-64 shrink-0 flex flex-col gap-6">
              <div className="flex items-center justify-between pb-2 border-b border-[#d3e7cf] dark:border-[#2A3C25]">
                <h3 className="text-lg font-bold text-[#101b0d] dark:text-white">Bộ lọc</h3>
                {hasFilter && (
                  <button onClick={resetFilters} className="text-sm text-[#599a4c] hover:text-primary font-medium">
                    Đặt lại
                  </button>
                )}
              </div>

              {/* Danh mục */}
              <div className="flex flex-col gap-2">
                <p className="text-sm font-bold text-[#101b0d] dark:text-white">Danh mục</p>
                <Select
                  value={category}
                  options={CATEGORY_OPTIONS}
                  onChange={handleCategory}
                  className="w-full"
                />
              </div>

              {/* Mức độ */}
              <div className="flex flex-col gap-2">
                <p className="text-sm font-bold text-[#101b0d] dark:text-white">Mức độ nghiêm trọng</p>
                <Select
                  value={severity}
                  options={SEVERITY_OPTIONS}
                  onChange={handleSeverity}
                  className="w-full"
                />
              </div>
            </aside>

            {/* ── Main ─────────────────────────────────────────────────── */}
            <main ref={gridRef} className="flex-1 flex flex-col gap-6">

              {/* Quick chips */}
              <div className="flex gap-2 flex-wrap items-center">
                <span className="text-sm font-medium text-gray-500 mr-1">Phổ biến:</span>
                {QUICK_FILTERS.map(chip => (
                  <button
                    key={chip.id}
                    onClick={() => handleChip(chip)}
                    className={`flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg px-3 text-sm font-semibold transition-all
                      ${activeChipId === chip.id
                        ? 'bg-primary text-[#101b0d] scale-105'
                        : 'bg-[#e9f3e7] dark:bg-[#2A3C25] hover:bg-[#d8ead5] dark:hover:bg-[#384f32] text-[#101b0d] dark:text-white'
                      }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              {/* Result count */}
              <p className="text-sm text-gray-500">
                {loading
                  ? 'Đang tải...'
                  : total === 0
                    ? '0 kết quả'
                    : <>Hiển thị <span className="font-semibold text-[#101b0d] dark:text-white">{start}–{end}</span> trong <span className="font-semibold text-[#101b0d] dark:text-white">{total}</span> kết quả</>
                }
              </p>

              {/* Grid */}
              {!loading && entries.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
                  <span className="material-symbols-outlined text-[48px] text-gray-300">search_off</span>
                  <p className="text-gray-500 text-base">Không tìm thấy kết quả phù hợp.</p>
                  <button onClick={resetFilters} className="text-primary font-medium text-sm hover:underline">
                    Xóa bộ lọc
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {entries.map(entry => {
                    const badge = SEVERITY_BADGE[entry.severity] ?? { label: entry.severity, cls: 'bg-slate-100 text-slate-600' };
                    return (
                      <div
                        key={entry.id}
                        className="group flex flex-col rounded-xl overflow-hidden bg-white dark:bg-[#1c3019] border border-[#d3e7cf] dark:border-[#2A3C25] hover:shadow-lg transition-all duration-300"
                      >
                        {/* Thumbnail */}
                        <div className="relative w-full pt-[66%] overflow-hidden bg-gray-100 dark:bg-[#2a3e25]">
                          {entry.thumbnail ? (
                            <img
                              src={entry.thumbnail}
                              alt={entry.name}
                              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="material-symbols-outlined text-[48px] text-gray-300 dark:text-gray-600">image</span>
                            </div>
                          )}
                          <div className={`absolute top-3 left-3 ${badge.cls} text-xs font-bold px-2 py-1 rounded shadow-sm`}>
                            {badge.label}
                          </div>
                        </div>

                        {/* Card body */}
                        <div className="p-5 flex flex-col flex-1">
                          <p className="text-xs font-semibold text-[#599a4c] uppercase tracking-wider mb-1">
                            {entry.category}
                          </p>
                          <h3 className="text-lg font-bold leading-tight">
                            <Link
                              to={`/tra-cuu/${entry.slug}`}
                              className="text-[#101b0d] dark:text-white hover:text-[#2E7D32] dark:hover:text-primary transition-colors"
                            >
                              {entry.name}
                            </Link>
                          </h3>
                          <p className="text-xs text-gray-500 italic mt-0.5 mb-3">{entry.latin_name}</p>

                          {/* Crop type chips */}
                          {entry.crop_types?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {entry.crop_types.slice(0, 2).map(c => (
                                <span key={c} className="text-xs bg-[#e9f3e7] dark:bg-[#2a3c25] text-[#2E7D32] dark:text-primary px-2 py-0.5 rounded-full font-medium">
                                  {c}
                                </span>
                              ))}
                              {entry.crop_types.length > 2 && (
                                <span className="text-xs text-gray-400">+{entry.crop_types.length - 2}</span>
                              )}
                            </div>
                          )}

                          <div className="mt-auto pt-4 border-t border-[#d3e7cf] dark:border-[#2A3C25] flex items-center justify-between">
                            <span className="text-xs font-medium text-gray-400 flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">format_list_bulleted</span>
                              {entry.symptom_count ?? 0} triệu chứng
                            </span>
                            <Link
                              to={`/tra-cuu/${entry.slug}`}
                              className="text-base font-bold text-primary hover:text-[#3dd122] flex items-center gap-0.5 transition-colors"
                            >
                              Xem chi tiết
                              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && !loading && (
                <div className="flex justify-center mt-2">
                  <nav className="flex items-center gap-2">
                    <button
                      onClick={() => goToPage(page - 1)}
                      disabled={page === 1}
                      className="flex items-center justify-center size-9 rounded-lg border border-[#d3e7cf] bg-white dark:bg-[#1c3019] text-[#101b0d] dark:text-white hover:bg-gray-100 dark:hover:bg-[#2A3C25] disabled:opacity-40 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                    </button>
                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(p => (
                      <button
                        key={p}
                        onClick={() => goToPage(p)}
                        className={`flex items-center justify-center size-9 rounded-lg text-sm font-bold transition-colors
                          ${p === page
                            ? 'bg-primary text-[#101b0d]'
                            : 'border border-[#d3e7cf] bg-white dark:bg-[#1c3019] text-[#101b0d] dark:text-white hover:bg-gray-100 dark:hover:bg-[#2A3C25]'
                          }`}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      onClick={() => goToPage(page + 1)}
                      disabled={page === totalPages}
                      className="flex items-center justify-center size-9 rounded-lg border border-[#d3e7cf] bg-white dark:bg-[#1c3019] text-[#101b0d] dark:text-white hover:bg-gray-100 dark:hover:bg-[#2A3C25] disabled:opacity-40 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                    </button>
                  </nav>
                </div>
              )}
            </main>
          </div>

          {/* ── Community Banner ────────────────────────────────────────── */}
          <div className="mt-8 mb-4 rounded-2xl bg-[#e9f3e7] dark:bg-[#1A2C15] overflow-hidden flex flex-col md:flex-row items-center border border-[#d3e7cf] dark:border-[#2A3C25]">
            <div className="p-8 md:p-12 flex-1 flex flex-col gap-4 text-center md:text-left">
              <div className="inline-flex self-center md:self-start items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-[#132210] border border-[#d3e7cf] dark:border-[#2A3C25] w-fit">
                <span className="size-2 rounded-full bg-primary animate-pulse"></span>
                <span className="text-xs font-bold uppercase tracking-wide text-[#599a4c]">Hỗ trợ cộng đồng</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-[#101b0d] dark:text-white">
                Không nhận ra vấn đề?
              </h2>
              <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-lg">
                Đăng câu hỏi lên Diễn đàn cộng đồng của chúng tôi. Các chuyên gia nông nghiệp và nông dân
                sẽ giúp bạn xác định sâu bệnh hoặc dịch hại.
              </p>
              <div className="flex gap-4 justify-center md:justify-start pt-2">
                <Link
                  to="/dien-dan"
                  className="flex items-center justify-center h-12 px-6 rounded-lg bg-[#101b0d] dark:bg-white text-white dark:text-[#101b0d] font-bold shadow-lg hover:opacity-90 transition-opacity"
                >
                  Vào diễn đàn
                </Link>
              </div>
            </div>
            <div className="w-full md:w-1/3 h-64 md:h-auto min-h-[250px] relative bg-gray-200 overflow-hidden">
              <img
                src="https://picsum.photos/seed/farmer-field/600/400"
                alt="Nông dân kiểm tra cây trồng"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </>
    </CustomerLayout>
  );
};

export default EncyclopediaPage;
