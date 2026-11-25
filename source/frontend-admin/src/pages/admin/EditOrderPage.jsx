import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import Select from '../../components/common/Select';
import { getOrderById, updateOrder } from '../../services/orderService';
import { toastService, errMsg } from '../../services/toastService';
import { ORDER_STATUS_LABEL, PAYMENT_STATUS_LABEL, PAYMENT_METHOD_LABEL } from '../../utils/orderStatus';

// ── Constants ────────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: 'pending',    label: 'Chờ xử lý'   },
  { value: 'approved',   label: 'Đã xác nhận' },
  { value: 'delivering', label: 'Đang giao'   },
  { value: 'delivered',  label: 'Đã giao'     },
  { value: 'completed',  label: 'Hoàn tất'    },
  { value: 'cancelled',  label: 'Đã huỷ'      },
];

const PAYMENT_STATUS_OPTIONS = [
  { value: 'unpaid',   label: 'Chưa thanh toán' },
  { value: 'paid',     label: 'Đã thanh toán'   },
  { value: 'refunded', label: 'Đã hoàn tiền'    },
];

const fmtVnd = (n) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n || 0);
const fmtDateTime = (iso) => (iso
  ? new Date(iso).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  : '—');

// ── Page ─────────────────────────────────────────────────────────────────────

const EditOrderPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);

  // Các trường admin được phép đổi (khớp PUT /orders/:id)
  const [status, setStatus]             = useState('pending');
  const [paymentStatus, setPaymentStatus] = useState('unpaid');
  const [cancelReason, setCancelReason]   = useState('');

  useEffect(() => {
    getOrderById(id)
      .then(res => {
        const o = res.data.data;
        setOrder(o);
        setStatus(o.status);
        setPaymentStatus(o.payment_status);
        setCancelReason(o.cancel_reason ?? '');
      })
      .catch(err => toastService.error(errMsg(err)))
      .finally(() => setLoading(false));
  }, [id]);

  const dirty = order && (status !== order.status || paymentStatus !== order.payment_status || (status === 'cancelled' && cancelReason !== (order.cancel_reason ?? '')));

  const handleSave = async (e) => {
    e.preventDefault();
    if (!order) return;
    const payload = { status, payment_status: paymentStatus };
    if (status === 'cancelled' && cancelReason.trim()) payload.cancel_reason = cancelReason.trim();

    setSaving(true);
    try {
      const res = await updateOrder(id, payload);
      const o = res.data.data;
      setOrder(o);
      setStatus(o.status);
      setPaymentStatus(o.payment_status);
      setCancelReason(o.cancel_reason ?? '');
      toastService.success('Cập nhật đơn hàng thành công');
    } catch (err) {
      toastService.error(errMsg(err));
    } finally {
      setSaving(false);
    }
  };

  const addr = order?.address;
  const fullAddress = addr
    ? [addr.street, addr.ward, addr.district, addr.city].filter(Boolean).join(', ')
    : '—';
  const st = ORDER_STATUS_LABEL[status] ?? ORDER_STATUS_LABEL.pending;

  return (
    <AdminLayout>
      <>
        <LoadingOverlay visible={loading || saving} />

        {/* ── Header ────────────────────────────────────────────────── */}
        <header className="sticky top-0 z-10 bg-white/80 dark:bg-[#152210]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/orders')}
              className="flex items-center gap-1 text-slate-500 hover:text-[#1B5E20] dark:hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">
              Chi tiết đơn hàng {order?.code ?? ''}
            </h2>
          </div>
          {order && (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${st.cls}`}>
              <span className={`size-1.5 rounded-full ${st.dot}`} />{st.label}
            </span>
          )}
        </header>

        {!loading && !order ? (
          <div className="p-8">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center text-slate-400">
              Không tìm thấy đơn hàng.
            </div>
          </div>
        ) : order ? (
          <form onSubmit={handleSave}>
            <div className="p-8 space-y-8 max-w-6xl mx-auto w-full">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* ── Left (2/3) ─────────────────────────────────────── */}
                <div className="lg:col-span-2 space-y-8">

                  {/* Thông tin khách hàng (chỉ đọc) */}
                  <section className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                      <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#1B5E20] text-xl">person</span>
                        Thông tin giao hàng
                      </h3>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase">Người nhận</p>
                        <p className="text-sm font-semibold dark:text-slate-200 mt-1">{addr?.full_name ?? '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase">Số điện thoại</p>
                        <p className="text-sm font-semibold dark:text-slate-200 mt-1">{addr?.phone ?? '—'}</p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-xs font-bold text-slate-400 uppercase">Địa chỉ nhận hàng</p>
                        <p className="text-sm font-semibold dark:text-slate-200 mt-1">{fullAddress}</p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-xs font-bold text-slate-400 uppercase">Ngày đặt</p>
                        <p className="text-sm font-semibold dark:text-slate-200 mt-1">{fmtDateTime(order.created_at)}</p>
                      </div>
                      {order.note && (
                        <div className="md:col-span-2">
                          <p className="text-xs font-bold text-slate-400 uppercase">Ghi chú của khách</p>
                          <p className="text-sm dark:text-slate-300 mt-1">{order.note}</p>
                        </div>
                      )}
                    </div>
                  </section>

                  {/* Danh sách sản phẩm (chỉ đọc) */}
                  <section className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                      <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#1B5E20] text-xl">inventory_2</span>
                        Sản phẩm ({order.item_count ?? (order.items?.length ?? 0)})
                      </h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                            <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sản phẩm</th>
                            <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Đơn giá</th>
                            <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">SL</th>
                            <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Thành tiền</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                          {(order.items ?? []).map(item => (
                            <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div
                                    className="size-10 rounded bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 bg-cover bg-center flex items-center justify-center shrink-0"
                                    style={item.image_url ? { backgroundImage: `url("${item.image_url}")` } : {}}
                                  >
                                    {!item.image_url && <span className="material-symbols-outlined text-slate-400">image</span>}
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold dark:text-slate-100">{item.name}</p>
                                    {item.unit && <p className="text-[10px] text-slate-400 font-medium">{item.unit}</p>}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-right tabular-nums dark:text-slate-200">{fmtVnd(item.price)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-center tabular-nums dark:text-slate-200">×{item.quantity}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-right tabular-nums dark:text-slate-100">{fmtVnd(item.subtotal)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                </div>

                {/* ── Right (1/3) ────────────────────────────────────── */}
                <div className="space-y-8">

                  {/* Cập nhật trạng thái */}
                  <section className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 rounded-t-xl">
                      <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#1B5E20] text-xl">label</span>
                        Cập nhật trạng thái
                      </h3>
                    </div>
                    <div className="p-6 space-y-4">
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Trạng thái đơn</label>
                        <Select value={status} options={STATUS_OPTIONS} onChange={setStatus} className="w-full" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Trạng thái thanh toán</label>
                        <Select value={paymentStatus} options={PAYMENT_STATUS_OPTIONS} onChange={setPaymentStatus} className="w-full" />
                      </div>
                      {status === 'cancelled' && (
                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Lý do huỷ</label>
                          <textarea
                            rows={2}
                            value={cancelReason}
                            onChange={e => setCancelReason(e.target.value)}
                            placeholder="Nhập lý do huỷ (tuỳ chọn)..."
                            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                          />
                        </div>
                      )}
                    </div>
                  </section>

                  {/* Thanh toán */}
                  <section className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                      <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#1B5E20] text-xl">payments</span>
                        Thanh toán
                      </h3>
                    </div>
                    <div className="p-6 space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-700/50">
                        <span className="text-sm text-slate-500">Tạm tính</span>
                        <span className="text-sm font-semibold tabular-nums dark:text-slate-200">{fmtVnd(order.subtotal)}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-700/50">
                        <span className="text-sm text-slate-500">Phí vận chuyển</span>
                        <span className="text-sm font-semibold tabular-nums dark:text-slate-200">{order.shipping_fee === 0 ? 'Miễn phí' : fmtVnd(order.shipping_fee)}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm font-bold text-slate-800 dark:text-white">Tổng cộng</span>
                        <span className="text-lg font-extrabold tabular-nums text-[#1B5E20] dark:text-primary">{fmtVnd(order.total)}</span>
                      </div>
                      <div className="pt-2 space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase block">Phương thức</label>
                        <div className="px-4 py-2.5 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm font-medium dark:text-slate-200 flex items-center justify-between">
                          <span>{PAYMENT_METHOD_LABEL[order.payment_method] ?? order.payment_method}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${(PAYMENT_STATUS_LABEL[order.payment_status] ?? PAYMENT_STATUS_LABEL.unpaid).cls}`}>
                            {(PAYMENT_STATUS_LABEL[order.payment_status] ?? PAYMENT_STATUS_LABEL.unpaid).label}
                          </span>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-4 pt-2 pb-12">
                <button
                  type="button"
                  onClick={() => navigate('/admin/orders')}
                  className="px-8 py-2.5 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Quay lại
                </button>
                <button
                  type="submit"
                  disabled={saving || !dirty}
                  className="px-8 py-2.5 rounded-lg text-sm font-bold bg-[#1B5E20] text-white shadow-lg shadow-[#1B5E20]/20 hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-lg">save</span>
                  Cập nhật đơn hàng
                </button>
              </div>
            </div>
          </form>
        ) : null}
      </>
    </AdminLayout>
  );
};

export default EditOrderPage;
