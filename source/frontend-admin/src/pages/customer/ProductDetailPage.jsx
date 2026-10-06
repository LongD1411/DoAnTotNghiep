import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import CustomerLayout from '../../components/customer/CustomerLayout';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import { getProductById, getAllProducts } from '../../services/productService';
import { getReviews } from '../../services/reviewService';
import { useCartStore } from '../../store/useCartStore';
import { toastService, errMsg } from '../../services/toastService';

const fmt = (n) =>
  n != null ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n) : '—';

const stripHtml = (html) => {
  const d = document.createElement('div');
  d.innerHTML = html || '';
  return (d.textContent || '').trim();
};

const initials = (name = '') =>
  name.trim().split(/\s+/).slice(-2).map(w => w[0]).join('').toUpperCase() || '?';

const AVATAR_COLORS = ['bg-indigo-100 text-indigo-700', 'bg-pink-100 text-pink-700', 'bg-sky-100 text-sky-700', 'bg-amber-100 text-amber-700', 'bg-emerald-100 text-emerald-700'];
const avatarColor = (id = 0) => AVATAR_COLORS[id % AVATAR_COLORS.length];

const fmtDate = (iso) => (iso ? new Date(iso).toLocaleDateString('vi-VN') : '');

const StarRow = ({ rating, size = 20 }) => {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <div className="flex items-center gap-0.5 text-yellow-400">
      {Array.from({ length: 5 }, (_, i) => {
        const filled = i < full || (i === full && half);
        return (
          <span
            key={i}
            className="material-symbols-outlined"
            style={{ fontSize: size, fontVariationSettings: filled ? "'FILL' 1" : "'FILL' 0" }}
          >
            {i === full && half ? 'star_half' : 'star'}
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

// Mức độ nguy hiểm → màu hộp cảnh báo (NONE = ẩn hộp)
const HAZARD_STYLE = {
  TRUNG_BINH: { box: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800/40', icon: 'text-yellow-600 dark:text-yellow-400', text: 'text-yellow-800 dark:text-yellow-200', name: 'warning',   label: 'Lưu ý an toàn'   },
  NANG:       { box: 'bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-800/50', icon: 'text-orange-600 dark:text-orange-400', text: 'text-orange-800 dark:text-orange-200', name: 'warning',   label: 'Cảnh báo an toàn' },
  NGUY_HIEM:  { box: 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-800/50',             icon: 'text-red-600 dark:text-red-400',       text: 'text-red-800 dark:text-red-200',       name: 'dangerous', label: 'NGUY HIỂM'        },
};

// Vận chuyển & Đổi trả — nội dung CỐ ĐỊNH (fix cứng, không lấy từ sản phẩm). Sửa tại đây.
const SHIPPING_RETURN = {
  intro: 'Đơn hàng được xử lý trong vòng 1–2 ngày làm việc sau khi thanh toán thành công.',
  items: [
    'Giao hàng tiêu chuẩn: 3–5 ngày làm việc.',
    'Giao hàng nhanh (hỏa tốc): 1–2 ngày làm việc (chỉ áp dụng nội thành).',
    'Miễn phí vận chuyển cho đơn hàng từ 500.000đ.',
    'Đổi trả miễn phí trong 7 ngày nếu sản phẩm lỗi hoặc sai hàng.',
    'Không nhận đổi trả đối với sản phẩm đã mở seal hoặc sử dụng.',
  ],
};

const ProductDetailPage = () => {
  const { slug } = useParams();

  const [product, setProduct]   = useState(null);
  const [related, setRelated]   = useState([]);
  const [reviews, setReviews]   = useState([]);
  const [summary, setSummary]   = useState({ average: 0, total: 0, distribution: [0, 0, 0, 0, 0] });
  const [loading, setLoading]   = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty]             = useState(1);
  const [activeTab, setActiveTab] = useState('desc');

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    setActiveImg(0);
    setQty(1);
    getProductById(slug)
      .then(res => {
        const p = res.data.data;
        setProduct(p);
        // Reviews + summary
        getReviews(p.id, { limit: 20 })
          .then(r => { setReviews(r.data.data.data); setSummary(r.data.data.summary); })
          .catch(() => {});
        // Sản phẩm liên quan (cùng danh mục)
        getAllProducts({ limit: 100 })
          .then(r => {
            const all = r.data.data.data;
            setRelated(all.filter(x => x.category?.slug === p.category?.slug && x.id !== p.id).slice(0, 4));
          })
          .catch(() => {});
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <CustomerLayout>
        <LoadingOverlay visible={true} />
        <div className="min-h-[60vh]" />
      </CustomerLayout>
    );
  }

  if (notFound || !product) {
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

  const images = (product.images?.length ? product.images.map(i => i.url) : (product.image_url ? [product.image_url] : []));
  const discountPct = product.discount_price
    ? Math.round((1 - product.discount_price / product.price) * 100)
    : null;
  const hz = HAZARD_STYLE[product.hazard_level];

  return (
    <CustomerLayout>
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
        <div className="grid grid-cols-1 lg:grid-cols-[520px_1fr] gap-8 lg:gap-10">

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
              {images.length > 0 ? (
                <div
                  className="w-full h-full bg-center bg-cover transition-transform duration-500 group-hover:scale-105"
                  style={{ backgroundImage: `url(${images[activeImg]})` }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <span className="material-symbols-outlined text-[64px]">inventory_2</span>
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`aspect-square rounded-xl border-2 overflow-hidden transition-colors ${
                      activeImg === i
                        ? 'border-primary'
                        : 'border-[#d3e7cf] dark:border-[#2a4524] hover:border-primary/50'
                    }`}
                  >
                    <div className="w-full h-full bg-center bg-cover" style={{ backgroundImage: `url(${img})` }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product info */}
          <div className="flex flex-col gap-5">
            {/* Rating */}
            <div className="flex items-center gap-2">
              <StarRow rating={summary.average} />
              <span className="text-sm font-medium text-[#599a4c]">
                ({summary.total} đánh giá)
              </span>
            </div>

            {/* Name + quick desc */}
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[#101b0d] dark:text-white">
                {product.name}
              </h1>
              <p className="text-sm font-semibold text-[#599a4c] uppercase tracking-wider">{product.category?.name}</p>
              <p className="text-base leading-relaxed text-gray-600 dark:text-gray-300 mt-1 line-clamp-3">{stripHtml(product.description)}</p>
            </div>

            <div className="h-px bg-[#e9f3e7] dark:bg-white/10" />

            {/* Price + stock */}
            <div className="flex items-end gap-3 flex-wrap">
              <span className={`mb-1 mr-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                product.stock > 0
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                  : 'bg-red-100 text-red-700'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                {product.stock > 0 ? `Còn ${product.stock} ${product.unit ?? ''}` : 'Hết hàng'}
              </span>
              {product.discount_price ? (
                <>
                  <span className="text-xl text-gray-400 line-through mb-1">{fmt(product.price)}</span>
                  <span className="text-4xl font-bold text-[#101b0d] dark:text-white">{fmt(product.discount_price)}</span>
                </>
              ) : (
                <span className="text-4xl font-bold text-[#101b0d] dark:text-white">{fmt(product.price)}</span>
              )}
            </div>

            {/* Qty + actions */}
            <div className="flex items-center justify-end gap-3 pt-2 flex-wrap">
              <div className="flex items-center rounded-xl border border-[#d3e7cf] dark:border-[#3a5c35] bg-white dark:bg-[#1c3019] w-fit">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="p-3 hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-[20px]">remove</span>
                </button>
                <span className="w-10 text-center font-bold text-[#101b0d] dark:text-white select-none">{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stock || 1, q + 1))} className="p-3 hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-[20px]">add</span>
                </button>
              </div>
              <button
                disabled={product.stock === 0}
                onClick={async () => {
                  try {
                    await useCartStore.getState().addItem(product, qty);
                    toastService.success(`Đã thêm ${qty} sản phẩm vào giỏ hàng`);
                  } catch (err) {
                    toastService.error(errMsg(err));
                  }
                }}
                className="bg-primary hover:bg-[#3ed622] text-[#101b0d] font-bold py-3 px-5 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined">shopping_bag</span>
                Thêm vào giỏ
              </button>
            </div>

            {/* Safety notice (theo mức độ nguy hiểm) */}
            {hz && product.safety_note && (
              <div className={`p-4 rounded-xl border flex gap-3 items-start ${hz.box}`}>
                <span className={`material-symbols-outlined shrink-0 text-[22px] ${hz.icon}`}>{hz.name}</span>
                <div className={`text-sm ${hz.text}`}>
                  <span className="font-bold block mb-1">{hz.label}</span>
                  <div className="rich-prose" dangerouslySetInnerHTML={{ __html: product.safety_note }} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Tabs ─────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-6">
          <div className="border-b border-[#e9f3e7] dark:border-white/10">
            <nav className="flex flex-wrap gap-0 -mb-px">
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

          <div>
            <div className="text-gray-600 dark:text-gray-300 leading-relaxed flex flex-col gap-4">
              {activeTab === 'desc' && (
                product.description
                  ? <div className="rich-prose" dangerouslySetInnerHTML={{ __html: product.description }} />
                  : <p className="text-gray-400">Chưa có mô tả.</p>
              )}
              {activeTab === 'specs' && (
                product.specifications
                  ? <div className="rich-prose" dangerouslySetInnerHTML={{ __html: product.specifications }} />
                  : <p className="text-gray-400">Chưa có thông số kỹ thuật.</p>
              )}
              {activeTab === 'safety' && (
                <>
                  <p>Luôn đọc kỹ nhãn sản phẩm trước khi sử dụng. Tuân thủ đúng liều lượng và thời gian cách ly khuyến cáo. Bảo quản sản phẩm trong bao bì gốc, tránh xa tầm tay trẻ em.</p>
                  <p>Trường hợp bị nhiễm: rửa da và mắt bằng nhiều nước sạch ít nhất 15 phút. Nếu nuốt phải: không gây nôn, đến cơ sở y tế ngay và mang theo nhãn sản phẩm.</p>
                </>
              )}
              {activeTab === 'shipping' && (
                <>
                  <p>{SHIPPING_RETURN.intro}</p>
                  <ul className="list-disc pl-5 flex flex-col gap-2 text-sm">
                    {SHIPPING_RETURN.items.map((t, i) => <li key={i}>{t}</li>)}
                  </ul>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── Video Tutorial (nếu có video_url) ─────────────────────── */}
        {product.video_url && (
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
                  Xem hướng dẫn chi tiết về tỷ lệ pha chế, thời điểm và kỹ thuật sử dụng để đạt hiệu quả tối đa và an toàn.
                </p>
              </div>
              <div className="relative aspect-video rounded-xl overflow-hidden shadow-lg bg-[#132210]">
                <iframe
                  src={product.video_url}
                  title="Video hướng dẫn"
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </section>
        )}

        {/* ── Reviews ──────────────────────────────────────────────── */}
        <section className="flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-[#101b0d] dark:text-white">Đánh giá khách hàng</h2>
          </div>

          <div className="grid lg:grid-cols-12 gap-10">
            {/* Rating summary */}
            <div className="lg:col-span-4">
              <div className="bg-white dark:bg-[#132210] p-6 rounded-xl border border-[#d3e7cf] dark:border-[#2a4524]">
                <div className="flex items-end gap-4 mb-5">
                  <span className="text-6xl font-bold text-[#101b0d] dark:text-white">{summary.average}</span>
                  <div className="mb-2">
                    <StarRow rating={summary.average} size={18} />
                    <span className="text-sm text-gray-400 mt-1 block">{summary.total} đánh giá</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {(summary.distribution ?? [0, 0, 0, 0, 0]).map((pct, i) => (
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
              {reviews.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center gap-2 text-gray-400">
                  <span className="material-symbols-outlined text-[40px]">reviews</span>
                  <p className="text-sm">Chưa có đánh giá nào cho sản phẩm này.</p>
                </div>
              ) : reviews.map(r => (
                <article key={r.id} className="p-5 bg-white dark:bg-[#132210] rounded-xl border border-[#d3e7cf] dark:border-[#2a4524]">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex gap-3">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${avatarColor(r.user?.id ?? r.id)}`}>
                        {initials(r.user?.name)}
                      </div>
                      <div>
                        <h4 className="font-bold text-[#101b0d] dark:text-white text-sm">{r.user?.name ?? 'Ẩn danh'}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <StarRow rating={r.rating} size={14} />
                          <span className="text-xs text-gray-400">{fmtDate(r.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    {r.verified_purchase && (
                      <span className="text-xs font-semibold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-lg shrink-0">
                        Đã mua hàng
                      </span>
                    )}
                  </div>
                  {r.comment && <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{r.comment}</p>}
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── Related ──────────────────────────────────────────────── */}
        {related.length > 0 && (
          <section className="flex flex-col gap-6">
            <h2 className="text-2xl font-bold text-[#101b0d] dark:text-white">Sản phẩm liên quan</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map(p => {
                const dp = p.discount_price ? Math.round((1 - p.discount_price / p.price) * 100) : null;
                return (
                  <Link
                    key={p.id}
                    to={`/san-pham/${p.slug}`}
                    className="group flex flex-col rounded-xl border border-[#d3e7cf] dark:border-[#2a4524] bg-white dark:bg-[#132210] overflow-hidden hover:shadow-md transition-all"
                  >
                    <div className="relative aspect-square overflow-hidden bg-[#f6f8f6] dark:bg-[#2a3e25]">
                      {p.image_url ? (
                        <div className="w-full h-full bg-center bg-cover group-hover:scale-105 transition-transform duration-500" style={{ backgroundImage: `url(${p.image_url})` }} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <span className="material-symbols-outlined text-[40px]">inventory_2</span>
                        </div>
                      )}
                      {dp && (
                        <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded">-{dp}%</span>
                      )}
                    </div>
                    <div className="p-3 flex flex-col gap-1">
                      <p className="text-xs font-semibold text-[#599a4c] uppercase tracking-wider">{p.category?.name}</p>
                      <h3 className="text-sm font-bold text-[#101b0d] dark:text-white line-clamp-2 leading-snug">{p.name}</h3>
                      <span className="text-sm font-bold text-[#2E7D32] dark:text-primary mt-auto">{fmt(p.discount_price ?? p.price)}</span>
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
