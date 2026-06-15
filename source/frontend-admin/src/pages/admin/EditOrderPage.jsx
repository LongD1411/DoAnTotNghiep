import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import Select from '../../components/common/Select';

// ── Constants ────────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: 'pending',   label: 'Chờ xử lý'    },
  { value: 'shipping',  label: 'Đang giao'     },
  { value: 'completed', label: 'Đã hoàn thành' },
  { value: 'cancelled', label: 'Đã hủy'        },
];

const STATUS_BADGE = {
  pending:   'bg-amber-100 text-amber-800 border-amber-200',
  shipping:  'bg-sky-100 text-sky-800 border-sky-200',
  completed: 'bg-primary/20 text-[#1B5E20] border-primary/30',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
};

// Mock dữ liệu đơn hàng — thay bằng API call khi backend sẵn sàng
const MOCK_ORDER = {
  customerName: 'Nguyễn Văn A',
  phone:        '0901234567',
  address:      '123 Đường ABC, Phường 4, Quận 5, TP. Hồ Chí Minh',
  status:       'pending',
  note:         'Khách hàng yêu cầu giao hàng vào buổi sáng. Kiểm tra kỹ hạn sử dụng thuốc trừ sâu.',
  paymentMethod:'COD',
  shipping:     0,
  items: [
    { id: 1, name: 'Phân bón NPK Cao Cấp',    variant: '25kg / Bao',  price: 850000, qty: 2 },
    { id: 2, name: 'Thuốc trừ sâu Sinh học',  variant: 'Chai 500ml',  price: 400000, qty: 2 },
  ],
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmtVND = (n) => n.toLocaleString('vi-VN') + 'đ';

// ── Page ─────────────────────────────────────────────────────────────────────

const EditOrderPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading]   = useState(false);
  const [saved, setSaved]       = useState(false);
  const [form, setForm]         = useState({ ...MOCK_ORDER, items: MOCK_ORDER.items.map(i => ({ ...i })) });
  const [errors, setErrors]     = useState({});

  const orderCode = `#AG-${id ?? '8821'}`;

  // ── Validation ──────────────────────────────────────────────────────────────

  const validate = (field, value) => {
    const e = { ...errors };
    if (field === 'customerName') {
      if (!value.trim()) e.customerName = 'Không được để trống';
      else delete e.customerName;
    }
    if (field === 'phone') {
      if (!value.trim()) e.phone = 'Không được để trống';
      else if (!/^0\d{9}$/.test(value.trim())) e.phone = 'Số điện thoại không hợp lệ (10 chữ số)';
      else delete e.phone;
    }
    if (field === 'address') {
      if (!value.trim()) e.address = 'Không được để trống';
      else delete e.address;
    }
    setErrors(e);
    return !e[field];
  };

  const handleField = (field) => (e) => {
    const value = e.target.value;
    setForm(prev => ({ ...prev, [field]: value }));
    validate(field, value);
  };

  // ── Product items ───────────────────────────────────────────────────────────

  const setQty = (itemId, raw) => {
    const qty = Math.max(1, parseInt(raw) || 1);
    setForm(prev => ({
      ...prev,
      items: prev.items.map(i => i.id === itemId ? { ...i, qty } : i),
    }));
  };

  const removeItem = (itemId) => {
    setForm(prev => ({ ...prev, items: prev.items.filter(i => i.id !== itemId) }));
  };

  // ── Totals ──────────────────────────────────────────────────────────────────

  const subtotal = form.items.reduce((s, i) => s + i.price * i.qty, 0);
  const total    = subtotal + form.shipping;

  // ── Submit ──────────────────────────────────────────────────────────────────

  const handleSubmit = (e) => {
    e.preventDefault();
    const nameOk    = validate('customerName', form.customerName);
    const phoneOk   = validate('phone',        form.phone);
    const addressOk = validate('address',      form.address);
    if (!nameOk || !phoneOk || !addressOk) return;

    setLoading(true);
    // PUT /orders/:id — thay bằng gọi thật khi backend sẵn sàng
    setTimeout(() => {
      setLoading(false);
      setSaved(true);
      setTimeout(() => navigate('/admin/orders'), 1200);
    }, 800);
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <AdminLayout>
      <>
        <LoadingOverlay visible={loading} />

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
              Chỉnh sửa đơn hàng {orderCode}
            </h2>
            {saved && (
              <span className="flex items-center gap-1 text-sm font-semibold text-green-600 bg-green-50 border border-green-200 px-3 py-1 rounded-full">
                <span className="material-symbols-outlined text-base">check_circle</span>
                Đã lưu
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${STATUS_BADGE[form.status]}`}>
              {STATUS_OPTIONS.find(s => s.value === form.status)?.label}
            </div>
            <div className="size-8 rounded-full bg-[#1B5E20] flex items-center justify-center text-white text-xs font-bold">A</div>
          </div>
        </header>

        {/* ── Content ───────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit}>
          <div className="p-8 space-y-8 max-w-6xl mx-auto w-full">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              {/* ── Left (2/3) ─────────────────────────────────────── */}
              <div className="lg:col-span-2 space-y-8">

                {/* Thông tin khách hàng */}
                <section className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#1B5E20] text-xl">person</span>
                      Thông tin khách hàng
                    </h3>
                  </div>
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Họ và tên */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase">Họ và tên</label>
                      <input
                        type="text"
                        value={form.customerName}
                        onChange={handleField('customerName')}
                        className={`w-full rounded-lg border px-4 py-2.5 text-sm bg-white dark:bg-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30 ${errors.customerName ? 'border-red-400' : 'border-slate-200 dark:border-slate-700'}`}
                      />
                      {errors.customerName && <p className="text-xs text-red-500">{errors.customerName}</p>}
                    </div>

                    {/* Số điện thoại */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase">Số điện thoại</label>
                      <input
                        type="text"
                        value={form.phone}
                        onChange={handleField('phone')}
                        className={`w-full rounded-lg border px-4 py-2.5 text-sm bg-white dark:bg-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30 ${errors.phone ? 'border-red-400' : 'border-slate-200 dark:border-slate-700'}`}
                      />
                      {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
                    </div>

                    {/* Địa chỉ */}
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-xs font-bold text-slate-500 uppercase">Địa chỉ nhận hàng</label>
                      <textarea
                        rows={2}
                        value={form.address}
                        onChange={handleField('address')}
                        className={`w-full rounded-lg border px-4 py-2.5 text-sm bg-white dark:bg-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none ${errors.address ? 'border-red-400' : 'border-slate-200 dark:border-slate-700'}`}
                      />
                      {errors.address && <p className="text-xs text-red-500">{errors.address}</p>}
                    </div>
                  </div>
                </section>

                {/* Danh sách sản phẩm */}
                <section className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#1B5E20] text-xl">inventory_2</span>
                      Danh sách sản phẩm
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sản phẩm</th>
                          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Đơn giá</th>
                          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center w-32">Số lượng</th>
                          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Thành tiền</th>
                          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center w-12" />
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {form.items.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-10 text-center text-sm text-slate-400">
                              Chưa có sản phẩm nào
                            </td>
                          </tr>
                        ) : form.items.map(item => (
                          <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <div className="size-10 rounded bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center shrink-0">
                                  <span className="material-symbols-outlined text-slate-400">image</span>
                                </div>
                                <div>
                                  <p className="text-sm font-bold dark:text-slate-100">{item.name}</p>
                                  {item.variant && <p className="text-[10px] text-slate-400 font-medium">{item.variant}</p>}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-right tabular-nums dark:text-slate-200">
                              {fmtVND(item.price)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <input
                                type="number"
                                min={1}
                                value={item.qty}
                                onChange={e => setQty(item.id, e.target.value)}
                                className="w-16 text-center rounded border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white text-sm py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/30"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-right tabular-nums dark:text-slate-100">
                              {fmtVND(item.price * item.qty)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <button
                                type="button"
                                onClick={() => removeItem(item.id)}
                                className="text-slate-400 hover:text-red-500 transition-colors"
                                title="Xóa"
                              >
                                <span className="material-symbols-outlined text-lg">delete</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>

              {/* ── Right (1/3) ────────────────────────────────────── */}
              <div className="space-y-8">

                {/* Trạng thái */}
                <section className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                  <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 rounded-t-xl">
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#1B5E20] text-xl">label</span>
                      Trạng thái đơn hàng
                    </h3>
                  </div>
                  <div className="p-6">
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Trạng thái hiện tại</label>
                    <Select
                      value={form.status}
                      options={STATUS_OPTIONS}
                      onChange={val => setForm(prev => ({ ...prev, status: val }))}
                      className="w-full"
                    />
                  </div>
                </section>

                {/* Thông tin thanh toán */}
                <section className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#1B5E20] text-xl">payments</span>
                      Thông tin thanh toán
                    </h3>
                  </div>
                  <div className="p-6 space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-700/50">
                      <span className="text-sm text-slate-500">Tạm tính</span>
                      <span className="text-sm font-semibold tabular-nums dark:text-slate-200">{fmtVND(subtotal)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-700/50">
                      <span className="text-sm text-slate-500">Phí vận chuyển</span>
                      <span className="text-sm font-semibold tabular-nums dark:text-slate-200">{fmtVND(form.shipping)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm font-bold text-slate-800 dark:text-white">Tổng cộng</span>
                      <span className="text-lg font-extrabold tabular-nums text-[#1B5E20] dark:text-primary">{fmtVND(total)}</span>
                    </div>
                    <div className="pt-2 space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase block">Phương thức</label>
                      <div className="px-4 py-2.5 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm font-medium dark:text-slate-200">
                        {form.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng (COD)' : form.paymentMethod}
                      </div>
                    </div>
                  </div>
                </section>

                {/* Ghi chú nội bộ */}
                <section className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#1B5E20] text-xl">sticky_note_2</span>
                      Ghi chú nội bộ
                    </h3>
                  </div>
                  <div className="p-6">
                    <textarea
                      rows={4}
                      value={form.note}
                      onChange={e => setForm(prev => ({ ...prev, note: e.target.value }))}
                      placeholder="Nhập ghi chú cho nhân viên..."
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                    />
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
                Hủy
              </button>
              <button
                type="submit"
                disabled={Object.keys(errors).length > 0 || form.items.length === 0}
                className="px-8 py-2.5 rounded-lg text-sm font-bold bg-[#1B5E20] text-white shadow-lg shadow-[#1B5E20]/20 hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-lg">save</span>
                Cập nhật đơn hàng
              </button>
            </div>
          </div>
        </form>
      </>
    </AdminLayout>
  );
};

export default EditOrderPage;
