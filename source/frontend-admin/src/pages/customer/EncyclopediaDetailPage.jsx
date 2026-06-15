import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import CustomerLayout from '../../components/customer/CustomerLayout';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import { FAKE_ENTRIES, SEVERITY_BADGE } from '../../data/encyclopediaData';
import { FAKE_PRODUCTS } from '../../data/productData';

const fmt = (n) =>
  n != null ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n) : '—';

const TABS = [
  { id: 'symptoms',   label: 'Triệu chứng'         },
  { id: 'conditions', label: 'Điều kiện phát sinh'  },
  { id: 'treatment',  label: 'Biện pháp xử lý'      },
];

const EncyclopediaDetailPage = () => {
  const { slug }  = useParams();
  const loading   = false;

  const id    = parseInt(slug?.split('-')[0], 10);
  const entry = FAKE_ENTRIES.find(e => e.id === id);
  const badge = entry ? SEVERITY_BADGE[entry.severity] : null;

  const [activeTab, setActiveTab] = useState('symptoms');

  const recommended = entry
    ? FAKE_PRODUCTS.filter(p => entry.recommendedProductIds.includes(p.id))
    : [];

  const related = entry
    ? FAKE_ENTRIES.filter(e => e.category === entry.category && e.id !== entry.id).slice(0, 3)
    : [];

  if (!entry) {
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

  return (
    <CustomerLayout>
      <LoadingOverlay visible={loading} />

      <div className="w-full px-4 md:px-10 lg:px-20 xl:px-40 py-8 flex flex-col gap-10">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm flex-wrap">
          <Link to="/trang-chu" className="text-[#599a4c] hover:text-primary font-medium transition-colors">Trang chủ</Link>
          <span className="text-[#599a4c]">/</span>
          <Link to="/tra-cuu" className="text-[#599a4c] hover:text-primary font-medium transition-colors">Tra cứu</Link>
          <span className="text-[#599a4c]">/</span>
          <span className="text-[#599a4c] font-medium">{entry.category}</span>
          <span className="text-[#599a4c]">/</span>
          <span className="text-[#101b0d] dark:text-white font-medium line-clamp-1 max-w-[200px]">{entry.name}</span>
        </nav>

        {/* ── Hero ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* Image */}
          <div className="rounded-2xl overflow-hidden border border-[#d3e7cf] dark:border-[#2a4524] aspect-[4/3] relative">
            <img
              src={entry.image}
              alt={entry.name}
              className="w-full h-full object-cover"
            />
            <div className={`absolute top-4 left-4 text-xs font-bold px-3 py-1 rounded-full shadow ${badge.cls}`}>
              {badge.label}
            </div>
          </div>

          {/* Info */}
          <div className="flex flex-col gap-5 justify-center">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#599a4c]">{entry.category}</span>
            </div>

            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-[#101b0d] dark:text-white">
                {entry.name}
              </h1>
              <p className="text-lg text-gray-500 italic mt-1">{entry.latinName}</p>
            </div>

            <div className="h-px bg-[#e9f3e7] dark:bg-white/10" />

            <p className="text-base leading-relaxed text-gray-600 dark:text-gray-300">{entry.description}</p>

            {/* Crop types */}
            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold text-[#101b0d] dark:text-white">Cây trồng bị ảnh hưởng:</p>
              <div className="flex flex-wrap gap-2">
                {entry.cropTypes.map(c => (
                  <span key={c} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#e9f3e7] dark:bg-[#2a3c25] text-sm font-medium text-[#2E7D32] dark:text-primary">
                    <span className="material-symbols-outlined text-[14px]">eco</span>
                    {c === 'Vegetables' ? 'Rau củ'
                      : c === 'Fruits' ? 'Trái cây'
                      : c === 'Cereals' ? 'Ngũ cốc'
                      : c === 'Legumes' ? 'Đậu đỗ'
                      : c}
                  </span>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-6">
              <div className="flex flex-col items-center gap-1 px-4 py-3 rounded-xl bg-white dark:bg-[#1c3019] border border-[#d3e7cf] dark:border-[#2a4524]">
                <span className="text-2xl font-black text-[#2E7D32] dark:text-primary">{entry.productCount}</span>
                <span className="text-xs text-gray-400">Sản phẩm xử lý</span>
              </div>
              <div className="flex flex-col items-center gap-1 px-4 py-3 rounded-xl bg-white dark:bg-[#1c3019] border border-[#d3e7cf] dark:border-[#2a4524]">
                <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${badge.cls}`}>{badge.label}</span>
                <span className="text-xs text-gray-400">Mức độ nguy hại</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Tabs ─────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-0">
          <div className="border-b border-[#e9f3e7] dark:border-white/10 overflow-x-auto">
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
              <ul className="flex flex-col gap-3">
                {entry.symptoms.map((s, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-[#2E7D32] dark:text-primary text-[20px] shrink-0 mt-0.5"
                      style={{ fontVariationSettings: "'FILL' 1" }}>
                      circle
                    </span>
                    <p className="text-base text-gray-700 dark:text-gray-200 leading-relaxed">{s}</p>
                  </li>
                ))}
              </ul>
            )}

            {activeTab === 'conditions' && (
              <p className="text-base text-gray-700 dark:text-gray-200 leading-relaxed">{entry.conditions}</p>
            )}

            {activeTab === 'treatment' && (
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
                return (
                  <Link
                    key={p.id}
                    to={`/san-pham/${p.slug}`}
                    className="group flex items-center gap-4 bg-white dark:bg-[#132210] rounded-xl border border-[#d3e7cf] dark:border-[#2a4524] p-4 hover:shadow-md hover:border-primary transition-all"
                  >
                    <div className="size-16 rounded-lg overflow-hidden bg-[#f6f8f6] shrink-0 relative">
                      <div
                        className="w-full h-full bg-center bg-cover group-hover:scale-105 transition-transform duration-300"
                        style={{ backgroundImage: `url(${p.images[0]})` }}
                      />
                      {dp && (
                        <span className="absolute top-1 left-1 text-[10px] font-bold bg-red-500 text-white px-1 rounded">
                          -{dp}%
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[#599a4c] uppercase tracking-wider">{p.category}</p>
                      <h3 className="text-sm font-bold text-[#101b0d] dark:text-white group-hover:text-primary transition-colors line-clamp-1">
                        {p.name}
                      </h3>
                      <p className="text-xs text-gray-400 italic line-clamp-1">{p.ingredient}</p>
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
                const rb = SEVERITY_BADGE[e.severity];
                return (
                  <Link
                    key={e.id}
                    to={`/tra-cuu/${e.slug}`}
                    className="group flex flex-col rounded-xl overflow-hidden bg-white dark:bg-[#132210] border border-[#d3e7cf] dark:border-[#2a4524] hover:shadow-md hover:border-primary transition-all"
                  >
                    <div className="relative w-full pt-[56%] overflow-hidden bg-gray-200 dark:bg-[#2a3e25]">
                      <img
                        src={e.image} alt={e.name}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className={`absolute top-2 left-2 text-xs font-bold px-2 py-0.5 rounded shadow ${rb.cls}`}>
                        {rb.label}
                      </div>
                    </div>
                    <div className="p-4 flex flex-col gap-1">
                      <p className="text-xs font-semibold text-[#599a4c] uppercase tracking-wider">{e.category}</p>
                      <h3 className="text-base font-bold text-[#101b0d] dark:text-white group-hover:text-primary transition-colors leading-tight">
                        {e.name}
                      </h3>
                      <p className="text-xs text-gray-500 italic">{e.latinName}</p>
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
    </CustomerLayout>
  );
};

export default EncyclopediaDetailPage;
