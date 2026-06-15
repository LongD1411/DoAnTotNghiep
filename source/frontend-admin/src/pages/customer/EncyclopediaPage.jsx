import { useState, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import CustomerLayout from '../../components/customer/CustomerLayout';
import { FAKE_ENTRIES, SEVERITY_BADGE } from '../../data/encyclopediaData';

const ITEMS_PER_PAGE = 6;

const CROP_OPTIONS = [
  { value: 'Vegetables', label: 'Rau củ' },
  { value: 'Fruits',     label: 'Trái cây' },
  { value: 'Cereals',    label: 'Ngũ cốc' },
  { value: 'Legumes',    label: 'Đậu đỗ' },
];
const CATEGORY_OPTIONS = [
  { value: 'Insect',  label: 'Côn trùng' },
  { value: 'Fungal',  label: 'Bệnh nấm' },
  { value: 'Viral',   label: 'Virus' },
];
const SEVERITY_OPTIONS = [
  { value: 'NGUY_HIEM',  label: 'Nguy hiểm' },
  { value: 'NANG',       label: 'Nặng' },
  { value: 'TRUNG_BINH', label: 'Trung bình' },
];

const QUICK_FILTERS = [
  { id: 'all',    label: 'Tất cả' },
  { id: 'high',   label: 'Mức độ cao' },
  { id: 'tomato', label: 'Cà chua' },
  { id: 'corn',   label: 'Ngô' },
  { id: 'fungal', label: 'Bệnh nấm' },
];

const EncyclopediaPage = () => {
  const [heroSearch, setHeroSearch]         = useState('');
  const [activeChip, setActiveChip]         = useState('all');
  const [cropFilters, setCropFilters]       = useState({});
  const [categoryFilters, setCategoryFilters] = useState({});
  const [severityFilters, setSeverityFilters] = useState({});
  const [currentPage, setCurrentPage]       = useState(1);
  const gridRef = useRef(null);

  const toggleCheck = (setter, key) =>
    setter(prev => ({ ...prev, [key]: !prev[key] }));

  const resetFilters = () => {
    setCropFilters({});
    setCategoryFilters({});
    setSeverityFilters({});
    setActiveChip('all');
    setHeroSearch('');
    setCurrentPage(1);
  };

  const filtered = useMemo(() => {
    let list = FAKE_ENTRIES;

    if (heroSearch.trim()) {
      const q = heroSearch.toLowerCase();
      list = list.filter(
        e =>
          e.name.toLowerCase().includes(q) ||
          e.latinName.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q),
      );
    }

    if (activeChip === 'high')
      list = list.filter(e => e.severity === 'NGUY_HIEM' || e.severity === 'NANG');
    else if (activeChip === 'tomato')
      list = list.filter(e => e.cropTypes.includes('Vegetables'));
    else if (activeChip === 'corn')
      list = list.filter(e => e.cropTypes.includes('Cereals'));
    else if (activeChip === 'fungal')
      list = list.filter(e => e.category === 'Bệnh nấm');

    const activeCrops = Object.keys(cropFilters).filter(k => cropFilters[k]);
    if (activeCrops.length)
      list = list.filter(e => activeCrops.some(c => e.cropTypes.includes(c)));

    const activeCats = Object.keys(categoryFilters).filter(k => categoryFilters[k]);
    if (activeCats.length)
      list = list.filter(e => activeCats.some(c => e.categories.includes(c)));

    const activeSevs = Object.keys(severityFilters).filter(k => severityFilters[k]);
    if (activeSevs.length)
      list = list.filter(e => activeSevs.includes(e.severity));

    return list;
  }, [heroSearch, activeChip, cropFilters, categoryFilters, severityFilters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated  = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const goToPage = (p) => {
    if (p >= 1 && p <= totalPages) {
      setCurrentPage(p);
      if (gridRef.current) {
        const y = gridRef.current.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }
  };

  const handleChip = (id) => {
    setActiveChip(id);
    setCurrentPage(1);
  };

  const handleHeroSearch = () => setCurrentPage(1);

  return (
    <CustomerLayout>
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
            Bách Khoa Sâu Bệnh & Dịch Hại
          </h1>
          <p className="text-gray-200 text-lg md:text-xl font-medium leading-normal">
            Nhận biết mối nguy hại với cây trồng và tìm biện pháp xử lý phù hợp ngay lập tức.
          </p>
        </div>

        {/* Search */}
        <div className="w-full max-w-xl z-10 mt-4">
          <div className="flex w-full items-stretch rounded-lg shadow-lg">
            <div className="flex bg-white dark:bg-[#1c3019] items-center justify-center pl-4 rounded-l-lg">
              <span className="material-symbols-outlined text-[#599a4c] text-[20px]">search</span>
            </div>
            <input
              className="flex w-full min-w-0 flex-1 bg-white dark:bg-[#1c3019] text-[#101b0d] dark:text-white focus:outline-none h-12 placeholder:text-[#599a4c] dark:placeholder:text-gray-500 px-3 text-base font-normal"
              placeholder="Tìm triệu chứng, sâu bệnh, hoặc loại cây trồng..."
              value={heroSearch}
              onChange={(e) => { setHeroSearch(e.target.value); setCurrentPage(1); }}
              onKeyDown={(e) => e.key === 'Enter' && handleHeroSearch()}
            />
            <div className="flex items-center justify-center rounded-r-lg bg-white dark:bg-[#1c3019] pr-1">
              <button
                onClick={handleHeroSearch}
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
          <a href="/trang-chu" className="text-[#599a4c] hover:text-primary transition-colors font-medium">Trang chủ</a>
          <span className="text-[#599a4c]">/</span>
          <span className="text-[#101b0d] dark:text-white font-medium">Tra cứu</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── Sidebar Filters ───────────────────────────────────────── */}
          <aside className="w-full lg:w-64 shrink-0 flex flex-col gap-6">
            <div className="flex items-center justify-between pb-2 border-b border-[#d3e7cf] dark:border-[#2A3C25]">
              <h3 className="text-lg font-bold text-[#101b0d] dark:text-white">Bộ lọc</h3>
              <button
                onClick={resetFilters}
                className="text-sm text-[#599a4c] hover:text-primary font-medium"
              >
                Đặt lại
              </button>
            </div>

            {/* Loại cây trồng */}
            <details className="flex flex-col rounded-lg border border-[#d3e7cf] dark:border-[#2A3C25] bg-white dark:bg-[#1c3019] px-4 py-2 group" open>
              <summary className="flex cursor-pointer items-center justify-between gap-2 py-2 select-none">
                <span className="text-[#101b0d] dark:text-white text-sm font-bold">Loại cây trồng</span>
                <span className="material-symbols-outlined text-[#101b0d] dark:text-white group-open:rotate-180 transition-transform text-[20px]">expand_more</span>
              </summary>
              <div className="pt-2 pb-2 flex flex-col gap-2">
                {CROP_OPTIONS.map(opt => (
                  <label key={opt.value} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!cropFilters[opt.value]}
                      onChange={() => { toggleCheck(setCropFilters, opt.value); setCurrentPage(1); }}
                      className="size-4 rounded border-gray-300 text-primary focus:ring-primary bg-white dark:bg-[#132210] dark:border-gray-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{opt.label}</span>
                  </label>
                ))}
              </div>
            </details>

            {/* Danh mục */}
            <details className="flex flex-col rounded-lg border border-[#d3e7cf] dark:border-[#2A3C25] bg-white dark:bg-[#1c3019] px-4 py-2 group" open>
              <summary className="flex cursor-pointer items-center justify-between gap-2 py-2 select-none">
                <span className="text-[#101b0d] dark:text-white text-sm font-bold">Danh mục</span>
                <span className="material-symbols-outlined text-[#101b0d] dark:text-white group-open:rotate-180 transition-transform text-[20px]">expand_more</span>
              </summary>
              <div className="pt-2 pb-2 flex flex-col gap-2">
                {CATEGORY_OPTIONS.map(opt => (
                  <label key={opt.value} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!categoryFilters[opt.value]}
                      onChange={() => { toggleCheck(setCategoryFilters, opt.value); setCurrentPage(1); }}
                      className="size-4 rounded border-gray-300 text-primary focus:ring-primary bg-white dark:bg-[#132210] dark:border-gray-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{opt.label}</span>
                  </label>
                ))}
              </div>
            </details>

            {/* Mức độ */}
            <details className="flex flex-col rounded-lg border border-[#d3e7cf] dark:border-[#2A3C25] bg-white dark:bg-[#1c3019] px-4 py-2 group" open>
              <summary className="flex cursor-pointer items-center justify-between gap-2 py-2 select-none">
                <span className="text-[#101b0d] dark:text-white text-sm font-bold">Mức độ nghiêm trọng</span>
                <span className="material-symbols-outlined text-[#101b0d] dark:text-white group-open:rotate-180 transition-transform text-[20px]">expand_more</span>
              </summary>
              <div className="pt-2 pb-2 flex flex-col gap-2">
                {SEVERITY_OPTIONS.map(opt => (
                  <label key={opt.value} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!severityFilters[opt.value]}
                      onChange={() => { toggleCheck(setSeverityFilters, opt.value); setCurrentPage(1); }}
                      className="size-4 rounded border-gray-300 text-primary focus:ring-primary bg-white dark:bg-[#132210] dark:border-gray-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{opt.label}</span>
                  </label>
                ))}
              </div>
            </details>
          </aside>

          {/* ── Main content ─────────────────────────────────────────── */}
          <main ref={gridRef} className="flex-1 flex flex-col gap-6">

            {/* Quick filter chips */}
            <div className="flex gap-2 flex-wrap items-center">
              <span className="text-sm font-medium text-gray-500 mr-1">Phổ biến:</span>
              {QUICK_FILTERS.map(chip => (
                <button
                  key={chip.id}
                  onClick={() => handleChip(chip.id)}
                  className={`flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg px-3 text-sm font-semibold transition-all
                    ${activeChip === chip.id
                      ? 'bg-primary text-[#101b0d] hover:scale-105'
                      : 'bg-[#e9f3e7] dark:bg-[#2A3C25] hover:bg-[#d8ead5] dark:hover:bg-[#384f32] text-[#101b0d] dark:text-white'
                    }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Result count */}
            <p className="text-sm text-gray-500">
              Hiển thị <span className="font-semibold text-[#101b0d] dark:text-white">{filtered.length}</span> kết quả
            </p>

            {/* Grid */}
            {paginated.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {paginated.map(entry => {
                  const badge = SEVERITY_BADGE[entry.severity];
                  return (
                    <div
                      key={entry.id}
                      className="group flex flex-col rounded-xl overflow-hidden bg-white dark:bg-[#1c3019] border border-[#d3e7cf] dark:border-[#2A3C25] hover:shadow-lg transition-all duration-300"
                    >
                      {/* Image */}
                      <div className="relative w-full pt-[66%] overflow-hidden bg-gray-200">
                        <img
                          src={entry.image}
                          alt={entry.name}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className={`absolute top-3 left-3 ${badge.cls} text-xs font-bold px-2 py-1 rounded shadow-sm`}>
                          {badge.label}
                        </div>
                      </div>

                      {/* Body */}
                      <div className="p-5 flex flex-col flex-1">
                        <div className="mb-2">
                          <p className="text-xs font-semibold text-[#599a4c] uppercase tracking-wider mb-1">
                            {entry.category}
                          </p>
                          <h3 className="text-lg font-bold leading-tight">
                            <Link to={`/tra-cuu/${entry.slug}`} className="text-[#101b0d] dark:text-white hover:text-[#2E7D32] dark:hover:text-primary transition-colors">
                              {entry.name}
                            </Link>
                          </h3>
                          <p className="text-xs text-gray-500 italic mt-0.5">{entry.latinName}</p>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mt-2 mb-4">
                          {entry.description}
                        </p>
                        <div className="mt-auto pt-4 border-t border-[#d3e7cf] dark:border-[#2A3C25] flex justify-between items-center">
                          <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">science</span>
                            {entry.productCount} Sản phẩm
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
                <span className="material-symbols-outlined text-[48px] text-gray-300">search_off</span>
                <p className="text-gray-500 text-base">Không tìm thấy kết quả phù hợp.</p>
                <button onClick={resetFilters} className="text-primary font-medium text-sm hover:underline">
                  Xóa bộ lọc
                </button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-2">
                <nav className="flex items-center gap-2">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center justify-center size-9 rounded-lg border border-[#d3e7cf] bg-white dark:bg-[#1c3019] text-[#101b0d] dark:text-white hover:bg-gray-100 dark:hover:bg-[#2A3C25] disabled:opacity-40 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => goToPage(p)}
                      className={`flex items-center justify-center size-9 rounded-lg text-sm font-bold transition-colors
                        ${p === currentPage
                          ? 'bg-primary text-[#101b0d]'
                          : 'border border-[#d3e7cf] bg-white dark:bg-[#1c3019] text-[#101b0d] dark:text-white hover:bg-gray-100 dark:hover:bg-[#2A3C25]'
                        }`}
                    >
                      {p}
                    </button>
                  ))}

                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center justify-center size-9 rounded-lg border border-[#d3e7cf] bg-white dark:bg-[#1c3019] text-[#101b0d] dark:text-white hover:bg-gray-100 dark:hover:bg-[#2A3C25] disabled:opacity-40 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                  </button>
                </nav>
              </div>
            )}
          </main>
        </div>

        {/* ── Community Banner ─────────────────────────────────────── */}
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
              Tải ảnh lên Diễn đàn cộng đồng của chúng tôi. Các chuyên gia nông nghiệp và nông dân
              sẽ giúp bạn xác định sâu bệnh hoặc dịch hại.
            </p>
            <div className="flex gap-4 justify-center md:justify-start pt-2">
              <a
                href="/forum"
                className="flex items-center justify-center h-12 px-6 rounded-lg bg-[#101b0d] dark:bg-white text-white dark:text-[#101b0d] font-bold shadow-lg hover:opacity-90 transition-opacity"
              >
                Vào diễn đàn
              </a>
              <button className="flex items-center justify-center h-12 px-6 rounded-lg bg-transparent border-2 border-[#101b0d] dark:border-white text-[#101b0d] dark:text-white font-bold hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                Tải ảnh lên
              </button>
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
    </CustomerLayout>
  );
};

export default EncyclopediaPage;
