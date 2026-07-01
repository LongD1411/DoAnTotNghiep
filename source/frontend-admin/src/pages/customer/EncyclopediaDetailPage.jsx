import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import CustomerLayout from '../../components/customer/CustomerLayout';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import { SEVERITY_BADGE } from '../../data/encyclopediaData';
import { getEntryById, getAllEntries } from '../../services/encyclopediaService';
import { getProductById } from '../../services/productService';

const fmt = (n) =>
  n != null ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n) : '—';

const TABS = [
  { id: 'symptoms',   label: 'Triệu chứng'        },
  { id: 'conditions', label: 'Điều kiện phát sinh' },
  { id: 'treatment',  label: 'Biện pháp xử lý'     },
];

const EncyclopediaDetailPage = () => {
  const { slug } = useParams();
  const [entry,        setEntry]        = useState(null);
  const [related,      setRelated]      = useState([]);
  const [recommended,  setRecommended]  = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [notFound,     setNotFound]     = useState(false);
  const [activeTab,    setActiveTab]    = useState('symptoms');
  const [activeImage,  setActiveImage]  = useState(0);
  const [lightbox,     setLightbox]     = useState(false);

  useEffect(() => {
    if (!slug) { setNotFound(true); setLoading(false); return; }
    setLoading(true);
    setNotFound(false);
    setEntry(null);
    setRelated([]);
    setRecommended([]);
    setActiveImage(0);

    getEntryById(slug)
      .then(async (res) => {
        const data = res.data?.data;
        if (!data) { setNotFound(true); return; }
        setEntry(data);

        // Fetch related và recommended song song
        await Promise.allSettled([
          // Related: cùng category, loại bỏ entry hiện tại
          getAllEntries({ category: data.category, limit: 4 })
            .then(r => {
              const list = (r.data?.data?.data ?? []).filter(e => e.id !== data.id).slice(0, 3);
              setRelated(list);
            }),

          // Recommended products
          ...(data.recommended_product_ids?.length
            ? data.recommended_product_ids.map(pid =>
                getProductById(pid)
                  .then(r => r.data?.data?.product ?? r.data?.data ?? null)
                  .catch(() => null)
              )
            : []
          ),
        ]).then((results) => {
          // results[0] = related (allSettled — handled above)
          // results[1..] = products
          const products = results
            .slice(1)
            .filter(r => r.status === 'fulfilled' && r.value)
            .map(r => r.value);
          setRecommended(products);
        });
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  // Điều khiển bàn phím cho lightbox
  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e) => {
      const len = entry?.images?.length ?? 0;
      if (e.key === 'Escape') setLightbox(false);
      else if (e.key === 'ArrowLeft' && len > 1) setActiveImage(i => (i - 1 + len) % len);
      else if (e.key === 'ArrowRight' && len > 1) setActiveImage(i => (i + 1) % len);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox, entry]);

  if (loading) {
    return (
      <CustomerLayout>
        <LoadingOverlay visible />
        <div className="min-h-[50vh]" />
      </CustomerLayout>
    );
  }

  if (notFound || !entry) {
    return (
      <CustomerLayout>
        <div className="w-full px-4 md:px-10 lg:px-20 xl:px-40 py-20 flex flex-col items-center gap-4 text-center">
          <span className="material-symbols-outlined text-[64px] text-gray-300">search_off</span>
          <h2 className="text-2xl font-bold text-[#101b0d] dark:text-white">Không tìm thấy mục tra cứu</h2>
          <p className="text-gray-500">Mục này không tồn tại hoặc đường dẫn không hợp lệ.</p>
          <Link to="/tra-cuu" className="mt-2 flex items-center gap-1 text-primary font-bold hover:underline">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Quay lại tra cứu
          </Link>
        </div>
      </CustomerLayout>
    );
  }

  const badge        = SEVERITY_BADGE[entry.severity] ?? { label: entry.severity, cls: 'bg-slate-100 text-slate-700' };
  const images       = Array.isArray(entry.images) ? entry.images : [];
  const currentImage = images[activeImage] ?? images[0];
  const productCount = entry.recommended_product_ids?.length ?? 0;

  return (
    <CustomerLayout>
      <div className="w-full px-4 md:px-10 lg:px-20 xl:px-40 py-8 flex flex-col gap-10 overflow-x-hidden">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm flex-wrap">
          <Link to="/trang-chu" className="text-[#599a4c] hover:text-primary font-medium transition-colors">Trang chủ</Link>
          <span className="text-[#599a4c]">/</span>
          <Link to="/tra-cuu" className="text-[#599a4c] hover:text-primary font-medium transition-colors">Tra cứu</Link>
          <span className="text-[#599a4c]">/</span>
          <span className="text-[#101b0d] dark:text-white font-medium line-clamp-1 max-w-[200px]">{entry.name}</span>
        </nav>

        {/* ── Hero ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* Gallery */}
          <div className="flex flex-col gap-3">

            {/* Ảnh chính */}
            <div className="group rounded-2xl overflow-hidden border border-[#d3e7cf] dark:border-[#2a4524] aspect-[4/3] relative bg-gray-100 dark:bg-[#2a3e25] flex items-center justify-center">
              {currentImage ? (
                <img
                  src={currentImage}
                  alt={`${entry.name} — ảnh ${activeImage + 1}`}
                  onClick={() => setLightbox(true)}
                  className="w-full h-full object-cover absolute inset-0 cursor-zoom-in"
                />
              ) : (
                <span className="material-symbols-outlined text-[80px] text-gray-300 dark:text-gray-600">image</span>
              )}

              {/* Severity badge */}
              <div className={`absolute top-4 left-4 text-xs font-bold px-3 py-1 rounded-full shadow ${badge.cls}`}>
                {badge.label}
              </div>

              {/* Đếm số ảnh */}
              {images.length > 1 && (
                <div className="absolute bottom-4 right-4 text-xs font-semibold px-2.5 py-1 rounded-full bg-black/60 text-white backdrop-blur-sm">
                  {activeImage + 1} / {images.length}
                </div>
              )}

              {/* Prev / Next */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImage(i => (i - 1 + images.length) % images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 size-9 rounded-full bg-white/80 dark:bg-black/50 text-[#101b0d] dark:text-white flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                    aria-label="Ảnh trước"
                  >
                    <span className="material-symbols-outlined text-[22px]">chevron_left</span>
                  </button>
                  <button
                    onClick={() => setActiveImage(i => (i + 1) % images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 size-9 rounded-full bg-white/80 dark:bg-black/50 text-[#101b0d] dark:text-white flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                    aria-label="Ảnh sau"
                  >
                    <span className="material-symbols-outlined text-[22px]">chevron_right</span>
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails — 5 cột dàn đều khớp bề ngang ảnh chính */}
            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-2.5">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`relative aspect-square w-full rounded-lg overflow-hidden border-2 transition-all ${
                      i === activeImage
                        ? 'border-primary ring-2 ring-primary/30'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col gap-5 justify-start">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#599a4c]">{entry.category}</span>

            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-[#101b0d] dark:text-white">
                {entry.name}
              </h1>
              {entry.latin_name && (
                <p className="text-lg text-gray-500 italic mt-1">{entry.latin_name}</p>
              )}
            </div>

            <div className="h-px bg-[#e9f3e7] dark:bg-white/10" />

            {entry.description && (
              <div
                className="rich-prose text-base leading-relaxed text-gray-600 dark:text-gray-300 overflow-x-hidden"
                dangerouslySetInnerHTML={{ __html: entry.description }}
              />
            )}

            {/* Crop types */}
            {entry.crop_types?.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-sm font-semibold text-[#101b0d] dark:text-white">Cây trồng bị ảnh hưởng:</p>
                <div className="flex flex-wrap gap-2">
                  {entry.crop_types.map(c => (
                    <span key={c} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#e9f3e7] dark:bg-[#2a3c25] text-sm font-medium text-[#2E7D32] dark:text-primary">
                      <span className="material-symbols-outlined text-[14px]">eco</span>
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="flex gap-4 flex-wrap">
              {productCount > 0 && (
                <div className="flex flex-col items-center gap-1 px-4 py-3 rounded-xl bg-white dark:bg-[#1c3019] border border-[#d3e7cf] dark:border-[#2a4524]">
                  <span className="text-2xl font-black text-[#2E7D32] dark:text-primary">{productCount}</span>
                  <span className="text-xs text-gray-400">Sản phẩm xử lý</span>
                </div>
              )}
              <div className="flex flex-col items-center gap-1 px-4 py-3 rounded-xl bg-white dark:bg-[#1c3019] border border-[#d3e7cf] dark:border-[#2a4524]">
                <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${badge.cls}`}>{badge.label}</span>
                <span className="text-xs text-gray-400">Mức độ nguy hại</span>
              </div>
              {entry.view_count > 0 && (
                <div className="flex flex-col items-center gap-1 px-4 py-3 rounded-xl bg-white dark:bg-[#1c3019] border border-[#d3e7cf] dark:border-[#2a4524]">
                  <span className="text-2xl font-black text-[#2E7D32] dark:text-primary">{entry.view_count}</span>
                  <span className="text-xs text-gray-400">Lượt xem</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Tabs ─────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-0">
          <div className="border-b border-[#e9f3e7] dark:border-white/10 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <nav className="flex gap-0 -mb-px">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap py-4 px-5 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary text-[#101b0d] dark:text-white font-bold'
                      : 'border-transparent text-[#599a4c] hover:text-[#101b0d] dark:hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="bg-white dark:bg-[#132210] rounded-b-xl border border-t-0 border-[#d3e7cf] dark:border-[#2a4524] p-6 md:p-8">

            {activeTab === 'symptoms' && (
              entry.symptoms?.length ? (
                <ul className="flex flex-col gap-3">
                  {entry.symptoms.map((s, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span
                        className="material-symbols-outlined text-[#2E7D32] dark:text-primary text-[20px] shrink-0 mt-0.5"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        circle
                      </span>
                      <p className="text-base text-gray-700 dark:text-gray-200 leading-relaxed">{s}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400 text-sm italic">Chưa có dữ liệu triệu chứng.</p>
              )
            )}

            {activeTab === 'conditions' && (
              entry.conditions ? (
                <div
                  className="rich-prose text-base text-gray-700 dark:text-gray-200 leading-relaxed overflow-x-hidden"
                  dangerouslySetInnerHTML={{ __html: entry.conditions }}
                />
              ) : (
                <p className="text-gray-400 text-sm italic">Chưa có dữ liệu điều kiện phát sinh.</p>
              )
            )}

            {activeTab === 'treatment' && (
              entry.treatment?.length ? (
                <ol className="flex flex-col gap-4">
                  {entry.treatment.map((t, i) => (
                    <li key={i} className="flex items-start gap-4">
                      <span className="flex-shrink-0 size-7 rounded-full bg-primary/20 dark:bg-primary/10 text-[#2E7D32] dark:text-primary text-sm font-bold flex items-center justify-center mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-base text-gray-700 dark:text-gray-200 leading-relaxed">{t}</p>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-gray-400 text-sm italic">Chưa có dữ liệu biện pháp xử lý.</p>
              )
            )}
          </div>
        </div>

        {/* ── Recommended products ─────────────────────────────────── */}
        {recommended.length > 0 && (
          <section className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#101b0d] dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-[#2E7D32] dark:text-primary text-[22px]">science</span>
                Sản phẩm khuyến nghị
              </h2>
              <Link to="/san-pham" className="text-base font-bold text-primary hover:text-[#3dd122] flex items-center gap-1">
                Xem tất cả <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommended.map(p => {
                const dp = p.discount_price
                  ? Math.round((1 - p.discount_price / p.price) * 100)
                  : null;
                const img = p.images?.[0]?.url ?? p.image_url;
                return (
                  <Link
                    key={p.id}
                    to={`/san-pham/${p.slug}`}
                    className="group flex items-center gap-4 bg-white dark:bg-[#132210] rounded-xl border border-[#d3e7cf] dark:border-[#2a4524] p-4 hover:shadow-md hover:border-primary transition-all"
                  >
                    <div className="size-16 rounded-lg overflow-hidden bg-[#f6f8f6] dark:bg-[#2a3e25] shrink-0 relative">
                      {img ? (
                        <div
                          className="w-full h-full bg-center bg-cover group-hover:scale-105 transition-transform duration-300"
                          style={{ backgroundImage: `url(${img})` }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-gray-400 text-[24px]">image</span>
                        </div>
                      )}
                      {dp && (
                        <span className="absolute top-1 left-1 text-[10px] font-bold bg-red-500 text-white px-1 rounded">
                          -{dp}%
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                      {p.category?.name && (
                        <p className="text-xs font-semibold text-[#599a4c] uppercase tracking-wider">{p.category.name}</p>
                      )}
                      <h3 className="text-sm font-bold text-[#101b0d] dark:text-white group-hover:text-primary transition-colors line-clamp-1">
                        {p.name}
                      </h3>
                      <span className="text-sm font-bold text-[#2E7D32] dark:text-primary mt-1">
                        {fmt(p.discount_price ?? p.price)}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Related entries ───────────────────────────────────────── */}
        {related.length > 0 && (
          <section className="flex flex-col gap-5">
            <h2 className="text-xl font-bold text-[#101b0d] dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-[#2E7D32] dark:text-primary text-[22px]">account_tree</span>
              Mục liên quan — {entry.category}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {related.map(e => {
                const rb = SEVERITY_BADGE[e.severity] ?? { label: e.severity, cls: 'bg-slate-100 text-slate-600' };
                return (
                  <Link
                    key={e.id}
                    to={`/tra-cuu/${e.slug}`}
                    className="group flex flex-col rounded-xl overflow-hidden bg-white dark:bg-[#132210] border border-[#d3e7cf] dark:border-[#2a4524] hover:shadow-md hover:border-primary transition-all"
                  >
                    <div className="relative w-full pt-[56%] overflow-hidden bg-gray-100 dark:bg-[#2a3e25]">
                      {e.thumbnail ? (
                        <img
                          src={e.thumbnail} alt={e.name}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="material-symbols-outlined text-[36px] text-gray-300">image</span>
                        </div>
                      )}
                      <div className={`absolute top-2 left-2 text-xs font-bold px-2 py-0.5 rounded shadow ${rb.cls}`}>
                        {rb.label}
                      </div>
                    </div>
                    <div className="p-4 flex flex-col gap-1">
                      <p className="text-xs font-semibold text-[#599a4c] uppercase tracking-wider">{e.category}</p>
                      <h3 className="text-base font-bold text-[#101b0d] dark:text-white group-hover:text-primary transition-colors leading-tight">
                        {e.name}
                      </h3>
                      {e.latin_name && (
                        <p className="text-xs text-gray-500 italic">{e.latin_name}</p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Back */}
        <Link
          to="/tra-cuu"
          className="self-start flex items-center gap-1.5 text-base font-medium text-[#599a4c] hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Quay lại danh sách tra cứu
        </Link>
      </div>

      {/* ── Lightbox ─────────────────────────────────────────────── */}
      {lightbox && currentImage && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(false)}
        >
          {/* Close */}
          <button
            onClick={() => setLightbox(false)}
            className="absolute top-5 right-5 size-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            aria-label="Đóng"
          >
            <span className="material-symbols-outlined text-[26px]">close</span>
          </button>

          {/* Prev / Next */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); setActiveImage(i => (i - 1 + images.length) % images.length); }}
                className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 size-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                aria-label="Ảnh trước"
              >
                <span className="material-symbols-outlined text-[28px]">chevron_left</span>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setActiveImage(i => (i + 1) % images.length); }}
                className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 size-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                aria-label="Ảnh sau"
              >
                <span className="material-symbols-outlined text-[28px]">chevron_right</span>
              </button>
            </>
          )}

          {/* Ảnh phóng to */}
          <img
            src={currentImage}
            alt={`${entry.name} — ảnh ${activeImage + 1}`}
            onClick={(e) => e.stopPropagation()}
            className="max-w-full max-h-[85vh] object-contain rounded-lg"
          />

          {/* Counter */}
          {images.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-sm font-semibold px-3 py-1.5 rounded-full bg-white/10 text-white backdrop-blur-sm">
              {activeImage + 1} / {images.length}
            </div>
          )}
        </div>
      )}
    </CustomerLayout>
  );
};

export default EncyclopediaDetailPage;
