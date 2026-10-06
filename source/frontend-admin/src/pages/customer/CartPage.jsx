import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CustomerLayout from '../../components/customer/CustomerLayout';
import { useCartStore } from '../../store/useCartStore';
import { getCurrentUser } from '../../services/authService';
import { toastService, errMsg } from '../../services/toastService';
import { productImage } from '../../utils/productImage';

const fmt = (n) =>
  n != null ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n) : '—';

const unitPrice = (p) => p?.discount_price ?? p?.price ?? 0;

const CartPage = () => {
  const navigate = useNavigate();
  const items      = useCartStore(s => s.items);
  const updateQty  = useCartStore(s => s.updateQty);
  const removeItem = useCartStore(s => s.removeItem);
  const [busyId, setBusyId] = useState(null); // product_id đang chờ API (disable stepper)

  const isAuthed = !!getCurrentUser();

  // Tổng tiền theo giá hiện hành; tiết kiệm = phần chênh của các sản phẩm có giảm giá
  const total  = items.reduce((sum, i) => sum + unitPrice(i.product) * i.quantity, 0);
  const saving = items.reduce((sum, i) => {
    const p = i.product;
    return p?.discount_price ? sum + (p.price - p.discount_price) * i.quantity : sum;
  }, 0);

  const handleQty = async (item, next) => {
    const stock = item.product?.stock ?? Infinity;
    const qty = Math.min(Math.max(1, next), stock);
    if (qty === item.quantity) return;
    setBusyId(item.product_id);
    try {
      await updateQty(item.product_id, qty);
    } catch (err) {
      toastService.error(errMsg(err));
    } finally {
      setBusyId(null);
    }
  };

  const handleRemove = async (item) => {
    setBusyId(item.product_id);
    try {
      await removeItem(item.product_id);
      toastService.success('Đã xóa sản phẩm khỏi giỏ');
    } catch (err) {
      toastService.error(errMsg(err));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <CustomerLayout>
      <div className="w-full px-4 md:px-10 lg:px-20 xl:px-40 py-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-6 flex-wrap">
          <Link to="/trang-chu" className="text-[#599a4c] hover:text-primary font-medium transition-colors">Trang chủ</Link>
          <span className="text-[#599a4c]">/</span>
          <span className="text-[#101b0d] dark:text-white font-medium">Giỏ hàng</span>
        </nav>

        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-[#101b0d] dark:text-white mb-6">
          Giỏ hàng của bạn
        </h1>

        {items.length === 0 ? (
          /* ── Empty state ─────────────────────────────────────────────── */
          <div className="bg-white dark:bg-[#132210] rounded-xl border border-gray-200 dark:border-[#2a4524] py-20 flex flex-col items-center gap-4 text-center">
            <span className="material-symbols-outlined text-[64px] text-gray-300">production_quantity_limits</span>
            <p className="text-gray-500 text-base">Giỏ hàng của bạn đang trống.</p>
            <Link
              to="/san-pham"
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-primary hover:bg-[#3ed622] text-[#101b0d] font-bold transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">storefront</span>
              Tiếp tục mua sắm
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 items-start">

            {/* ── Danh sách sản phẩm ─────────────────────────────────────── */}
            <div className="flex-1 min-w-0 w-full flex flex-col gap-3">
              {items.map(item => {
                const p = item.product ?? {};
                const img = productImage(p);
                const busy = busyId === item.product_id;
                return (
                  <div key={item.product_id} className="bg-white dark:bg-[#132210] rounded-xl border border-gray-200 dark:border-[#2a4524] p-4 flex gap-4 items-center flex-wrap sm:flex-nowrap">
                    {/* Ảnh */}
                    <Link
                      to={p.slug ? `/san-pham/${p.slug}` : '#'}
                      className="size-20 rounded-lg bg-[#e9f3e7] dark:bg-white/10 bg-cover bg-center shrink-0 flex items-center justify-center"
                      style={img ? { backgroundImage: `url("${img}")` } : {}}
                    >
                      {!img && <span className="material-symbols-outlined text-3xl text-[#d3e7cf]">eco</span>}
                    </Link>

                    {/* Tên + giá đơn vị */}
                    <div className="flex-1 min-w-0">
                      <Link to={p.slug ? `/san-pham/${p.slug}` : '#'} className="text-lg font-bold text-[#101b0d] dark:text-white hover:text-[#2E7D32] dark:hover:text-primary transition-colors leading-tight line-clamp-2">
                        {p.name ?? `Sản phẩm #${item.product_id}`}
                      </Link>
                      <div className="flex items-center gap-2 mt-1">
                        {p.discount_price ? (
                          <>
                            <span className="text-xs text-gray-400 line-through">{fmt(p.price)}</span>
                            <span className="text-base font-bold text-[#2E7D32] dark:text-primary">{fmt(p.discount_price)}</span>
                          </>
                        ) : (
                          <span className="text-base font-bold text-[#2E7D32] dark:text-primary">{fmt(p.price)}</span>
                        )}
                        {p.unit && <span className="text-xs text-gray-400">/ {p.unit}</span>}
                      </div>
                      {p.stock != null && item.quantity >= p.stock && (
                        <p className="text-xs text-orange-500 mt-1">Chỉ còn {p.stock} sản phẩm</p>
                      )}
                    </div>

                    {/* Stepper số lượng */}
                    <div className="flex items-center rounded-xl border border-[#d3e7cf] dark:border-[#3a5c35] bg-white dark:bg-[#1c3019] shrink-0">
                      <button
                        onClick={() => handleQty(item, item.quantity - 1)}
                        disabled={busy || item.quantity <= 1}
                        className="p-2.5 hover:text-primary transition-colors disabled:opacity-30"
                      >
                        <span className="material-symbols-outlined text-[18px]">remove</span>
                      </button>
                      <span className="w-9 text-center font-bold text-[#101b0d] dark:text-white select-none">{item.quantity}</span>
                      <button
                        onClick={() => handleQty(item, item.quantity + 1)}
                        disabled={busy || item.quantity >= (p.stock ?? Infinity)}
                        className="p-2.5 hover:text-primary transition-colors disabled:opacity-30"
                      >
                        <span className="material-symbols-outlined text-[18px]">add</span>
                      </button>
                    </div>

                    {/* Thành tiền */}
                    <div className="w-28 text-right shrink-0 hidden sm:block">
                      <p className="text-base font-black text-[#101b0d] dark:text-white">{fmt(unitPrice(p) * item.quantity)}</p>
                    </div>

                    {/* Xoá */}
                    <button
                      onClick={() => handleRemove(item)}
                      disabled={busy}
                      title="Xóa khỏi giỏ"
                      className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors shrink-0 disabled:opacity-40"
                    >
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                  </div>
                );
              })}

              <Link to="/san-pham" className="group/cont inline-flex items-center gap-1.5 text-base font-bold text-[#2E7D32] dark:text-primary mt-2 w-fit">
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                <span className="group-hover/cont:underline">Tiếp tục mua sắm</span>
              </Link>
            </div>

            {/* ── Tóm tắt đơn hàng ───────────────────────────────────────── */}
            <aside className="w-full lg:w-80 shrink-0 lg:sticky lg:top-24">
              <div className="bg-white dark:bg-[#132210] rounded-xl border border-gray-200 dark:border-[#2a4524] p-5 flex flex-col gap-4">
                <h3 className="text-lg font-bold text-[#101b0d] dark:text-white pb-3 border-b border-gray-100 dark:border-white/10">
                  Tóm tắt đơn hàng
                </h3>

                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Tạm tính ({items.reduce((s, i) => s + i.quantity, 0)} sản phẩm)</span>
                    <span className="font-semibold text-[#101b0d] dark:text-white">{fmt(total)}</span>
                  </div>
                  {saving > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Tiết kiệm</span>
                      <span className="font-semibold text-[#2E7D32] dark:text-primary">-{fmt(saving)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Phí vận chuyển</span>
                    <span className="text-gray-400 text-xs italic">Tính ở bước thanh toán</span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-white/10">
                  <span className="text-base font-bold text-[#101b0d] dark:text-white">Tổng cộng</span>
                  <span className="text-2xl font-black text-[#101b0d] dark:text-white">{fmt(total)}</span>
                </div>

                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-primary hover:bg-[#3ed622] text-[#101b0d] font-bold transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">shopping_cart_checkout</span>
                  Tiến hành thanh toán
                </button>

                {!isAuthed && (
                  <p className="text-xs text-gray-400 text-center">
                    <Link to="/dang-nhap" className="text-[#2E7D32] dark:text-primary font-semibold hover:underline">Đăng nhập</Link>
                    {' '}để lưu giỏ hàng và thanh toán nhanh hơn.
                  </p>
                )}
              </div>
            </aside>
          </div>
        )}
      </div>
    </CustomerLayout>
  );
};

export default CartPage;
