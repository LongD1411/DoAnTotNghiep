import { useState, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import CustomerLayout from '../../components/customer/CustomerLayout';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import Select from '../../components/common/Select';
import { FAKE_PRODUCTS } from '../../data/productData';


const ITEMS_PER_PAGE = 6;

const CATEGORY_OPTIONS = [
  { value: 'Herbicide',   label: 'Diệt cỏ' },
  { value: 'Fungicide',   label: 'Trừ nấm' },
  { value: 'Insecticide', label: 'Trừ sâu' },
  { value: 'Phân bón',    label: 'Phân bón' },
  { value: 'Dụng cụ',     label: 'Dụng cụ' },
];

const PRICE_OPTIONS = [
  { value: 'u150',  label: 'Dưới 150.000đ',       min: 0,      max: 150000  },
  { value: 'u350',  label: '150.000 – 350.000đ',   min: 150000, max: 350000  },
  { value: 'u700',  label: '350.000 – 700.000đ',   min: 350000, max: 700000  },
  { value: 'o700',  label: 'Trên 700.000đ',         min: 700000, max: Infinity },
];

const QUICK_FILTERS = [
  { id: 'all',         label: 'Tất cả'    },
  { id: 'Herbicide',   label: 'Diệt cỏ'  },
  { id: 'Fungicide',   label: 'Trừ nấm'  },
  { id: 'Insecticide', label: 'Trừ sâu'  },
  { id: 'Phân bón',    label: 'Phân bón' },
];

const SORT_OPTIONS = [
  { value: 'default',    label: 'Liên quan nhất'     },
  { value: 'price-asc',  label: 'Giá: Thấp → Cao'   },
  { value: 'price-desc', label: 'Giá: Cao → Thấp'   },
  { value: 'top-rated',  label: 'Đánh giá cao nhất'  },
];

const BTN_ADD = 'bg-[#e9f3e7] dark:bg-white/10 text-[#2E7D32] dark:text-primary hover:bg-[#2E7D32] hover:text-white dark:hover:bg-[#2E7D32] transition-colors';

const fmt = (n) =>
  n != null ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n) : '—';

