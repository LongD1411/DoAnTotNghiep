import { useState, useEffect } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import CustomerLayout from '../../components/customer/CustomerLayout';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import { getOrderById, cancelOrder } from '../../services/orderService';
import { toastService, errMsg } from '../../services/toastService';
import { BANK, vietQrUrl } from '../../config/bank';
import { ORDER_STATUS_LABEL, PAYMENT_METHOD_LABEL } from '../../utils/orderStatus';

const fmt = (n) =>
  n != null ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n) : '—';

const OrderSuccessPage = () => {
  const { id } = useParams();
  const location = useLocation();

  const [order, setOrder] = useState(location.state?.order ?? null);
  const [loading, setLoading] = useState(!location.state?.order);
  const [qrZoom, setQrZoom] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (order) return; // đã có từ state khi vừa đặt hàng → khỏi fetch
    getOrderById(id)
      .then((res) => setOrder(res.data.data))
      .catch((err) => toastService.error(errMsg(err)))
      .finally(() => setLoading(false));
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const copy = (text, label) => {
    navigator.clipboard?.writeText(String(text))
      .then(() => toastService.success(`Đã sao chép ${label}`))
      .catch(() => {});
  };

  const handleCancel = async () => {
    setCancelling(true);
    try {
      const res = await cancelOrder(order.id);
      setOrder(res.data.data);
      setConfirmCancel(false);
      toastService.success('Đã hủy đơn hàng');
    } catch (err) {
      toastService.error(errMsg(err));
    } finally {
      setCancelling(false);
    }
  };

  const needBankTransfer = order?.payment_method === 'bank_transfer' && order?.payment_status === 'unpaid';
  const justPlaced = location.state?.justPlaced;
  const st = ORDER_STATUS_LABEL[order?.status] ?? ORDER_STATUS_LABEL.pending;

  return (
    <CustomerLayout>
      <LoadingOverlay visible={loading} />

      <div className="w-full px-4 md:px-10 lg:px-20 xl:px-40 py-8">
        {!loading && !order ? (
          <div className="bg-white dark:bg-[#132210] rounded-xl border border-gray-200 dark:border-[#2a4524] py-20 flex flex-col items-center gap-4 text-center">
            <span className="material-symbols-outlined text-[64px] text-gray-300">error</span>
            <p className="text-gray-500 text-base">Không tìm thấy đơn hàng.</p>
            <Link to="/san-pham" className="flex items-center gap-2 px-6 py-3 rounded-lg bg-primary hover:bg-[#3ed622] text-[#101b0d] font-bold transition-colors">
              <span className="material-symbols-outlined text-[18px]">storefront</span>
              Tiếp tục mua sắm
            </Link>
          </div>
        ) : order ? (
          <>
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm mb-6 flex-wrap">
              <Link to="/trang-chu" className="text-[#599a4c] hover:text-primary font-medium transition-colors">Trang chủ</Link>
              <span className="text-[#599a4c]">/</span>
              <Link to="/tai-khoan" state={{ tab: 'orders' }} className="text-[#599a4c] hover:text-primary font-medium transition-colors">Đơn hàng</Link>
              <span className="text-[#599a4c]">/</span>
              <span className="text-[#101b0d] dark:text-white font-medium">{order.code}</span>
            </nav>

            {/* Banner */}
            <div className="flex flex-col items-center text-center gap-3 mb-8">
              {justPlaced ? (
                <>
                  <span className="material-symbols-outlined text-[64px] text-[#2E7D32] dark:text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  <h1 className="text-2xl md:text-3xl font-black tracking-tight text-[#101b0d] dark:text-white">Đặt hàng thành công!</h1>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[64px] text-[#2E7D32] dark:text-primary">receipt_long</span>
                  <h1 className="text-2xl md:text-3xl font-black tracking-tight text-[#101b0d] dark:text-white">Chi tiết đơn hàng</h1>
                </>
              )}
              <p className="text-gray-500 dark:text-gray-400">
                Mã đơn hàng <span className="font-bold text-[#101b0d] dark:text-white">{order.code}</span>
                <span className={`ml-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${st.cls}`}>{st.label}</span>
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Cột trái */}
              <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6">
                {/* Hướng dẫn chuyển khoản (chỉ khi bank_transfer chưa thanh toán) */}
                {needBankTransfer && (
                  <section className="bg-white dark:bg-[#132210] rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="material-symbols-outlined text-[#2E7D32] dark:text-primary">account_balance</span>
                      <h2 className="text-lg font-bold text-[#101b0d] dark:text-white">Chuyển khoản để hoàn tất</h2>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
                      Quét mã QR bằng app ngân hàng (đã điền sẵn số tiền &amp; nội dung), hoặc chuyển khoản thủ công theo thông tin bên dưới.
                      Đơn sẽ được xác nhận sau khi chúng tôi nhận được thanh toán.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-6">
                      {/* QR */}
                      <div className="shrink-0 mx-auto sm:mx-0">
                        <img
                          src={vietQrUrl({ amount: order.total, addInfo: order.code })}
                          alt={`VietQR ${BANK.name}`}
                          onClick={() => setQrZoom(true)}
                          className="size-48 rounded-lg border border-[#d3e7cf] dark:border-[#3a5c35] bg-white cursor-zoom-in hover:ring-2 hover:ring-primary transition-all"
                          loading="lazy"
                        />
                        <button
                          onClick={() => setQrZoom(true)}
                          className="mt-2 w-full text-center text-xs text-gray-400 hover:text-[#2E7D32] dark:hover:text-primary flex items-center justify-center gap-1 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[14px]">zoom_in</span>
                          Bấm để phóng to
                        </button>
                      </div>

                      {/* Thông tin TK */}
                      <div className="flex-1 flex flex-col gap-3">
                        {[
                          { label: 'Ngân hàng', value: BANK.name, copy: false },
                          { label: 'Chủ tài khoản', value: BANK.holder, copy: false },
                          { label: 'Số tài khoản', value: BANK.account, copy: true, copyLabel: 'số tài khoản' },
                          { label: 'Số tiền', value: fmt(order.total), raw: Math.round(order.total), copy: true, copyLabel: 'số tiền', accent: true },
                          { label: 'Nội dung', value: order.code, copy: true, copyLabel: 'nội dung', accent: true },
                        ].map((row) => (
                          <div key={row.label} className="flex items-center justify-between gap-3 border-b border-gray-100 dark:border-white/10 pb-2 last:border-0">
                            <span className="text-sm text-gray-500 dark:text-gray-400">{row.label}</span>
                            <div className="flex items-center gap-2 min-w-0">
                              <span className={`text-sm font-bold truncate ${row.accent ? 'text-[#2E7D32] dark:text-primary' : 'text-[#101b0d] dark:text-white'}`}>{row.value}</span>
                              {row.copy && (
                                <button
                                  onClick={() => copy(row.raw ?? row.value, row.copyLabel)}
                                  title={`Sao chép ${row.copyLabel}`}
                                  className="shrink-0 p-1 rounded text-gray-400 hover:text-[#2E7D32] dark:hover:text-primary hover:bg-primary/10 transition-colors"
                                >
                                  <span className="material-symbols-outlined text-[16px]">content_copy</span>
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                        {BANK.branch && <p className="text-xs text-gray-400">Chi nhánh: {BANK.branch}</p>}
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                          <span className="material-symbols-outlined text-[14px] align-middle mr-1">info</span>
                          Vui lòng ghi đúng nội dung <b className="font-bold">{order.code}</b> để đối soát tự động.
                        </p>
                      </div>
                    </div>
                  </section>
                )}

                {/* COD note */}
                {order.payment_method === 'cod' && (
                  <section className="bg-primary/5 dark:bg-primary/10 rounded-xl border border-primary/20 p-6 flex items-start gap-3">
                    <span className="material-symbols-outlined text-[#2E7D32] dark:text-primary mt-0.5">local_shipping</span>
                    <div>
                      <h2 className="text-base font-bold text-[#101b0d] dark:text-white">Thanh toán khi nhận hàng</h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Bạn sẽ thanh toán <b className="text-[#2E7D32] dark:text-primary">{fmt(order.total)}</b> bằng tiền mặt cho nhân viên giao hàng khi nhận hàng.</p>
                    </div>
                  </section>
                )}

                {/* Địa chỉ giao hàng */}
                {order.address && (
                  <section className="bg-white dark:bg-[#132210] rounded-xl border border-gray-200 dark:border-[#2a4524] p-6">
                    <h2 className="text-lg font-bold text-[#101b0d] dark:text-white mb-3">Giao đến</h2>
                    <p className="text-base font-semibold text-[#101b0d] dark:text-white">{order.address.full_name} · {order.address.phone}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {[order.address.street, order.address.ward, order.address.district, order.address.city].filter(Boolean).join(', ')}
                    </p>
                    {order.note && <p className="text-sm text-gray-500 dark:text-gray-400 mt-2"><span className="font-semibold">Ghi chú:</span> {order.note}</p>}
                  </section>
                )}
              </div>

              {/* Cột phải: tóm tắt đơn */}
              <aside className="lg:col-span-5 xl:col-span-4 w-full">
                <div className="bg-white dark:bg-[#132210] rounded-xl border border-gray-200 dark:border-[#2a4524] p-6 flex flex-col gap-5">
                  <h2 className="text-lg font-bold text-[#101b0d] dark:text-white pb-4 border-b border-gray-100 dark:border-white/10">Đơn hàng của bạn</h2>

                  <div className="flex flex-col gap-4 max-h-[320px] overflow-y-auto pr-1">
                    {(order.items ?? []).map((it) => (
                      <div key={it.id} className="flex gap-3">
                        <div
                          className="relative size-16 shrink-0 rounded-md bg-[#e9f3e7] dark:bg-white/10 bg-cover bg-center flex items-center justify-center border border-[#d3e7cf] dark:border-[#3a5c35]"
                          style={it.image_url ? { backgroundImage: `url("${it.image_url}")` } : {}}
                        >
                          {!it.image_url && <span className="material-symbols-outlined text-2xl text-[#d3e7cf]">eco</span>}
                          <span className="absolute top-0 right-0 min-w-[20px] h-5 px-1 rounded-full bg-[#2E7D32] text-white text-[11px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-[#132210]">{it.quantity}</span>
                        </div>
                        <div className="flex-1 min-w-0 self-center">
                          <h3 className="text-sm font-bold text-[#101b0d] dark:text-white line-clamp-2 leading-tight">{it.name}</h3>
                          <p className="text-xs text-gray-400 mt-1">{fmt(it.price)}{it.unit ? ` / ${it.unit}` : ''}</p>
                        </div>
                        <p className="text-sm font-bold text-[#101b0d] dark:text-white whitespace-nowrap self-center">{fmt(it.subtotal)}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col gap-3 border-t border-gray-100 dark:border-white/10 pt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Tạm tính</span>
                      <span className="font-semibold text-[#101b0d] dark:text-white">{fmt(order.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Phí vận chuyển</span>
                      {order.shipping_fee === 0
                        ? <span className="font-semibold text-[#2E7D32] dark:text-primary">Miễn phí</span>
                        : <span className="font-semibold text-[#101b0d] dark:text-white">{fmt(order.shipping_fee)}</span>}
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Phương thức</span>
                      <span className="font-semibold text-[#101b0d] dark:text-white text-right">{PAYMENT_METHOD_LABEL[order.payment_method] ?? order.payment_method}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center border-t border-gray-100 dark:border-white/10 pt-4">
                    <span className="text-base font-bold text-[#101b0d] dark:text-white">Tổng cộng</span>
                    <span className="text-2xl font-black text-[#2E7D32] dark:text-primary">{fmt(order.total)}</span>
                  </div>

                  <Link to="/san-pham" className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-primary hover:bg-[#3ed622] text-[#101b0d] font-bold transition-colors">
                    <span className="material-symbols-outlined text-[18px]">storefront</span>
                    Tiếp tục mua sắm
                  </Link>

                  <button
                    onClick={() => setConfirmCancel(true)}
                    disabled={order.status !== 'pending' || cancelling}
                    title={order.status === 'pending' ? 'Hủy đơn hàng' : 'Chỉ có thể hủy đơn đang chờ xử lý'}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-red-300 dark:border-red-500/40 text-red-600 dark:text-red-400 font-bold hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                  >
                    <span className="material-symbols-outlined text-[18px]">cancel</span>
                    Hủy đơn hàng
                  </button>
                </div>
              </aside>
            </div>
          </>
        ) : null}
      </div>

      {/* ── Lightbox phóng to QR ─────────────────────────────────────── */}
      {qrZoom && order && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setQrZoom(false)}
        >
          <button
            onClick={() => setQrZoom(false)}
            className="absolute top-5 right-5 size-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            aria-label="Đóng"
          >
            <span className="material-symbols-outlined text-[26px]">close</span>
          </button>

          <div className="flex flex-col items-center gap-4" onClick={(e) => e.stopPropagation()}>
            <img
              src={vietQrUrl({ amount: order.total, addInfo: order.code })}
              alt={`VietQR ${BANK.name}`}
              className="w-[min(88vw,420px)] aspect-square rounded-xl bg-white p-3"
            />
            <div className="text-center text-white">
              <p className="text-sm text-white/70">{BANK.name} · {BANK.holder}</p>
              <p className="text-xl font-bold tracking-wide">{BANK.account}</p>
              <p className="text-sm text-white/70 mt-1">Số tiền {fmt(order.total)} · Nội dung <b className="text-white">{order.code}</b></p>
            </div>
          </div>
        </div>
      )}

      {/* ── Xác nhận huỷ đơn ─────────────────────────────────────────── */}
      {confirmCancel && order && (
        <div
          className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4"
          onClick={() => !cancelling && setConfirmCancel(false)}
        >
          <div className="bg-white dark:bg-[#132210] rounded-xl p-6 w-full max-w-sm flex flex-col gap-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start gap-3">
              <span className="size-10 shrink-0 rounded-full bg-red-100 dark:bg-red-500/15 text-red-600 dark:text-red-400 flex items-center justify-center">
                <span className="material-symbols-outlined">warning</span>
              </span>
              <div>
                <h3 className="text-base font-bold text-[#101b0d] dark:text-white">Hủy đơn hàng?</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  Đơn <b className="text-[#101b0d] dark:text-white">{order.code}</b> sẽ bị hủy và không thể hoàn tác.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmCancel(false)}
                disabled={cancelling}
                className="px-4 py-2 rounded-lg border border-gray-200 dark:border-[#3a5c35] text-gray-600 dark:text-gray-300 font-semibold hover:bg-gray-100 dark:hover:bg-white/5 transition-colors disabled:opacity-50"
              >
                Không
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {cancelling && <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                Hủy đơn
              </button>
            </div>
          </div>
        </div>
      )}
    </CustomerLayout>
  );
};

export default OrderSuccessPage;
