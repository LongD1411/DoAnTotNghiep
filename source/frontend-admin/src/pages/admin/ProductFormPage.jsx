import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import Select from '../../components/common/Select';

// ── Constants ────────────────────────────────────────────────────────────────

// category_id phải khớp với bảng Category trong DB
const CATEGORY_OPTIONS = [
  { value: '',  label: 'Chọn danh mục'          },
  { value: 1,   label: 'Phân bón'                },
  { value: 2,   label: 'Thuốc bảo vệ thực vật'   },
  { value: 3,   label: 'Hạt giống cây trồng'      },
  { value: 4,   label: 'Thuốc trừ nấm'            },
  { value: 5,   label: 'Phân hữu cơ'              },
];

const UNIT_OPTIONS = [
  { value: 'kg',   label: 'kg'   },
  { value: 'hộp',  label: 'hộp'  },
  { value: 'bó',   label: 'bó'   },
  { value: 'chai', label: 'chai' },
  { value: 'lít',  label: 'lít'  },
  { value: 'gói',  label: 'gói'  },
  { value: 'con',  label: 'con'  },
  { value: 'quả',  label: 'quả'  },
];

const MAX_IMAGES = 5;

const EMPTY_FORM = {
  name:          '',
  description:   '',
  price:         '',
  discountPrice: '',
  unit:          'kg',
  stock:         '',
  images:        [],
  categoryId:    '',
  origin:        '',
  weight:        '',
  expiryDays:    '',
  isActive:      true,
};

