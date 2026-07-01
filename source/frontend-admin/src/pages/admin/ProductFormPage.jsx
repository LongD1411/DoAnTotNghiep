import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import Select from '../../components/common/Select';
import ImageUploader from '../../components/common/ImageUploader';
import RichTextEditor from '../../components/common/RichTextEditor';
import { resolveImages } from '../../services/uploadService';
import { getProductById, createProduct, updateProduct } from '../../services/productService';
import { getAllCategories } from '../../services/categoryService';
import { toastService, errMsg } from '../../services/toastService';

// ── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_PLACEHOLDER = { value: '', label: 'Chọn danh mục' };

const HAZARD_OPTIONS = [
  { value: 'NONE',       label: 'Không cảnh báo' },
  { value: 'TRUNG_BINH', label: 'Trung bình (vàng)' },
  { value: 'NANG',       label: 'Nặng (cam)' },
  { value: 'NGUY_HIEM',  label: 'Nguy hiểm (đỏ)' },
];

const UNIT_OPTIONS = [
  { value: 'bao',  label: 'bao'  },
  { value: 'hộp',  label: 'hộp'  },
  { value: 'bó',   label: 'bó'   },
  { value: 'chai', label: 'chai' },
  { value: 'gói',  label: 'gói'  },
  { value: 'con',  label: 'con'  },
  { value: 'quả',  label: 'quả'  },
];

const WEIGHT_UNIT_OPTIONS = [
  { value: 'kg',  label: 'kg'  },
  { value: 'lít', label: 'lít' },
  { value: 'ml',  label: 'ml'  },
];

const VI_MAP = {'à':'a','á':'a','ả':'a','ã':'a','ạ':'a','ă':'a','ắ':'a','ằ':'a','ẳ':'a','ẵ':'a','ặ':'a','â':'a','ấ':'a','ầ':'a','ẩ':'a','ẫ':'a','ậ':'a','đ':'d','è':'e','é':'e','ẻ':'e','ẽ':'e','ẹ':'e','ê':'e','ế':'e','ề':'e','ể':'e','ễ':'e','ệ':'e','ì':'i','í':'i','ỉ':'i','ĩ':'i','ị':'i','ò':'o','ó':'o','ỏ':'o','õ':'o','ọ':'o','ô':'o','ố':'o','ồ':'o','ổ':'o','ỗ':'o','ộ':'o','ơ':'o','ớ':'o','ờ':'o','ở':'o','ỡ':'o','ợ':'o','ù':'u','ú':'u','ủ':'u','ũ':'u','ụ':'u','ư':'u','ứ':'u','ừ':'u','ử':'u','ữ':'u','ự':'u','ỳ':'y','ý':'y','ỷ':'y','ỹ':'y','ỵ':'y'};
const toSlug = (str) => { let s = str.toLowerCase(); for (const [k,v] of Object.entries(VI_MAP)) s = s.split(k).join(v); return s.replace(/[^a-z0-9\s-]/g,'').trim().replace(/\s+/g,'-').replace(/-+/g,'-'); };

const EMPTY_FORM = {
  name:           '',
  slug:           '',
  description:    '',
  specifications: '',
  price:          '',
  discountPrice:  '',
  unit:           'bao',
  stock:          '',
  images:         [],
  categoryId:     '',
  weight:         '',
  weightUnit:     'kg',
  safetyNote:     '',
  hazardLevel:    'NONE',
  hazardNote:     '',
  videoUrl:       '',
  badge:          '',
  isActive:       true,
};

