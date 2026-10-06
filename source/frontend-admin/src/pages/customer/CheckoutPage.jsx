import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CustomerLayout from '../../components/customer/CustomerLayout';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import { useCartStore } from '../../store/useCartStore';
import { getProfile } from '../../services/authService';
import { createOrder } from '../../services/orderService';
import { toastService, errMsg } from '../../services/toastService';
import { productImage } from '../../utils/productImage';

const fmt = (n) =>
  n != null ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n) : '—';

const unitPrice = (p) => p?.discount_price ?? p?.price ?? 0;

// Phí ship phẳng, miễn phí khi đạt ngưỡng (hiển thị phía client — backend tự tính lại khi tạo đơn)
const SHIPPING_FEE = 30000;
const FREE_SHIP_THRESHOLD = 500000;

const PAYMENT_METHODS = [
  { value: 'cod',           label: 'Thanh toán khi nhận hàng (COD)', desc: 'Trả tiền mặt cho shipper khi nhận hàng.', icon: 'local_shipping' },
  { value: 'bank_transfer', label: 'Chuyển khoản ngân hàng',         desc: 'Chuyển khoản trực tiếp vào tài khoản của cửa hàng.', icon: 'account_balance' },
  { value: 'vnpay',         label: 'Thanh toán online (VNPay)',      desc: 'Thanh toán an toàn qua cổng VNPay bằng thẻ/ví.', icon: 'credit_card', disabled: true },
];

const INPUT_CLS =
  'w-full rounded-lg border px-4 py-3 text-base text-[#101b0d] dark:text-white bg-[#f9fcf8] dark:bg-[#1c3019] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors';
const border = (err) => (err ? 'border-red-400' : 'border-[#d3e7cf] dark:border-[#3a5c35]');

// Các field bắt buộc (ward/note không bắt buộc)
const REQUIRED = ['fullName', 'phone', 'city', 'district', 'street'];