// Mock dùng khi chưa có backend (edit mode)
const MOCK_EDIT_DATA = {
  1:  { name: 'Phân bón NPK 20-20-20',          categoryId: 1, price: '250000', discountPrice: '',       unit: 'kg',   stock: '150', isActive: true,  origin: 'Đà Lạt',      weight: '25',  expiryDays: '730', description: 'Phân bón NPK cân đối tỉ lệ 20-20-20, cung cấp đầy đủ đạm, lân, kali giúp cây phát triển toàn diện.', images: ['https://picsum.photos/seed/sp001/400/400', 'https://picsum.photos/seed/sp001b/400/400'] },
  2:  { name: 'Thuốc trừ sâu Abamectin',        categoryId: 2, price: '180000', discountPrice: '160000', unit: 'chai', stock: '25',  isActive: true,  origin: 'TP. HCM',     weight: '0.5', expiryDays: '365', description: 'Thuốc trừ sâu sinh học hiệu quả cao, an toàn cho môi trường.',                                         images: ['https://picsum.photos/seed/sp002/400/400'] },
  3:  { name: 'Hạt giống lúa ST25',             categoryId: 3, price: '85000',  discountPrice: '',       unit: 'kg',   stock: '0',   isActive: true,  origin: 'An Giang',    weight: '1',   expiryDays: '365', description: 'Giống lúa ST25 thơm ngon, năng suất cao, thích nghi tốt với ĐBSCL.',                                  images: [] },
  4:  { name: 'Phân DAP 18-46-0',               categoryId: 1, price: '320000', discountPrice: '',       unit: 'kg',   stock: '200', isActive: true,  origin: 'Nhập khẩu',   weight: '50',  expiryDays: '',    description: '', images: [] },
  5:  { name: 'Thuốc trừ nấm Mancozeb',         categoryId: 4, price: '95000',  discountPrice: '',       unit: 'gói',  stock: '80',  isActive: true,  origin: 'Bình Dương',  weight: '0.2', expiryDays: '730', description: '', images: [] },
  6:  { name: 'Hạt giống ngô nếp AG399',        categoryId: 3, price: '120000', discountPrice: '105000', unit: 'gói',  stock: '0',   isActive: false, origin: '',            weight: '',    expiryDays: '365', description: '', images: [] },
  7:  { name: 'Phân hữu cơ vi sinh Sông Gianh', categoryId: 5, price: '145000', discountPrice: '',       unit: 'kg',   stock: '300', isActive: true,  origin: 'Quảng Bình',  weight: '5',   expiryDays: '',    description: '', images: [] },
  8:  { name: 'Thuốc bảo vệ thực vật Regent',  categoryId: 2, price: '210000', discountPrice: '',       unit: 'chai', stock: '15',  isActive: true,  origin: 'TP. HCM',     weight: '1',   expiryDays: '365', description: '', images: [] },
  9:  { name: 'Phân Kali Clorua 60%',           categoryId: 1, price: '280000', discountPrice: '',       unit: 'kg',   stock: '0',   isActive: false, origin: 'Nhập khẩu',   weight: '50',  expiryDays: '',    description: '', images: [] },
  10: { name: 'Hạt giống cà chua Cherry',       categoryId: 3, price: '65000',  discountPrice: '',       unit: 'gói',  stock: '90',  isActive: true,  origin: 'Đà Lạt',      weight: '0.1', expiryDays: '365', description: '', images: [] },
  11: { name: 'Thuốc trừ cỏ Glyphosate',        categoryId: 2, price: '75000',  discountPrice: '',       unit: 'chai', stock: '120', isActive: true,  origin: '',            weight: '1',   expiryDays: '730', description: '', images: [] },
  12: { name: 'Phân bón lá Đầu Trâu 502',       categoryId: 1, price: '55000',  discountPrice: '48000',  unit: 'gói',  stock: '8',   isActive: true,  origin: 'Bình Phước',  weight: '0.1', expiryDays: '365', description: '', images: [] },
  13: { name: 'Thuốc trừ nấm Ridomil Gold',     categoryId: 4, price: '165000', discountPrice: '',       unit: 'gói',  stock: '0',   isActive: true,  origin: 'TP. HCM',     weight: '0.3', expiryDays: '730', description: '', images: [] },
  14: { name: 'Phân NPK Việt Nhật 16-16-8',     categoryId: 1, price: '190000', discountPrice: '',       unit: 'kg',   stock: '175', isActive: true,  origin: 'Hà Nội',      weight: '25',  expiryDays: '',    description: '', images: [] },
  15: { name: 'Hạt giống dưa leo F1',           categoryId: 3, price: '95000',  discountPrice: '',       unit: 'gói',  stock: '60',  isActive: true,  origin: 'Đà Lạt',      weight: '0.1', expiryDays: '365', description: '', images: [] },
  16: { name: 'Phân hữu cơ Hưng Thịnh',         categoryId: 5, price: '110000', discountPrice: '',       unit: 'kg',   stock: '0',   isActive: false, origin: '',            weight: '5',   expiryDays: '',    description: '', images: [] },
  17: { name: 'Thuốc diệt côn trùng Padan',     categoryId: 2, price: '135000', discountPrice: '',       unit: 'chai', stock: '45',  isActive: true,  origin: 'Đồng Nai',    weight: '0.5', expiryDays: '365', description: '', images: [] },
  18: { name: 'Phân ure Hà Bắc 46%N',           categoryId: 1, price: '230000', discountPrice: '210000', unit: 'kg',   stock: '500', isActive: true,  origin: 'Hà Bắc',      weight: '50',  expiryDays: '',    description: '', images: [] },
  19: { name: 'Thuốc trừ nấm Score 250 EC',     categoryId: 4, price: '145000', discountPrice: '',       unit: 'chai', stock: '30',  isActive: true,  origin: 'TP. HCM',     weight: '0.5', expiryDays: '730', description: '', images: [] },
  20: { name: 'Hạt giống ớt lai F1 TN557',      categoryId: 3, price: '78000',  discountPrice: '',       unit: 'gói',  stock: '0',   isActive: true,  origin: 'Đà Lạt',      weight: '0.1', expiryDays: '365', description: '', images: [] },
};

// ── Helpers ──────────────────────────────────────────────────────────────────