// Trả HTML nếu có nội dung thật, ngược lại undefined (cho field rich-text)
const toApiHtml = (html) => {
  if (!html) return undefined;
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent.trim() ? html : undefined;
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
  const [loadError, setLoadError] = useState(''); // TẠM: hiện lỗi GET thay vì đá về list

  // Danh mục cho dropdown — lấy từ API thật
  const [categories, setCategories] = useState([]);
  useEffect(() => {
    getAllCategories({ limit: 100 })
      .then(res => setCategories(res.data.data.data))
      .catch(() => {});
  }, []);
  const categoryOptions = useMemo(
    () => [CATEGORY_PLACEHOLDER, ...categories.map(c => ({ value: c.id, label: c.name }))],
    [categories],
  );

  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    getProductById(id)
      .then(res => {
        const d = res.data?.data?.product ?? res.data?.data ?? {};
        setForm({
          ...EMPTY_FORM,
          name:           d.name          ?? '',
          slug:           d.slug          ?? '',
          description:    d.description   ?? '',
          specifications: d.specifications ?? '',
          price:         d.price         != null ? String(d.price)          : '',
          discountPrice: d.discount_price != null ? String(d.discount_price) : '',
          unit:          d.unit          ?? 'bao',
          stock:         d.stock         != null ? String(d.stock)          : '',
          images:        Array.isArray(d.images)
                           ? d.images.map(img => (typeof img === 'string' ? img : img?.url)).filter(Boolean)
                           : [],
          categoryId:    d.category_id   ?? '',
          weight:        d.weight        != null ? String(d.weight)         : '',
          weightUnit:    d.weight_unit   ?? 'kg',
          safetyNote:    d.safety_note   ?? '',
          hazardLevel:   d.hazard_level  ?? 'NONE',
          hazardNote:    d.hazard_note   ?? '',
          videoUrl:      d.video_url     ?? '',
          badge:         d.badge         ?? '',
          isActive:      d.is_active     ?? true,
        });
      })
      .catch((err) => {
        // TẠM: không đá về list — để thấy navigation chạy + lỗi thật của GET /products/:id
        const detail = [err.response?.status, errMsg(err)].filter(Boolean).join(' — ');
        setLoadError(detail || 'Không tải được thông tin sản phẩm');
        toastService.error(errMsg(err));
      })
      .finally(() => setLoading(false));
  }, [id, isEdit, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => {
      const next = { ...prev, [name]: value };
      if (name === 'name' && !isEdit) next.slug = toSlug(value); // auto-fill slug khi thêm mới
      return next;
    });
    setErrors(prev => validateField(name, value, prev));
  };

  const handleSelect = (field) => (value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => validateField(field, value, prev));
  };

  const handleRich = (field) => (html) => {
    setForm(prev => ({ ...prev, [field]: html }));
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
    try {
      const resolvedImages = await resolveImages(form.images);
      const payload = {
        name:           form.name.trim(),
        slug:           form.slug.trim() || undefined,
        price:          Number(form.price),
        category_id:    Number(form.categoryId),
        description:    toApiHtml(form.description),
        specifications: toApiHtml(form.specifications),
        stock:          Number(form.stock),
        images:         resolvedImages,
        unit:           form.unit,
        discount_price: form.discountPrice !== '' ? Number(form.discountPrice) : undefined,
        weight:         form.weight !== '' ? Number(form.weight) : undefined,
        weight_unit:    form.weightUnit,
        safety_note:    toApiHtml(form.safetyNote),
        hazard_level:   form.hazardLevel,
        hazard_note:    form.hazardNote.trim() || undefined,
        video_url:      form.videoUrl.trim() || undefined,
        badge:          form.badge.trim() || undefined,
        is_active:      form.isActive,
        localTime:      new Date().toISOString(),
      };
      if (isEdit) {
        await updateProduct(id, payload);
      } else {
        await createProduct(payload);
      }
      toastService.success(isEdit ? 'Cập nhật thành công' : 'Tạo mới thành công');
      navigate('/admin/products');
    } catch (err) {
      toastService.error(errMsg(err));
    } finally {
      setSaving(false);
    }
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
          {loadError && (
            <div className="mb-6 p-4 rounded-xl border border-red-300 dark:border-red-800/50 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm flex items-start gap-3">
              <span className="material-symbols-outlined shrink-0">error</span>
              <div>
                <p className="font-bold">Không tải được sản phẩm — GET /products/{id}</p>
                <p className="mt-0.5 font-mono text-xs">{loadError}</p>
                <p className="mt-1 text-xs">Navigation OK (bạn đang ở trang edit). Lỗi này thường do DB chưa sync schema → chạy <code className="font-mono">prisma db push</code> rồi tải lại.</p>
              </div>
            </div>
          )}
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

                  {/* Slug */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Slug
                    </label>
                    <input
                      name="slug"
                      type="text"
                      value={form.slug}
                      onChange={handleChange}
                      className={`${inputCls('slug')} font-mono`}
                      placeholder="phan-bon-npk-cao-cap"
                    />
                  </div>

                </div>
              </div>

              {/* Nội dung chi tiết (rich-text) */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-lg font-bold mb-5 flex items-center gap-2 text-slate-800 dark:text-white">
                  <span className="material-symbols-outlined text-primary">article</span>
                  Nội dung chi tiết
                </h3>
                <div className="space-y-5">

                  {/* Mô tả */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Mô tả sản phẩm</label>
                    <RichTextEditor
                      value={form.description}
                      onChange={handleRich('description')}
                      placeholder="Mô tả chi tiết về công dụng, hướng dẫn sử dụng..."
                      minHeight={160}
                      maxChars={5000}
                    />
                  </div>

                  {/* Thông số kỹ thuật */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Thông số kỹ thuật</label>
                    <p className="text-xs text-slate-400 mb-1.5">Dùng danh sách / tiêu đề để liệt kê hoạt chất, dạng thuốc, liều dùng, quy cách...</p>
                    <RichTextEditor
                      value={form.specifications}
                      onChange={handleRich('specifications')}
                      placeholder="Hoạt chất, dạng thuốc, liều dùng, quy cách..."
                      minHeight={140}
                      maxChars={5000}
                    />
                  </div>

                  {/* An toàn sử dụng */}
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-1.5 flex-wrap">
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">An toàn sử dụng</label>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">Mức độ nguy hiểm:</span>
                        <Select
                          value={form.hazardLevel}
                          options={HAZARD_OPTIONS}
                          onChange={handleSelect('hazardLevel')}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 mb-1.5">Mức nguy hiểm quyết định màu hộp cảnh báo bên trang khách (vàng / cam / đỏ). Chọn "Không cảnh báo" để ẩn hộp.</p>
                    <RichTextEditor
                      value={form.safetyNote}
                      onChange={handleRich('safetyNote')}
                      placeholder="Cảnh báo an toàn, bảo quản, thời gian cách ly..."
                      minHeight={120}
                      maxChars={3000}
                    />
                  </div>

                  {/* Lưu ý mức độ nguy hiểm */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Lưu ý mức độ nguy hiểm</label>
                    <p className="text-xs text-slate-400 mb-1.5">Nội dung hiển thị kèm cảnh báo theo mức độ nguy hiểm (vd: độc tính, đối tượng cần tránh).</p>
                    <textarea
                      name="hazardNote"
                      value={form.hazardNote}
                      onChange={handleChange}
                      rows={2}
                      className={`${inputCls('hazardNote')} resize-none`}
                      placeholder="Vd: Độc tính cao với người và ong mật, không phun khi cây ra hoa..."
                    />
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                  {/* Trọng lượng / Quy cách */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Trọng lượng / Quy cách
                    </label>
                    <div className="flex gap-2">
                      <input name="weight" type="number" min="0" step="0.1" value={form.weight} onChange={handleChange}
                        className={`${inputCls('weight')} flex-1`} placeholder="0.0" />
                      <Select
                        value={form.weightUnit}
                        options={WEIGHT_UNIT_OPTIONS}
                        onChange={handleSelect('weightUnit')}
                      />
                    </div>
                    {errors.weight && <p className="mt-1 text-sm text-red-500">{errors.weight}</p>}
                  </div>

                  {/* Nhãn nổi bật */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Nhãn nổi bật
                    </label>
                    <input name="badge" type="text" maxLength={50} value={form.badge} onChange={handleChange}
                      className={inputCls('badge')} placeholder="Ví dụ: Mới, Bán chạy..." />
                  </div>

                  {/* Link video nhúng */}
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Link video (nhúng — hiển thị trên trang khách)
                    </label>
                    <input name="videoUrl" type="url" value={form.videoUrl} onChange={handleChange}
                      className={inputCls('videoUrl')} placeholder="https://www.youtube.com/embed/..." />
                  </div>
                </div>
              </div>
            </div>

            {/* ── Right col (1/3) ──────────────────────────────────── */}
            <div className="space-y-6">

              {/* Ảnh sản phẩm */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-lg font-bold flex items-center gap-2 text-slate-800 dark:text-white mb-4">
                  <span className="material-symbols-outlined text-primary">image</span>
                  Ảnh sản phẩm
                </h3>
                <ImageUploader
                  images={form.images}
                  onChange={urls => setForm(prev => ({ ...prev, images: urls }))}
                  max={5}
                />
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
                      options={categoryOptions}
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
            <div className="lg:col-span-3 flex items-center justify-end gap-4 p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-lg mb-4">
              <div className="flex items-center gap-4">
                <button type="button" onClick={() => navigate('/admin/products')}
                  className="px-6 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  Hủy bỏ
                </button>
                <button type="submit" disabled={saving}
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