const CheckoutPage = () => {
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);

  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);

  const [form, setForm] = useState({
    fullName: '', phone: '', email: '',
    city: '', district: '', ward: '', street: '', note: '',
  });
  const [errors, setErrors] = useState({});
  const [payment, setPayment] = useState('cod');
  const [discount, setDiscount] = useState('');

  // Prefill họ tên / SĐT / email từ hồ sơ (trang nằm sau PrivateRoute nên luôn đã đăng nhập)
  useEffect(() => {
    getProfile()
      .then((res) => {
        const p = res.data.data;
        setForm((prev) => ({ ...prev, fullName: p.name ?? '', phone: p.phone ?? '', email: p.email ?? '' }));
      })
      .catch(() => { /* lỗi nạp hồ sơ — vẫn cho nhập tay */ })
      .finally(() => setLoading(false));
  }, []);

  // ── Tính tiền ────────────────────────────────────────────────────────────────
  const subtotal = items.reduce((s, i) => s + unitPrice(i.product) * i.quantity, 0);
  const saving = items.reduce((s, i) => {
    const p = i.product;
    return p?.discount_price ? s + (p.price - p.discount_price) * i.quantity : s;
  }, 0);
  const shippingFee = items.length === 0 ? 0 : subtotal >= FREE_SHIP_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = subtotal + shippingFee;
  const totalQty = items.reduce((s, i) => s + i.quantity, 0);

  // ── Validate (onChange) ────────────────────────────────────────────────────
  const validate = (field, value) => {
    const next = { ...errors };
    switch (field) {
      case 'fullName':
        if (!value.trim()) next.fullName = 'Vui lòng nhập họ tên người nhận';
        else if (value.trim().length > 50) next.fullName = 'Họ tên tối đa 50 ký tự';
        else delete next.fullName;
        break;
      case 'phone':
        if (!value.trim()) next.phone = 'Vui lòng nhập số điện thoại';
        else if (!/^\d{8,15}$/.test(value.trim())) next.phone = 'Số điện thoại 8–15 chữ số';
        else delete next.phone;
        break;
      case 'city':
        if (!value.trim()) next.city = 'Vui lòng nhập tỉnh/thành phố';
        else delete next.city;
        break;
      case 'district':
        if (!value.trim()) next.district = 'Vui lòng nhập quận/huyện';
        else delete next.district;
        break;
      case 'street':
        if (!value.trim()) next.street = 'Vui lòng nhập địa chỉ cụ thể';
        else delete next.street;
        break;
      default:
        break;
    }
    setErrors(next);
    return !next[field];
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (REQUIRED.includes(name)) validate(name, value);
  };

  const handleApplyDiscount = () => {
    toastService.info('Tính năng mã giảm giá sắp ra mắt');
  };

  // ── Đặt hàng ───────────────────────────────────────────────────────────────
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!items.length) {
      toastService.warning('Giỏ hàng của bạn đang trống');
      return;
    }
    const allValid = REQUIRED.every((f) => validate(f, form[f]));
    if (!allValid) {
      toastService.error('Vui lòng điền đầy đủ thông tin giao hàng');
      return;
    }

    setPlacing(true);
    try {
      await createOrder({
        address: {
          fullName: form.fullName.trim(),
          phone: form.phone.trim(),
          street: form.street.trim(),
          ward: form.ward.trim() || null,
          district: form.district.trim(),
          city: form.city.trim(),
        },
        paymentMethod: payment,
        note: form.note.trim() || null,
        shippingFee,
      });
      // Đơn đã tạo & giỏ server đã bị xoá phía backend → đồng bộ giỏ client về rỗng
      useCartStore.setState({ items: [] });
      toastService.success('Đặt hàng thành công! Cảm ơn bạn đã mua sắm.');
      navigate('/trang-chu');
    } catch (err) {
      toastService.error(errMsg(err));
    } finally {
      setPlacing(false);
    }
  };

  const formValid = REQUIRED.every((f) => form[f]?.trim()) && Object.keys(errors).length === 0;

  return (
    <CustomerLayout>
      <LoadingOverlay visible={loading || placing} />

      <div className="w-full px-4 md:px-10 lg:px-20 xl:px-40 py-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-6 flex-wrap">
          <Link to="/trang-chu" className="text-[#599a4c] hover:text-primary font-medium transition-colors">Trang chủ</Link>
          <span className="text-[#599a4c]">/</span>
          <Link to="/gio-hang" className="text-[#599a4c] hover:text-primary font-medium transition-colors">Giỏ hàng</Link>
          <span className="text-[#599a4c]">/</span>
          <span className="text-[#101b0d] dark:text-white font-medium">Thanh toán</span>
        </nav>

        {/* ── Stepper ──────────────────────────────────────────────────── */}
        <div className="mb-8 flex justify-center">
          <nav className="flex items-center gap-2 md:gap-4 text-sm font-medium">
            <span className="flex items-center gap-2 text-[#2E7D32] dark:text-primary">
              <span className="flex items-center justify-center size-6 rounded-full bg-primary/20 text-[#2E7D32] dark:text-primary">
                <span className="material-symbols-outlined text-[16px] leading-none">check</span>
              </span>
              Giỏ hàng
            </span>
            <span className="text-gray-400">/</span>
            <span className="flex items-center gap-2 text-[#101b0d] dark:text-white">
              <span className="flex items-center justify-center size-6 rounded-full bg-primary text-[#101b0d] text-xs font-bold shadow-md shadow-primary/30">2</span>
              Giao hàng &amp; Thanh toán
            </span>
            <span className="text-gray-400">/</span>
            <span className="flex items-center gap-2 text-gray-400">
              <span className="flex items-center justify-center size-6 rounded-full border border-[#d3e7cf] dark:border-[#3a5c35] text-gray-400 text-xs">3</span>
              Hoàn tất
            </span>
          </nav>
        </div>

        {/* Title */}
        <div className="flex items-center gap-3 mb-6">
          <span className="material-symbols-outlined text-[#2E7D32] dark:text-primary text-3xl">lock</span>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-[#101b0d] dark:text-white">Thanh toán an toàn</h1>
        </div>

        {items.length === 0 ? (
          /* ── Empty state ─────────────────────────────────────────────── */
          <div className="bg-white dark:bg-[#132210] rounded-xl border border-gray-200 dark:border-[#2a4524] py-20 flex flex-col items-center gap-4 text-center">
            <span className="material-symbols-outlined text-[64px] text-gray-300">production_quantity_limits</span>
            <p className="text-gray-500 text-base">Giỏ hàng trống nên chưa thể thanh toán.</p>
            <Link
              to="/san-pham"
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-primary hover:bg-[#3ed622] text-[#101b0d] font-bold transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">storefront</span>
              Tiếp tục mua sắm
            </Link>
          </div>
        ) : (
          <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* ── Cột trái: biểu mẫu ──────────────────────────────────────── */}
            <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6">

              {/* Thông tin liên hệ */}
              <section className="bg-white dark:bg-[#132210] rounded-xl border border-gray-200 dark:border-[#2a4524] p-6">
                <h3 className="text-lg font-bold text-[#101b0d] dark:text-white mb-4">1. Thông tin liên hệ</h3>
                <div className="flex flex-col gap-1.5">
                  <label className="text-base font-semibold text-[#101b0d] dark:text-white">Email</label>
                  <input
                    type="email" value={form.email} disabled
                    className={`${INPUT_CLS} border-[#d3e7cf] dark:border-[#3a5c35] opacity-60 cursor-not-allowed`}
                  />
                  <p className="text-sm text-gray-400">Email tài khoản của bạn — biên nhận đơn hàng sẽ gửi tới đây.</p>
                </div>
              </section>

              {/* Địa chỉ giao hàng */}
              <section className="bg-white dark:bg-[#132210] rounded-xl border border-gray-200 dark:border-[#2a4524] p-6">
                <h3 className="text-lg font-bold text-[#101b0d] dark:text-white mb-6">2. Địa chỉ giao hàng</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="fullName" className="text-base font-semibold text-[#101b0d] dark:text-white">Họ và tên người nhận <span className="text-red-500">*</span></label>
                    <input id="fullName" name="fullName" type="text" maxLength={50} placeholder="Nguyễn Văn A"
                      value={form.fullName} onChange={handleChange} className={`${INPUT_CLS} ${border(errors.fullName)}`} />
                    {errors.fullName && <p className="text-sm text-red-500">{errors.fullName}</p>}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="phone" className="text-base font-semibold text-[#101b0d] dark:text-white">Số điện thoại <span className="text-red-500">*</span></label>
                    <input id="phone" name="phone" type="tel" maxLength={15} placeholder="0901234567"
                      value={form.phone} onChange={handleChange} className={`${INPUT_CLS} ${border(errors.phone)}`} />
                    {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="city" className="text-base font-semibold text-[#101b0d] dark:text-white">Tỉnh/Thành phố <span className="text-red-500">*</span></label>
                    <input id="city" name="city" type="text" placeholder="VD: Hà Nội"
                      value={form.city} onChange={handleChange} className={`${INPUT_CLS} ${border(errors.city)}`} />
                    {errors.city && <p className="text-sm text-red-500">{errors.city}</p>}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="district" className="text-base font-semibold text-[#101b0d] dark:text-white">Quận/Huyện <span className="text-red-500">*</span></label>
                    <input id="district" name="district" type="text" placeholder="VD: Cầu Giấy"
                      value={form.district} onChange={handleChange} className={`${INPUT_CLS} ${border(errors.district)}`} />
                    {errors.district && <p className="text-sm text-red-500">{errors.district}</p>}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="ward" className="text-base font-semibold text-[#101b0d] dark:text-white">Phường/Xã <span className="text-gray-400 font-normal">(tùy chọn)</span></label>
                    <input id="ward" name="ward" type="text" placeholder="VD: Dịch Vọng"
                      value={form.ward} onChange={handleChange} className={`${INPUT_CLS} ${border(errors.ward)}`} />
                  </div>
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label htmlFor="street" className="text-base font-semibold text-[#101b0d] dark:text-white">Địa chỉ cụ thể <span className="text-red-500">*</span></label>
                    <input id="street" name="street" type="text" placeholder="Số nhà, tên đường"
                      value={form.street} onChange={handleChange} className={`${INPUT_CLS} ${border(errors.street)}`} />
                    {errors.street && <p className="text-sm text-red-500">{errors.street}</p>}
                  </div>
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label htmlFor="note" className="text-base font-semibold text-[#101b0d] dark:text-white">Ghi chú <span className="text-gray-400 font-normal">(tùy chọn)</span></label>
                    <textarea id="note" name="note" rows={3} placeholder="Ghi chú cho người giao hàng..."
                      value={form.note} onChange={handleChange} className={`${INPUT_CLS} ${border(errors.note)} resize-none`} />
                  </div>
                </div>
              </section>

              {/* Phương thức thanh toán */}
              <section className="bg-white dark:bg-[#132210] rounded-xl border border-gray-200 dark:border-[#2a4524] p-6">
                <h3 className="text-lg font-bold text-[#101b0d] dark:text-white mb-6">3. Phương thức thanh toán</h3>
                <div className="flex flex-col gap-4">
                  {PAYMENT_METHODS.map((m) => {
                    const active = payment === m.value;
                    const disabled = !!m.disabled;
                    return (
                      <label
                        key={m.value}
                        className={`relative flex items-start gap-4 rounded-lg border p-4 transition-colors ${
                          disabled
                            ? 'cursor-not-allowed opacity-60 border-[#d3e7cf] dark:border-[#3a5c35] bg-gray-50 dark:bg-white/5'
                            : active
                              ? 'cursor-pointer border-[#2E7D32] dark:border-primary bg-[#e9f3e7] dark:bg-primary/10'
                              : 'cursor-pointer border-[#d3e7cf] dark:border-[#3a5c35] bg-white dark:bg-white/5 hover:border-[#2E7D32]/50'
                        }`}
                      >
                        <input type="radio" name="payment" value={m.value} checked={active} disabled={disabled}
                          onChange={() => !disabled && setPayment(m.value)} className="sr-only" />
                        <span className={`material-symbols-outlined mt-0.5 ${active ? 'text-[#2E7D32] dark:text-primary' : 'text-gray-400'}`}>{m.icon}</span>
                        <span className="flex flex-col flex-1">
                          <span className="text-base font-bold text-[#101b0d] dark:text-white flex items-center gap-2 flex-wrap">
                            {m.label}
                            {disabled && (
                              <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 border border-gray-300 dark:border-white/20 rounded-full px-2 py-0.5">
                                Sắp ra mắt
                              </span>
                            )}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{m.desc}</span>
                        </span>
                        <span className={`material-symbols-outlined ${active ? 'text-[#2E7D32] dark:text-primary' : 'text-gray-300'}`}>
                          {active ? 'check_circle' : 'radio_button_unchecked'}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </section>
            </div>

            {/* ── Cột phải: tóm tắt đơn hàng ──────────────────────────────── */}
            <aside className="lg:col-span-5 xl:col-span-4 w-full lg:sticky lg:top-24 flex flex-col gap-6">
              <div className="bg-white dark:bg-[#132210] rounded-xl border border-gray-200 dark:border-[#2a4524] p-6 flex flex-col gap-5">
                <h3 className="text-lg font-bold text-[#101b0d] dark:text-white pb-4 border-b border-gray-100 dark:border-white/10">
                  Tóm tắt đơn hàng
                </h3>

                {/* Danh sách sản phẩm */}
                <div className="flex flex-col gap-4 max-h-[300px] overflow-y-auto pr-1">
                  {items.map((item) => {
                    const p = item.product ?? {};
                    const img = productImage(p);
                    return (
                      <div key={item.product_id} className="flex gap-3">
                        <div
                          className="relative size-16 shrink-0 rounded-md bg-[#e9f3e7] dark:bg-white/10 bg-cover bg-center flex items-center justify-center border border-[#d3e7cf] dark:border-[#3a5c35]"
                          style={img ? { backgroundImage: `url("${img}")` } : {}}
                        >
                          {!img && <span className="material-symbols-outlined text-2xl text-[#d3e7cf]">eco</span>}
                          <span className="absolute top-0 right-0 min-w-[20px] h-5 px-1 rounded-full bg-[#2E7D32] text-white text-[11px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-[#132210]">
                            {item.quantity}
                          </span>
                        </div>
                        <div className="flex flex-1 flex-col justify-center min-w-0">
                          <h4 className="text-sm font-bold text-[#101b0d] dark:text-white line-clamp-2 leading-tight">
                            {p.name ?? `Sản phẩm #${item.product_id}`}
                          </h4>
                          <p className="text-xs text-gray-400 mt-1">{fmt(unitPrice(p))}{p.unit ? ` / ${p.unit}` : ''}</p>
                        </div>
                        <p className="text-sm font-bold text-[#101b0d] dark:text-white whitespace-nowrap self-center">
                          {fmt(unitPrice(p) * item.quantity)}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Mã giảm giá */}
                <div className="flex gap-2">
                  <input
                    type="text" value={discount} onChange={(e) => setDiscount(e.target.value)}
                    placeholder="Mã giảm giá"
                    className="flex-1 rounded-lg border border-[#d3e7cf] dark:border-[#3a5c35] bg-[#f9fcf8] dark:bg-[#1c3019] px-3 py-2 text-sm text-[#101b0d] dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors"
                  />
                  <button
                    type="button" onClick={handleApplyDiscount}
                    className="rounded-lg px-4 py-2 text-sm font-bold bg-[#e9f3e7] dark:bg-white/10 text-[#2E7D32] dark:text-primary hover:bg-[#2E7D32] hover:text-white dark:hover:bg-[#2E7D32] transition-colors"
                  >
                    Áp dụng
                  </button>
                </div>

                {/* Tính tiền */}
                <div className="flex flex-col gap-3 border-t border-gray-100 dark:border-white/10 pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Tạm tính ({totalQty} sản phẩm)</span>
                    <span className="font-semibold text-[#101b0d] dark:text-white">{fmt(subtotal)}</span>
                  </div>
                  {saving > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Tiết kiệm</span>
                      <span className="font-semibold text-[#2E7D32] dark:text-primary">-{fmt(saving)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Phí vận chuyển</span>
                    {shippingFee === 0
                      ? <span className="font-semibold text-[#2E7D32] dark:text-primary">Miễn phí</span>
                      : <span className="font-semibold text-[#101b0d] dark:text-white">{fmt(shippingFee)}</span>}
                  </div>
                  {shippingFee > 0 && (
                    <p className="text-xs text-gray-400">Mua thêm {fmt(FREE_SHIP_THRESHOLD - subtotal)} để được miễn phí vận chuyển.</p>
                  )}
                </div>

                {/* Tổng cộng */}
                <div className="flex justify-between items-center border-t border-gray-100 dark:border-white/10 pt-4">
                  <span className="text-base font-bold text-[#101b0d] dark:text-white">Tổng cộng</span>
                  <span className="text-2xl font-black text-[#2E7D32] dark:text-primary">{fmt(total)}</span>
                </div>

                {/* CTA */}
                <button
                  type="submit" disabled={placing || !formValid}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-lg bg-primary hover:bg-[#3ed622] text-[#101b0d] font-bold text-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {placing
                    ? <span className="size-5 border-2 border-[#101b0d]/30 border-t-[#101b0d] rounded-full animate-spin" />
                    : <span className="material-symbols-outlined">shopping_cart_checkout</span>}
                  Đặt hàng
                </button>

                {/* Trust badges */}
                <div className="flex justify-center gap-4 text-gray-400">
                  <span className="flex items-center gap-1 text-[11px]"><span className="material-symbols-outlined text-base">lock</span>Bảo mật SSL</span>
                  <span className="flex items-center gap-1 text-[11px]"><span className="material-symbols-outlined text-base">verified_user</span>Hoàn tiền nếu lỗi</span>
                </div>
              </div>

              {/* Hỗ trợ */}
              <div className="bg-primary/5 dark:bg-primary/10 rounded-xl p-4 border border-primary/20 flex items-start gap-3">
                <span className="material-symbols-outlined text-[#2E7D32] dark:text-primary mt-0.5">support_agent</span>
                <div>
                  <h4 className="text-sm font-bold text-[#101b0d] dark:text-white">Cần hỗ trợ?</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Liên hệ <a href="#" className="underline hover:text-[#2E7D32] dark:hover:text-primary">hotro@nongnghiepxanh.vn</a> hoặc gọi 1900 1234.
                  </p>
                </div>
              </div>
            </aside>
          </form>
        )}
      </div>
    </CustomerLayout>
  );
};

export default CheckoutPage;