const validateField = (field, value, currentErrors) => {
  const errs = { ...currentErrors };
  switch (field) {
    case 'name':
      if (!String(value).trim())                errs.name = 'Tên sản phẩm không được để trống';
      else if (String(value).trim().length < 3) errs.name = 'Tên sản phẩm tối thiểu 3 ký tự';
      else                                       delete errs.name;
      break;
    case 'price':
      if (value === '')             errs.price = 'Vui lòng nhập giá bán';
      else if (Number(value) < 0)   errs.price = 'Giá bán không được âm';
      else                          delete errs.price;
      break;
    case 'discountPrice':
      if (value !== '' && Number(value) < 0) errs.discountPrice = 'Giá khuyến mãi không được âm';
      else                                    delete errs.discountPrice;
      break;
    case 'stock':
      if (value === '')           errs.stock = 'Vui lòng nhập số lượng';
      else if (Number(value) < 0) errs.stock = 'Tồn kho không được âm';
      else                        delete errs.stock;
      break;
    case 'categoryId':
      if (value === '' || value === null || value === undefined)
        errs.categoryId = 'Vui lòng chọn danh mục';
      else
        delete errs.categoryId;
      break;
    case 'weight':
      if (value !== '' && Number(value) < 0) errs.weight = 'Trọng lượng không được âm';
      else                                    delete errs.weight;
      break;
    case 'expiryDays':
      if (value !== '' && (!Number.isInteger(Number(value)) || Number(value) < 0))
        errs.expiryDays = 'Hạn sử dụng phải là số nguyên không âm';
      else
        delete errs.expiryDays;
      break;
    default:
      break;
  }
  return errs;
};

// ── Page ─────────────────────────────────────────────────────────────────────

