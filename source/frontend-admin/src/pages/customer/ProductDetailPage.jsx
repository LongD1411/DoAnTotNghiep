import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import CustomerLayout from '../../components/customer/CustomerLayout';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import { FAKE_PRODUCTS, SHARED_REVIEWS } from '../../data/productData';

const fmt = (n) =>
  n != null ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n) : '—';

const StarRow = ({ rating, size = 20, fill = false }) => {
  const full  = Math.floor(rating);
  const half  = rating % 1 >= 0.5;
  return (
    <div className="flex items-center gap-0.5 text-yellow-400">
      {Array.from({ length: 5 }, (_, i) => {
        const icon = i < full ? 'star' : i === full && half ? 'star_half' : 'star';
        const filled = i < full || (i === full && half);
        return (
          <span
            key={i}
            className="material-symbols-outlined"
            style={{ fontSize: size, fontVariationSettings: filled ? "'FILL' 1" : "'FILL' 0" }}
          >
            {icon}
          </span>
        );
      })}
    </div>
  );
};

const TABS = [
  { id: 'desc',     label: 'Mô tả'                },
  { id: 'specs',    label: 'Thông số kỹ thuật'     },
  { id: 'safety',   label: 'An toàn sử dụng'       },
  { id: 'shipping', label: 'Vận chuyển & Đổi trả'  },
];