const CatalogPage = () => {
  const [heroSearch, setHeroSearch]     = useState('');
  const [activeChip, setActiveChip]     = useState('all');
  const [catFilters, setCatFilters]     = useState({});
  const [priceFilters, setPriceFilters] = useState({});
  const [sortBy, setSortBy]             = useState('default');
  const [currentPage, setCurrentPage]   = useState(1);
  const gridRef = useRef(null);
  const loading = false;

  const toggleCheck = (setter, key) =>
    setter(prev => ({ ...prev, [key]: !prev[key] }));

  const resetFilters = () => {
    setCatFilters({});
    setPriceFilters({});
    setActiveChip('all');
    setHeroSearch('');
    setSortBy('default');
    setCurrentPage(1);
  };

  const filtered = useMemo(() => {
    let list = FAKE_PRODUCTS;

    if (heroSearch.trim()) {
      const q = heroSearch.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.ingredient.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q),
      );
    }

    if (activeChip !== 'all')
      list = list.filter(p => p.category === activeChip);

    const activeCats = Object.keys(catFilters).filter(k => catFilters[k]);
    if (activeCats.length)
      list = list.filter(p => activeCats.includes(p.category));

    const activePrices = PRICE_OPTIONS.filter(o => priceFilters[o.value]);
    if (activePrices.length)
      list = list.filter(p => {
        const eff = p.discount_price ?? p.price;
        return activePrices.some(r => eff >= r.min && eff < r.max);
      });

    if (sortBy === 'price-asc')
      list = [...list].sort((a, b) => (a.discount_price ?? a.price) - (b.discount_price ?? b.price));
    else if (sortBy === 'price-desc')
      list = [...list].sort((a, b) => (b.discount_price ?? b.price) - (a.discount_price ?? a.price));
    else if (sortBy === 'top-rated')
      list = [...list].sort((a, b) => b.rating - a.rating);

    return list;
  }, [heroSearch, activeChip, catFilters, priceFilters, sortBy]);

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

  return (
    <CustomerLayout>
      <LoadingOverlay visible={loading} />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section
        className="relative flex min-h-[400px] flex-col gap-6 bg-cover bg-center bg-no-repeat items-center justify-center p-4"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.7) 100%), url("https://picsum.photos/seed/agro-store-hero/1440/600")',
        }}
      >
        <div className="flex flex-col gap-2 text-center max-w-2xl z-10">
          <span className="inline-flex self-center items-center gap-2 px-3 py-1 rounded-full bg-primary/90 text-[#101b0d] text-xs font-bold uppercase tracking-wider">
            <span className="material-symbols-outlined text-[16px]">storefront</span>
            Cửa hàng
          </span>
          <h1 className="text-white text-4xl md:text-5xl font-black leading-tight tracking-[-0.033em]">
            Sản phẩm bảo vệ thực vật
          </h1>
          <p className="text-gray-200 text-lg md:text-xl font-medium leading-normal">
            Thuốc BVTV, phân bón và dụng cụ nông nghiệp chất lượng cao từ các thương hiệu uy tín.
          </p>
        </div>

        {/* Search bar */}
        <div className="w-full max-w-xl z-10 mt-4">
          <div className="flex w-full items-stretch rounded-lg shadow-lg">
            <div className="flex bg-white dark:bg-[#1c3019] items-center justify-center pl-4 rounded-l-lg">
              <span className="material-symbols-outlined text-[#599a4c] text-[20px]">search</span>
            </div>
            <input
              className="flex w-full min-w-0 flex-1 bg-white dark:bg-[#1c3019] text-[#101b0d] dark:text-white focus:outline-none h-12 placeholder:text-[#599a4c] dark:placeholder:text-gray-500 px-3 text-base font-normal"
              placeholder="Tìm sản phẩm, hoạt chất, tên thương hiệu..."
              value={heroSearch}
              onChange={(e) => { setHeroSearch(e.target.value); setCurrentPage(1); }}
            />
            <div className="flex items-center justify-center rounded-r-lg bg-white dark:bg-[#1c3019] pr-1">
              <button
                onClick={() => setCurrentPage(1)}
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
          <span className="text-[#101b0d] dark:text-white font-medium">Cửa hàng</span>
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

            {/* Danh mục sản phẩm */}
            <details className="flex flex-col rounded-lg border border-[#d3e7cf] dark:border-[#2A3C25] bg-white dark:bg-[#1c3019] px-4 py-2 group" open>
              <summary className="flex cursor-pointer items-center justify-between gap-2 py-2 select-none">
                <span className="text-[#101b0d] dark:text-white text-sm font-bold">Danh mục sản phẩm</span>
                <span className="material-symbols-outlined text-[#101b0d] dark:text-white group-open:rotate-180 transition-transform text-[20px]">expand_more</span>
              </summary>
              <div className="pt-2 pb-2 flex flex-col gap-2">
                {CATEGORY_OPTIONS.map(opt => (
                  <label key={opt.value} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!catFilters[opt.value]}
                      onChange={() => { toggleCheck(setCatFilters, opt.value); setCurrentPage(1); }}
                      className="size-4 rounded border-gray-300 text-primary focus:ring-primary bg-white dark:bg-[#132210] dark:border-gray-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{opt.label}</span>
                    <span className="ml-auto text-xs text-gray-400">
                      {FAKE_PRODUCTS.filter(p => p.category === opt.value).length}
                    </span>
                  </label>
                ))}
              </div>
            </details>

            {/* Khoảng giá */}
            <details className="flex flex-col rounded-lg border border-[#d3e7cf] dark:border-[#2A3C25] bg-white dark:bg-[#1c3019] px-4 py-2 group" open>
              <summary className="flex cursor-pointer items-center justify-between gap-2 py-2 select-none">
                <span className="text-[#101b0d] dark:text-white text-sm font-bold">Khoảng giá</span>
                <span className="material-symbols-outlined text-[#101b0d] dark:text-white group-open:rotate-180 transition-transform text-[20px]">expand_more</span>
              </summary>
              <div className="pt-2 pb-2 flex flex-col gap-2">
                {PRICE_OPTIONS.map(opt => (
                  <label key={opt.value} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!priceFilters[opt.value]}
                      onChange={() => { toggleCheck(setPriceFilters, opt.value); setCurrentPage(1); }}
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
              <span className="text-sm font-medium text-gray-500 mr-1">Danh mục:</span>
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

            {/* Toolbar */}
            <div className="flex flex-wrap justify-between items-center gap-4 bg-white dark:bg-[#1c3019] p-4 rounded-xl border border-[#d3e7cf] dark:border-[#2f4b26] shadow-sm">
              <p className="text-sm text-[#599a4c] dark:text-[#a3d49b] font-medium">
                Hiển thị{' '}
                <span className="text-[#101b0d] dark:text-white font-bold">{paginated.length}</span>
                {' '}/{' '}
                <span className="text-[#101b0d] dark:text-white font-bold">{filtered.length}</span>
                {' '}sản phẩm
              </p>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#599a4c] text-[18px] hidden sm:block">sort</span>
                <Select
                  value={sortBy}
                  options={SORT_OPTIONS}
                  onChange={(val) => { setSortBy(val); setCurrentPage(1); }}
                />
              </div>
            </div>

            {/* Product grid */}
            {paginated.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {paginated.map(product => {
                  const discountPct = product.discount_price
                    ? Math.round((1 - product.discount_price / product.price) * 100)
                    : null;
                  return (
                    <Link
                      key={product.id}
                      to={`/san-pham/${product.slug}`}
                      className="group flex flex-col rounded-xl border border-[#d3e7cf] dark:border-[#2f4b26] bg-white dark:bg-[#1a2e16] overflow-hidden hover:shadow-lg transition-all duration-300"
                    >
                      {/* Image */}
                      <div className="relative aspect-[4/3] bg-[#f6f8f6] dark:bg-[#2a3e25] overflow-hidden">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        />
                        {product.badge ? (
                          <span className={`absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded ${product.badge === 'Mới' ? 'bg-primary text-[#101b0d]' : 'bg-[#e0f2fe] text-[#0369a1]'}`}>
                            {product.badge}
                          </span>
                        ) : discountPct ? (
                          <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded">
                            -{discountPct}%
                          </span>
                        ) : null}
                        <button
                          aria-label="Xem chi tiết"
                          className="absolute top-3 right-3 p-2 rounded-full bg-white/90 text-[#101b0d] hover:bg-primary hover:text-[#101b0d] transition-colors shadow-sm opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 duration-300"
                        >
                          <span className="material-symbols-outlined text-[20px]">visibility</span>
                        </button>
                      </div>

                      {/* Card body */}
                      <div className="p-4 flex flex-col gap-2 flex-grow">
                        <div className="flex flex-col gap-0.5">
                          <p className="text-xs font-semibold text-[#599a4c] uppercase tracking-wider">{product.category}</p>
                          <h3 className="text-lg font-bold text-[#101b0d] dark:text-white group-hover:text-[#2E7D32] dark:group-hover:text-primary transition-colors leading-tight">
                            {product.name}
                          </h3>
                          <p className="text-xs text-gray-500 italic">{product.ingredient}</p>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{product.description}</p>

                        <div className="mt-auto pt-4 flex items-center justify-between gap-3">
                          <div className="flex flex-col">
                            {product.discount_price ? (
                              <>
                                <span className="text-gray-400 text-xs line-through">{fmt(product.price)}</span>
                                <span className="text-[#2E7D32] dark:text-primary text-xl font-black">{fmt(product.discount_price)}</span>
                              </>
                            ) : (
                              <span className="text-[#101b0d] dark:text-white text-xl font-black">{fmt(product.price)}</span>
                            )}
                          </div>
                          <button className={`py-1.5 px-3 rounded-lg text-sm font-bold flex items-center gap-1.5 ${BTN_ADD}`}>
                            <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
                            Thêm
                          </button>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
                <span className="material-symbols-outlined text-[48px] text-gray-300">search_off</span>
                <p className="text-gray-500 text-base">Không tìm thấy sản phẩm phù hợp.</p>
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
      </div>
    </CustomerLayout>
  );
};

export default CatalogPage;