const ProductFormPage = () => {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const isEdit     = !!id;

  const [form, setForm]       = useState(EMPTY_FORM);
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    setTimeout(() => {
      const data = MOCK_EDIT_DATA[Number(id)];
      if (data) setForm({ ...EMPTY_FORM, ...data });
      setLoading(false);
    }, 400);
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => validateField(name, value, prev));
  };

  const handleSelect = (field) => (value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => validateField(field, value, prev));
  };

  const handleImageChange = (idx, value) => {
    setForm(prev => {
      const imgs = [...prev.images];
      imgs[idx] = value;
      return { ...prev, images: imgs };
    });
  };

  const addImage = () => {
    if (form.images.length >= MAX_IMAGES) return;
    setForm(prev => ({ ...prev, images: [...prev.images, ''] }));
  };

  const removeImage = (idx) => {
    setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let errs = { ...errors };
    ['name', 'price', 'stock', 'categoryId'].forEach(f => {
      errs = validateField(f, form[f], errs);
    });
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSaving(true);
    const payload = {
      name:           form.name.trim(),
      price:          Number(form.price),
      category_id:    Number(form.categoryId),
      description:    form.description.trim() || undefined,
      stock:          Number(form.stock),
      images:         form.images.map(s => s.trim()).filter(Boolean),
      unit:           form.unit,
      discount_price: form.discountPrice !== '' ? Number(form.discountPrice) : undefined,
      origin:         form.origin.trim() || undefined,
      weight:         form.weight !== '' ? Number(form.weight) : undefined,
      expiry_days:    form.expiryDays !== '' ? Number(form.expiryDays) : undefined,
      is_active:      form.isActive,
      localTime:      new Date().toISOString(),
    };
    console.log('[ProductForm] payload', payload);
    await new Promise(r => setTimeout(r, 600));
    setSaving(false);
    setSaved(true);
    setTimeout(() => navigate('/admin/products'), 1200);
  };

  const title = isEdit ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới';

  const inputCls = (field) =>
    `w-full px-4 py-3 rounded-lg border ${
      errors[field]
        ? 'border-red-400 focus:ring-2 focus:ring-red-200 focus:border-red-400'
        : 'border-[#d3e7cf] dark:border-slate-700 focus:ring-2 focus:ring-primary/30 focus:border-primary'
    } bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none transition-all text-sm`;

  return (
    <AdminLayout>
      <>
        <LoadingOverlay visible={loading || saving} />

        {/* ── Header ────────────────────────────────────────────────── */}
        <header className="sticky top-0 z-10 bg-white/80 dark:bg-[#152210]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-8 py-4 flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">{title}</h2>
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Quay lại
          </button>
        </header>

        {/* ── Content ───────────────────────────────────────────────── */}
        <div className="p-8 max-w-6xl mx-auto w-full">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* ── Left col (2/3) ───────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-6">

              {/* Thông tin cơ bản */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-lg font-bold mb-5 flex items-center gap-2 text-slate-800 dark:text-white">
                  <span className="material-symbols-outlined text-primary">description</span>
                  Thông tin cơ bản
                </h3>
                <div className="space-y-4">

                  {/* Tên sản phẩm */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Tên sản phẩm <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="name"
                      type="text"
                      value={form.name}
                      onChange={handleChange}
                      className={inputCls('name')}
                      placeholder="Ví dụ: Phân bón NPK Cao Cấp"
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                  </div>

                  {/* Mô tả */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Mô tả sản phẩm
                    </label>
                    <div className="border border-[#d3e7cf] dark:border-slate-700 rounded-lg overflow-hidden">
                      <div className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-2 flex gap-1">
                        {['format_bold', 'format_italic', 'format_list_bulleted', 'link'].map(icon => (
                          <button key={icon} type="button"
                            className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded transition-colors text-slate-500">
                            <span className="material-symbols-outlined text-sm">{icon}</span>
                          </button>
                        ))}
                      </div>
                      <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        rows={7}
                        className="w-full px-4 py-3 border-none focus:ring-0 bg-white dark:bg-slate-800 text-slate-900 dark:text-white resize-none outline-none text-sm"
                        placeholder="Mô tả chi tiết về công dụng, thành phần, hướng dẫn sử dụng..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Giá & Tồn kho */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-lg font-bold mb-5 flex items-center gap-2 text-slate-800 dark:text-white">
                  <span className="material-symbols-outlined text-primary">payments</span>
                  Giá &amp; Tồn kho
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                  {/* Giá bán */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Giá bán (VNĐ) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input name="price" type="number" min="0" value={form.price} onChange={handleChange}
                        className={`${inputCls('price')} pr-14`} placeholder="0" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs pointer-events-none">VNĐ</span>
                    </div>
                    {errors.price && <p className="mt-1 text-sm text-red-500">{errors.price}</p>}
                  </div>

                  {/* Giá khuyến mãi */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Giá khuyến mãi (VNĐ)
                    </label>
                    <div className="relative">
                      <input name="discountPrice" type="number" min="0" value={form.discountPrice} onChange={handleChange}
                        className={`${inputCls('discountPrice')} pr-14`} placeholder="Để trống nếu không có" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs pointer-events-none">VNĐ</span>
                    </div>
                    {errors.discountPrice && <p className="mt-1 text-sm text-red-500">{errors.discountPrice}</p>}
                  </div>

                  {/* Tồn kho */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Số lượng tồn kho <span className="text-red-500">*</span>
                    </label>
                    <input name="stock" type="number" min="0" value={form.stock} onChange={handleChange}
                      className={inputCls('stock')} placeholder="0" />
                    {errors.stock && <p className="mt-1 text-sm text-red-500">{errors.stock}</p>}
                  </div>

                  {/* Đơn vị tính */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Đơn vị tính
                    </label>
                    <Select
                      value={form.unit}
                      options={UNIT_OPTIONS}
                      onChange={handleSelect('unit')}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Thông tin bổ sung */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-lg font-bold mb-5 flex items-center gap-2 text-slate-800 dark:text-white">
                  <span className="material-symbols-outlined text-primary">info</span>
                  Thông tin bổ sung
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">

                  {/* Xuất xứ */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Xuất xứ
                    </label>
                    <input name="origin" type="text" value={form.origin} onChange={handleChange}
                      className={inputCls('origin')} placeholder="Ví dụ: Đà Lạt, Nhập khẩu..." />
                  </div>

                  {/* Trọng lượng */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Trọng lượng (kg)
                    </label>
                    <input name="weight" type="number" min="0" step="0.1" value={form.weight} onChange={handleChange}
                      className={inputCls('weight')} placeholder="0.0" />
                    {errors.weight && <p className="mt-1 text-sm text-red-500">{errors.weight}</p>}
                  </div>

                  {/* Hạn sử dụng */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Hạn sử dụng (ngày)
                    </label>
                    <input name="expiryDays" type="number" min="0" step="1" value={form.expiryDays} onChange={handleChange}
                      className={inputCls('expiryDays')} placeholder="Ví dụ: 365" />
                    {errors.expiryDays && <p className="mt-1 text-sm text-red-500">{errors.expiryDays}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Right col (1/3) ──────────────────────────────────── */}
            <div className="space-y-6">

              {/* Ảnh sản phẩm */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold flex items-center gap-2 text-slate-800 dark:text-white">
                    <span className="material-symbols-outlined text-primary">image</span>
                    Ảnh sản phẩm
                  </h3>
                  <span className="text-xs font-bold text-slate-400 tabular-nums">
                    {form.images.length}/{MAX_IMAGES}
                  </span>
                </div>

                {/* Danh sách ảnh */}
                <div className="space-y-3">
                  {form.images.map((url, idx) => (
                    <div key={idx} className="space-y-1.5">
                      {/* Label + input + delete */}
                      <div className="flex items-center gap-2">
                        {idx === 0 && (
                          <span className="shrink-0 text-xs font-bold bg-primary/20 text-[#1B5E20] dark:text-primary px-2 py-0.5 rounded-full">
                            Chính
                          </span>
                        )}
                        {idx > 0 && (
                          <span className="shrink-0 text-xs font-medium text-slate-400 w-8 text-center">
                            #{idx + 1}
                          </span>
                        )}
                        <div className="relative flex-1">
                          <input
                            type="text"
                            value={url}
                            onChange={(e) => handleImageChange(idx, e.target.value)}
                            placeholder="https://..."
                            className="w-full pl-9 pr-4 py-2 rounded-lg border border-[#d3e7cf] dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                          />
                          <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-base pointer-events-none">image</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="shrink-0 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-colors"
                          title="Xóa ảnh"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                      {/* Preview thumbnail */}
                      {url.trim() && (
                        <div className="ml-10 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 aspect-video">
                          <img
                            src={url}
                            alt={`Ảnh ${idx + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Thêm ảnh / placeholder khi chưa có */}
                {form.images.length === 0 && (
                  <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-5 flex flex-col items-center justify-center text-center mb-3">
                    <div className="size-9 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-2">
                      <span className="material-symbols-outlined text-lg">add_photo_alternate</span>
                    </div>
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Chưa có ảnh nào</p>
                    <p className="text-xs text-slate-400 mt-0.5">Tối đa {MAX_IMAGES} ảnh</p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={addImage}
                  disabled={form.images.length >= MAX_IMAGES}
                  className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-dashed border-[#d3e7cf] dark:border-slate-700 text-sm font-medium text-slate-500 dark:text-slate-400 hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="material-symbols-outlined text-base">add</span>
                  Thêm ảnh{form.images.length > 0 ? ` (${form.images.length}/${MAX_IMAGES})` : ''}
                </button>
              </div>

              {/* Phân loại & Trạng thái */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800 dark:text-white">
                  <span className="material-symbols-outlined text-primary">category</span>
                  Phân loại
                </h3>
                <div className="space-y-4">

                  {/* Danh mục */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Danh mục <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={form.categoryId}
                      options={CATEGORY_OPTIONS}
                      onChange={handleSelect('categoryId')}
                      className="w-full"
                    />
                    {errors.categoryId && <p className="mt-1 text-sm text-red-500">{errors.categoryId}</p>}
                  </div>

                  {/* Hiển thị / Ẩn */}
                  <div className="pt-1">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Hiển thị sản phẩm
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, isActive: !prev.isActive }))}
                        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                          form.isActive ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                          form.isActive ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {form.isActive ? 'Đang hiển thị' : 'Đang ẩn'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1.5">
                      {form.isActive
                        ? 'Sản phẩm hiển thị cho khách hàng trên cửa hàng.'
                        : 'Sản phẩm bị ẩn, khách hàng không thể xem.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Footer actions ───────────────────────────────────── */}
            <div className="lg:col-span-3 flex items-center justify-between gap-4 p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-lg mb-4">
              <div className="min-h-[22px]">
                {saved && (
                  <span className="inline-flex items-center gap-1.5 text-sm font-bold text-green-600 dark:text-green-400">
                    <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    {isEdit ? 'Đã cập nhật!' : 'Đã tạo sản phẩm!'} Đang chuyển hướng...
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4">
                <button type="button" onClick={() => navigate('/admin/products')}
                  className="px-6 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  Hủy bỏ
                </button>
                <button type="submit" disabled={saving || saved}
                  className="px-8 py-2.5 bg-primary text-[#1B5E20] rounded-lg font-bold hover:bg-primary/90 shadow-md shadow-primary/20 flex items-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                  <span className="material-symbols-outlined text-sm">save</span>
                  {isEdit ? 'Cập nhật sản phẩm' : 'Lưu sản phẩm'}
                </button>
              </div>
            </div>

          </form>
        </div>
      </>
    </AdminLayout>
  );
};

export default ProductFormPage;