const ProductDetailPage = () => {
  const { slug }   = useParams();
  const navigate   = useNavigate();
  const loading    = false;

  const id      = parseInt(slug?.split('-')[0], 10);
  const product = FAKE_PRODUCTS.find(p => p.id === id);

  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty]             = useState(1);
  const [activeTab, setActiveTab] = useState('desc');
  const [saved, setSaved]         = useState(false);


  if (!product) {
    return (
      <CustomerLayout>
        <div className="w-full px-4 md:px-10 lg:px-20 xl:px-40 py-20 flex flex-col items-center gap-4 text-center">
          <span className="material-symbols-outlined text-[64px] text-gray-300">inventory_2</span>
          <h2 className="text-2xl font-bold text-[#101b0d] dark:text-white">Không tìm thấy sản phẩm</h2>
          <p className="text-gray-500">Sản phẩm này không tồn tại hoặc đường dẫn không hợp lệ.</p>
          <Link to="/san-pham" className="mt-2 flex items-center gap-1 text-primary font-bold hover:underline">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Quay lại cửa hàng
          </Link>
        </div>
      </CustomerLayout>
    );
  }

  const discountPct = product.discount_price
    ? Math.round((1 - product.discount_price / product.price) * 100)
    : null;

  const related = FAKE_PRODUCTS.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);

  return (
    <CustomerLayout>
      <LoadingOverlay visible={loading} />

      <div className="w-full px-4 md:px-10 lg:px-20 xl:px-40 py-8 flex flex-col gap-12 overflow-x-hidden">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm flex-wrap">
          <Link to="/trang-chu" className="text-[#599a4c] hover:text-primary font-medium transition-colors">Trang chủ</Link>
          <span className="text-[#599a4c]">/</span>
          <Link to="/san-pham" className="text-[#599a4c] hover:text-primary font-medium transition-colors">Cửa hàng</Link>
          <span className="text-[#599a4c]">/</span>
          <span className="text-[#101b0d] dark:text-white font-medium line-clamp-1 max-w-[280px]">{product.name}</span>
        </nav>

        {/* ── Hero ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* Image gallery */}
          <div className="flex flex-col gap-4">
            <div className="aspect-[4/3] w-full rounded-2xl overflow-hidden bg-white dark:bg-[#1c3019] border border-[#d3e7cf] dark:border-[#2a4524] relative group">
              {product.badge && (
                <div className="absolute top-4 left-4 z-10">
                  <span className="px-3 py-1 bg-primary/20 text-[#101b0d] text-xs font-bold rounded-full border border-primary/30 backdrop-blur-sm">
                    {product.badge}
                  </span>
                </div>
              )}
              {discountPct && !product.badge && (
                <div className="absolute top-4 left-4 z-10">
                  <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                    -{discountPct}%
                  </span>
                </div>
              )}
              <div
                className="w-full h-full bg-center bg-cover transition-transform duration-500 group-hover:scale-105"
                style={{ backgroundImage: `url(${product.images[activeImg]})` }}
              />
            </div>
            <div className="grid grid-cols-4 gap-3">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`aspect-square rounded-xl border-2 overflow-hidden transition-colors ${
                    activeImg === i
                      ? 'border-primary'
                      : 'border-[#d3e7cf] dark:border-[#2a4524] hover:border-primary/50'
                  }`}
                >
                  <div
                    className="w-full h-full bg-center bg-cover"
                    style={{ backgroundImage: `url(${img})` }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product info */}
          <div className="flex flex-col gap-5">
            {/* Rating */}
            <div className="flex items-center gap-2">
              <StarRow rating={product.rating} />
              <span className="text-sm font-medium text-[#599a4c] hover:text-primary cursor-pointer">
                ({product.reviewCount} đánh giá)
              </span>
            </div>

            {/* Name + ingredient + quick desc */}
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[#101b0d] dark:text-white">
                {product.name}
              </h1>
              <p className="text-lg text-[#599a4c] dark:text-primary/80">{product.ingredient}</p>
              <p className="text-base leading-relaxed text-gray-600 dark:text-gray-300 mt-1">{product.description}</p>
            </div>

            <div className="h-px bg-[#e9f3e7] dark:bg-white/10" />

            {/* Price + stock */}
            <div className="flex items-end gap-3 flex-wrap">
              {product.discount_price ? (
                <>
                  <span className="text-4xl font-bold text-[#101b0d] dark:text-white">{fmt(product.discount_price)}</span>
                  <span className="text-xl text-gray-400 line-through mb-1">{fmt(product.price)}</span>
                </>
              ) : (
                <span className="text-4xl font-bold text-[#101b0d] dark:text-white">{fmt(product.price)}</span>
              )}
              <span className={`mb-1 ml-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                product.stock > 0
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                  : 'bg-red-100 text-red-700'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                {product.stock > 0 ? `Còn ${product.stock} sản phẩm` : 'Hết hàng'}
              </span>
            </div>

            {/* Qty + actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <div className="flex items-center rounded-xl border border-[#d3e7cf] dark:border-[#3a5c35] bg-white dark:bg-[#1c3019] w-fit">
                <button
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="p-3 hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">remove</span>
                </button>
                <span className="w-10 text-center font-bold text-[#101b0d] dark:text-white select-none">{qty}</span>
                <button
                  onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                  className="p-3 hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">add</span>
                </button>
              </div>
              <button
                disabled={product.stock === 0}
                className="flex-1 bg-primary hover:bg-[#3ed622] text-[#101b0d] font-bold py-3 px-6 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined">shopping_bag</span>
                Thêm vào giỏ
              </button>
              <button
                onClick={() => setSaved(v => !v)}
                className={`p-3 rounded-xl border transition-colors ${
                  saved
                    ? 'border-primary text-primary bg-primary/5'
                    : 'border-[#d3e7cf] dark:border-[#3a5c35] text-gray-400 hover:border-primary hover:text-primary'
                }`}
              >
                <span className="material-symbols-outlined" style={saved ? { fontVariationSettings: "'FILL' 1" } : {}}>
                  favorite
                </span>
              </button>
            </div>

            {/* Safety notice */}
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800/40 flex gap-3 items-start">
              <span className="material-symbols-outlined text-yellow-600 dark:text-yellow-400 shrink-0 text-[22px]">warning</span>
              <div className="text-sm text-yellow-800 dark:text-yellow-200">
                <span className="font-bold block mb-1">Lưu ý an toàn</span>
                {product.safetyNote}
              </div>
            </div>
          </div>
        </div>

        {/* ── Tabs ─────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-6">
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Tab content */}
            <div className="md:col-span-2 text-gray-600 dark:text-gray-300 leading-relaxed flex flex-col gap-4">
              {activeTab === 'desc' && (
                <>
                  {product.fullDesc.map((p, i) => <p key={i}>{p}</p>)}
                  <h4 className="text-lg font-bold text-[#101b0d] dark:text-white mt-2">Lợi ích nổi bật</h4>
                  <ul className="list-disc pl-5 flex flex-col gap-2">
                    {product.benefits.map((b, i) => <li key={i}>{b}</li>)}
                  </ul>
                </>
              )}
              {activeTab === 'specs' && (
                <div className="flex flex-col gap-3">
                  {product.specs.map(s => (
                    <div key={s.label} className="flex justify-between py-2 border-b border-dashed border-[#e9f3e7] dark:border-white/10">
                      <span className="text-gray-500 text-sm">{s.label}</span>
                      <span className="font-medium text-[#101b0d] dark:text-white text-sm text-right">{s.value}</span>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === 'safety' && (
                <>
                  <div className="flex gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800/40">
                    <span className="material-symbols-outlined text-yellow-600 shrink-0">warning</span>
                    <p className="text-yellow-800 dark:text-yellow-200 text-sm">{product.safetyNote}</p>
                  </div>
                  <p>Luôn đọc kỹ nhãn sản phẩm trước khi sử dụng. Tuân thủ đúng liều lượng và thời gian cách ly khuyến cáo. Bảo quản sản phẩm trong bao bì gốc, tránh xa tầm tay trẻ em.</p>
                  <p>Trường hợp bị nhiễm: rửa da và mắt bằng nhiều nước sạch ít nhất 15 phút. Nếu nuốt phải: không gây nôn, đến cơ sở y tế ngay và mang theo nhãn sản phẩm.</p>
                </>
              )}
              {activeTab === 'shipping' && (
                <>
                  <p>Đơn hàng được xử lý trong vòng 1–2 ngày làm việc sau khi thanh toán thành công.</p>
                  <ul className="list-disc pl-5 flex flex-col gap-2 text-sm">
                    <li>Giao hàng tiêu chuẩn: 3–5 ngày làm việc.</li>
                    <li>Giao hàng nhanh (hỏa tốc): 1–2 ngày làm việc (chỉ áp dụng nội thành).</li>
                    <li>Miễn phí vận chuyển cho đơn hàng từ 500.000đ.</li>
                    <li>Đổi trả miễn phí trong 7 ngày nếu sản phẩm lỗi hoặc sai hàng.</li>
                    <li>Không nhận đổi trả đối với sản phẩm đã mở seal hoặc sử dụng.</li>
                  </ul>
                </>
              )}
            </div>

            {/* Quick Specs sidebar */}
            <div className="bg-white dark:bg-[#132210] rounded-xl border border-[#d3e7cf] dark:border-[#2a4524] p-6 h-fit">
              <h4 className="text-xs font-bold text-[#599a4c] uppercase tracking-wider mb-4">Thông số nhanh</h4>
              <dl className="flex flex-col gap-3 text-sm">
                {product.specs.map(s => (
                  <div key={s.label} className="flex flex-col gap-0.5 border-b border-dashed border-[#e9f3e7] dark:border-white/10 pb-3 last:border-0 last:pb-0">
                    <dt className="text-gray-400 text-xs">{s.label}</dt>
                    <dd className="font-semibold text-[#101b0d] dark:text-white">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>

        {/* ── Video Tutorial ───────────────────────────────────────── */}
        <section className="rounded-2xl bg-gradient-to-br from-[#e9f3e7] to-white dark:from-[#1a2e16] dark:to-[#132210] border border-[#d3e7cf] dark:border-[#2a4524] overflow-hidden">
          <div className="grid md:grid-cols-2 gap-8 items-center p-8 lg:p-12">
            <div className="flex flex-col gap-5">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-[#101b0d] dark:text-white text-xs font-bold uppercase tracking-wide w-fit">
                <span className="material-symbols-outlined text-[16px]">play_circle</span>
                Hướng dẫn sử dụng
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-[#101b0d] dark:text-white">
                Cách sử dụng an toàn & hiệu quả
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed">
                Xem hướng dẫn chi tiết từ chuyên gia nông nghiệp về tỷ lệ pha chế, thời điểm và kỹ thuật phun thuốc để đạt hiệu quả tối đa và an toàn cho người dùng.
              </p>
              <button className="text-[#599a4c] dark:text-gray-300 font-bold hover:text-primary dark:hover:text-primary flex items-center gap-2 group transition-colors">
                Tải hướng dẫn sử dụng PDF
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </button>
            </div>
            <div className="relative aspect-video rounded-xl overflow-hidden shadow-lg group cursor-pointer bg-[#132210]">
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors z-10" />
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-xl">
                  <span
                    className="material-symbols-outlined text-primary ml-1"
                    style={{ fontSize: 40, fontVariationSettings: "'FILL' 1" }}
                  >
                    play_arrow
                  </span>
                </div>
              </div>
              <div
                className="w-full h-full bg-center bg-cover"
                style={{ backgroundImage: `url(https://picsum.photos/seed/agro-tutorial/800/450)` }}
              />
            </div>
          </div>
        </section>

        {/* ── Reviews ──────────────────────────────────────────────── */}
        <section className="flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-[#101b0d] dark:text-white">Đánh giá khách hàng</h2>
            <button className="px-4 py-2 text-sm font-bold bg-[#101b0d] dark:bg-white text-white dark:text-[#101b0d] rounded-xl hover:opacity-90 transition-opacity">
              Viết đánh giá
            </button>
          </div>

          <div className="grid lg:grid-cols-12 gap-10">
            {/* Rating summary */}
            <div className="lg:col-span-4">
              <div className="bg-white dark:bg-[#132210] p-6 rounded-xl border border-[#d3e7cf] dark:border-[#2a4524]">
                <div className="flex items-end gap-4 mb-5">
                  <span className="text-6xl font-bold text-[#101b0d] dark:text-white">{product.rating}</span>
                  <div className="mb-2">
                    <StarRow rating={product.rating} size={18} />
                    <span className="text-sm text-gray-400 mt-1 block">{product.reviewCount} đánh giá</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {product.ratingDist.map((pct, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <span className="font-medium w-2 text-gray-600 dark:text-gray-300">{5 - i}</span>
                      <div className="flex-1 h-2 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-gray-400 w-8 text-right">{pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Review cards */}
            <div className="lg:col-span-8 flex flex-col gap-4">
              {SHARED_REVIEWS.map(r => (
                <article key={r.id} className="p-5 bg-white dark:bg-[#132210] rounded-xl border border-[#d3e7cf] dark:border-[#2a4524]">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex gap-3">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${r.avatarColor}`}>
                        {r.initials}
                      </div>
                      <div>
                        <h4 className="font-bold text-[#101b0d] dark:text-white text-sm">{r.author}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <StarRow rating={r.rating} size={14} />
                          <span className="text-xs text-gray-400">{r.time}</span>
                        </div>
                      </div>
                    </div>
                    {r.verified && (
                      <span className="text-xs font-semibold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-lg shrink-0">
                        Đã mua hàng
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{r.content}</p>
                </article>
              ))}
              <button className="w-full py-3 text-sm font-bold text-[#599a4c] border border-[#d3e7cf] dark:border-[#2a4524] rounded-xl hover:border-primary hover:text-primary transition-colors">
                Tải thêm đánh giá
              </button>
            </div>
          </div>
        </section>

        {/* ── Related ──────────────────────────────────────────────── */}
        {related.length > 0 && (
          <section className="flex flex-col gap-6">
            <h2 className="text-2xl font-bold text-[#101b0d] dark:text-white">Sản phẩm liên quan</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map(p => {
                const dp = p.discount_price
                  ? Math.round((1 - p.discount_price / p.price) * 100)
                  : null;
                return (
                  <Link
                    key={p.id}
                    to={`/san-pham/${p.slug}`}
                    className="group flex flex-col rounded-xl border border-[#d3e7cf] dark:border-[#2a4524] bg-white dark:bg-[#132210] overflow-hidden hover:shadow-md transition-all"
                  >
                    <div className="relative aspect-square overflow-hidden bg-[#f6f8f6] dark:bg-[#2a3e25]">
                      <div
                        className="w-full h-full bg-center bg-cover group-hover:scale-105 transition-transform duration-500"
                        style={{ backgroundImage: `url(${p.images[0]})` }}
                      />
                      {dp && (
                        <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded">
                          -{dp}%
                        </span>
                      )}
                    </div>
                    <div className="p-3 flex flex-col gap-1">
                      <p className="text-xs font-semibold text-[#599a4c] uppercase tracking-wider">{p.category}</p>
                      <h3 className="text-sm font-bold text-[#101b0d] dark:text-white line-clamp-2 leading-snug">
                        {p.name}
                      </h3>
                      <span className="text-sm font-bold text-[#2E7D32] dark:text-primary mt-auto">
                        {fmt(p.discount_price ?? p.price)}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

      </div>
    </CustomerLayout>
  );
};

export default ProductDetailPage;
