import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import Select from '../../components/common/Select';
import ImageUploader from '../../components/common/ImageUploader';
import RichTextEditor from '../../components/common/RichTextEditor';
import { resolveImages } from '../../services/uploadService';
import { getEntryById, createEntry, updateEntry } from '../../services/encyclopediaService';
import { getAllProducts, getProductById } from '../../services/productService';
import { toastService, errMsg } from '../../services/toastService';

// ── Constants ────────────────────────────────────────────────────────────────

const SEVERITY_OPTIONS = [
  { value: 'NGUY_HIEM',  label: 'Nguy hiểm'  },
  { value: 'NANG',       label: 'Nặng'        },
  { value: 'TRUNG_BINH', label: 'Trung bình'  },
];

const CATEGORY_OPTIONS = [
  { value: 'Côn trùng',   label: 'Côn trùng'   },
  { value: 'Bệnh nấm',    label: 'Bệnh nấm'    },
  { value: 'Vi khuẩn',    label: 'Vi khuẩn'    },
  { value: 'Virus',       label: 'Virus'        },
  { value: 'Tuyến trùng', label: 'Tuyến trùng' },
  { value: 'Nhện hại',    label: 'Nhện hại'     },
];

const CROP_TYPES = ['Lúa & Ngũ cốc', 'Rau màu', 'Cây ăn quả', 'Đậu đỗ', 'Cây công nghiệp', 'Cây gia vị'];

// Char limits
const MAX = { name: 200, latinName: 300, slug: 200 };

const VI_MAP = {'à':'a','á':'a','ả':'a','ã':'a','ạ':'a','ă':'a','ắ':'a','ằ':'a','ẳ':'a','ẵ':'a','ặ':'a','â':'a','ấ':'a','ầ':'a','ẩ':'a','ẫ':'a','ậ':'a','đ':'d','è':'e','é':'e','ẻ':'e','ẽ':'e','ẹ':'e','ê':'e','ế':'e','ề':'e','ể':'e','ễ':'e','ệ':'e','ì':'i','í':'i','ỉ':'i','ĩ':'i','ị':'i','ò':'o','ó':'o','ỏ':'o','õ':'o','ọ':'o','ô':'o','ố':'o','ồ':'o','ổ':'o','ỗ':'o','ộ':'o','ơ':'o','ớ':'o','ờ':'o','ở':'o','ỡ':'o','ợ':'o','ù':'u','ú':'u','ủ':'u','ũ':'u','ụ':'u','ư':'u','ứ':'u','ừ':'u','ử':'u','ữ':'u','ự':'u','ỳ':'y','ý':'y','ỷ':'y','ỹ':'y','ỵ':'y'};
const toSlug = (str) => { let s = str.toLowerCase(); for (const [k,v] of Object.entries(VI_MAP)) s = s.split(k).join(v); return s.replace(/[^a-z0-9\s-]/g,'').trim().replace(/\s+/g,'-').replace(/-+/g,'-'); };

// Convert string[] → HTML ordered list for rich editor load
const toRichHtml = (arr) => {
  if (!arr?.length) return '';
  return `<ol>${arr.map(s => `<li><p>${s}</p></li>`).join('')}</ol>`;
};

// Extract <li> text items from rich HTML (for symptoms/treatment array fields)
const parseListItems = (html) => {
  if (!html) return [];
  const div = document.createElement('div');
  div.innerHTML = html;
  const items = Array.from(div.querySelectorAll('li')).map(li => li.textContent.trim()).filter(Boolean);
  if (items.length) return items;
  return Array.from(div.querySelectorAll('p')).map(p => p.textContent.trim()).filter(Boolean);
};

// Return HTML if has real content, else undefined (for description/conditions text fields)
const toApiHtml = (html) => {
  if (!html) return undefined;
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent.trim() ? html : undefined;
};

const EMPTY_FORM = {
  name:                   '',
  latinName:              '',
  slug:                   '',
  category:               'Côn trùng',
  severity:               'TRUNG_BINH',
  images:                 [],
  description:            '',
  conditions:             '',
  symptoms:               '',
  treatment:              '',
  cropTypes:              [],
  recommendedProductIds:  [],
};

// ── Validation ────────────────────────────────────────────────────────────────

const validateField = (field, value, errs) => {
  const e = { ...errs };
  if (field === 'name') {
    if (!String(value).trim()) e.name = 'Tên không được để trống';
    else delete e.name;
  }
  return e;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const charCounterCls = (len, max) =>
  len >= max ? 'text-red-500' : len >= max * 0.85 ? 'text-amber-500' : 'text-slate-400';

const FieldCounter = ({ value, max }) => (
  <span className={`text-xs ml-auto ${charCounterCls(value.length, max)}`}>
    {value.length}/{max}
  </span>
);

// ── Component ─────────────────────────────────────────────────────────────────

const EncyclopediaFormPage = () => {
  const { id }   = useParams();
  const navigate = useNavigate();
  const isEdit   = !!id;

  const [form,    setForm]    = useState(EMPTY_FORM);
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);

  // Product picker state
  const [productQuery,          setProductQuery]          = useState('');
  const [productResults,        setProductResults]        = useState([]);
  const [searchingProducts,     setSearchingProducts]     = useState(false);
  const [showProductDropdown,   setShowProductDropdown]   = useState(false);
  const [selectedProductDetails, setSelectedProductDetails] = useState([]);
  const productSearchRef = useRef(null);

  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    getEntryById(id)
      .then(res => {
        const e = res.data.data;
        setForm({
          name:                  e.name        ?? '',
          latinName:             e.latin_name  ?? '',
          slug:                  e.slug        ?? '',
          category:              e.category    ?? 'Côn trùng',
          severity:              e.severity    ?? 'TRUNG_BINH',
          images:                e.images?.length ? e.images : [],
          description:           e.description ?? '',
          conditions:            e.conditions  ?? '',
          symptoms:              toRichHtml(e.symptoms),
          treatment:             toRichHtml(e.treatment),
          cropTypes:             e.crop_types  ?? [],
          recommendedProductIds: e.recommended_product_ids ?? [],
        });
        // Load product details for display
        if (e.recommended_product_ids?.length) {
          Promise.all(
            e.recommended_product_ids.map(pid =>
              getProductById(pid).then(r => {
                const p = r.data?.data?.product ?? r.data?.data;
                return p ? { id: p.id, name: p.name, image: p.images?.[0]?.url ?? p.image_url ?? null } : null;
              }).catch(() => null)
            )
          ).then(results => setSelectedProductDetails(results.filter(Boolean)));
        }
      })
      .catch(() => navigate('/admin/encyclopedia'))
      .finally(() => setLoading(false));
  }, [id, isEdit, navigate]);

  const handleChange = (field, value) => {
    setForm(prev => {
      const next = { ...prev, [field]: value };
      if (field === 'name' && !isEdit) next.slug = toSlug(value).slice(0, MAX.slug);
      return next;
    });
    setErrors(prev => validateField(field, value, prev));
  };

  const toggleCrop = (crop) => {
    setForm(prev => ({
      ...prev,
      cropTypes: prev.cropTypes.includes(crop)
        ? prev.cropTypes.filter(c => c !== crop)
        : [...prev.cropTypes, crop],
    }));
  };

  // Debounce product search
  useEffect(() => {
    if (!productQuery.trim()) { setProductResults([]); setShowProductDropdown(false); return; }
    const t = setTimeout(() => {
      setSearchingProducts(true);
      getAllProducts({ search: productQuery.trim(), limit: 8 })
        .then(res => {
          const list = res.data?.data?.data ?? res.data?.data?.products ?? res.data?.data ?? [];
          setProductResults(Array.isArray(list) ? list : []);
          setShowProductDropdown(true);
        })
        .catch(() => setProductResults([]))
        .finally(() => setSearchingProducts(false));
    }, 300);
    return () => clearTimeout(t);
  }, [productQuery]);

  const toggleProduct = (product) => {
    const alreadySelected = form.recommendedProductIds.includes(product.id);
    if (alreadySelected) {
      handleChange('recommendedProductIds', form.recommendedProductIds.filter(pid => pid !== product.id));
      setSelectedProductDetails(prev => prev.filter(p => p.id !== product.id));
    } else {
      handleChange('recommendedProductIds', [...form.recommendedProductIds, product.id]);
      setSelectedProductDetails(prev => [
        ...prev,
        { id: product.id, name: product.name, image: product.images?.[0]?.url ?? product.image_url ?? null },
      ]);
    }
  };

  const removeProduct = (productId) => {
    handleChange('recommendedProductIds', form.recommendedProductIds.filter(pid => pid !== productId));
    setSelectedProductDetails(prev => prev.filter(p => p.id !== productId));
  };

  const hasErrors = Object.keys(errors).length > 0;
  const isEmpty   = !form.name.trim();

  const handleSubmit = async () => {
    let errs = {};
    errs = validateField('name', form.name, errs);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);
    try {
      const resolvedImages = await resolveImages(form.images);
      const payload = {
        name:                    form.name.trim().slice(0, MAX.name),
        latin_name:              form.latinName.trim().slice(0, MAX.latinName) || undefined,
        slug:                    form.slug.trim().slice(0, MAX.slug) || undefined,
        category:                form.category,
        severity:                form.severity,
        description:             toApiHtml(form.description),
        conditions:              toApiHtml(form.conditions),
        images:                  resolvedImages,
        symptoms:                parseListItems(form.symptoms),
        treatment:               parseListItems(form.treatment),
        crop_types:              form.cropTypes,
        recommended_product_ids: form.recommendedProductIds,
        localTime:               new Date().toISOString(),
      };
      if (isEdit) {
        await updateEntry(id, payload);
      } else {
        await createEntry(payload);
      }
      toastService.success(isEdit ? 'Cập nhật thành công' : 'Tạo mới thành công');
      navigate('/admin/encyclopedia');
    } catch (err) {
      toastService.error(errMsg(err));
    } finally {
      setLoading(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <>
      <LoadingOverlay visible={loading} />
      <AdminLayout>
        <div className="p-6 flex flex-col gap-6 max-w-6xl mx-auto w-full">

          {/* ── Header ─────────────────────────────────────────────────── */}
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {isEdit ? 'Chỉnh sửa bài tra cứu' : 'Thêm bài tra cứu mới'}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {isEdit ? `ID #${id}` : 'Tạo bài viết mới trong bách khoa sâu bệnh'}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ── LEFT 2/3 ───────────────────────────────────────────── */}
            <div className="lg:col-span-2 flex flex-col gap-5">

              {/* Thông tin cơ bản */}
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 flex flex-col gap-5">
                <h3 className="font-bold text-slate-800 dark:text-white text-base border-b border-slate-100 dark:border-slate-700 pb-3">Thông tin cơ bản</h3>

                {/* Tên */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Tên sâu/bệnh <span className="text-red-500">*</span>
                    </label>
                    <FieldCounter value={form.name} max={MAX.name} />
                  </div>
                  <input
                    type="text"
                    value={form.name}
                    maxLength={MAX.name}
                    onChange={e => handleChange('name', e.target.value)}
                    placeholder="VD: Sâu keo mùa thu"
                    className={`w-full px-3 py-2.5 text-sm border rounded-lg bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/40 ${errors.name ? 'border-red-400' : 'border-slate-200 dark:border-slate-600'}`}
                  />
                  {errors.name && <p className="text-xs text-red-500 flex items-center gap-1"><span className="material-symbols-outlined text-xs">error</span>{errors.name}</p>}
                </div>

                {/* Tên khoa học */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Tên khoa học (Latin)</label>
                    <FieldCounter value={form.latinName} max={MAX.latinName} />
                  </div>
                  <input
                    type="text"
                    value={form.latinName}
                    maxLength={MAX.latinName}
                    onChange={e => handleChange('latinName', e.target.value)}
                    placeholder="VD: Spodoptera frugiperda"
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/40 italic"
                  />
                </div>

                {/* Slug */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Slug {!isEdit && <span className="text-slate-400 font-normal text-xs ml-1">(tự sinh từ tên)</span>}
                    </label>
                    <FieldCounter value={form.slug} max={MAX.slug} />
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono select-none">/tra-cuu/</span>
                    <input
                      type="text"
                      value={form.slug}
                      maxLength={MAX.slug}
                      onChange={e => handleChange('slug', e.target.value)}
                      placeholder="sau-keo-mua-thu"
                      className="w-full pl-20 pr-3 py-2.5 text-sm font-mono border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                </div>

                {/* Mô tả ngắn */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Mô tả ngắn</label>
                  <p className="text-xs text-slate-400">Tóm tắt hiển thị trên trang chi tiết. Nên ngắn gọn, rõ ràng.</p>
                  <RichTextEditor
                    value={form.description}
                    onChange={html => handleChange('description', html)}
                    placeholder="Tóm tắt ngắn gọn về loại sâu/bệnh này..."
                    minHeight={100}
                    maxChars={800}
                  />
                </div>
              </div>

              {/* Triệu chứng */}
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 flex flex-col gap-3">
                <h3 className="font-bold text-slate-800 dark:text-white text-base border-b border-slate-100 dark:border-slate-700 pb-3">Triệu chứng nhận biết</h3>
                <p className="text-xs text-slate-400">Dùng danh sách có đánh số để liệt kê từng triệu chứng.</p>
                <RichTextEditor
                  value={form.symptoms}
                  onChange={html => handleChange('symptoms', html)}
                  placeholder="Mô tả các triệu chứng nhận biết..."
                  minHeight={160}
                  maxChars={5000}
                />
              </div>

              {/* Điều kiện phát sinh */}
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 flex flex-col gap-3">
                <h3 className="font-bold text-slate-800 dark:text-white text-base border-b border-slate-100 dark:border-slate-700 pb-3">Điều kiện phát sinh</h3>
                <p className="text-xs text-slate-400">Điều kiện thời tiết, môi trường thuận lợi cho dịch hại phát triển.</p>
                <RichTextEditor
                  value={form.conditions}
                  onChange={html => handleChange('conditions', html)}
                  placeholder="Mô tả điều kiện thời tiết, môi trường..."
                  minHeight={140}
                  maxChars={3000}
                />
              </div>

              {/* Cách xử lý */}
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 flex flex-col gap-3">
                <h3 className="font-bold text-slate-800 dark:text-white text-base border-b border-slate-100 dark:border-slate-700 pb-3">Cách xử lý & phòng ngừa</h3>
                <p className="text-xs text-slate-400">Nên dùng danh sách đánh số để dễ theo dõi từng bước.</p>
                <RichTextEditor
                  value={form.treatment}
                  onChange={html => handleChange('treatment', html)}
                  placeholder="Mô tả các biện pháp xử lý và phòng ngừa..."
                  minHeight={160}
                  maxChars={5000}
                />
              </div>

            </div>

            {/* ── RIGHT 1/3 ──────────────────────────────────────────── */}
            <div className="flex flex-col gap-4">

              {/* Phân loại */}
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 flex flex-col gap-4">
                <h3 className="font-bold text-slate-800 dark:text-white text-base border-b border-slate-100 dark:border-slate-700 pb-3">Phân loại</h3>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Loại dịch hại</label>
                  <Select value={form.category} options={CATEGORY_OPTIONS} onChange={v => handleChange('category', v)} className="w-full" />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Mức độ nguy hiểm</label>
                  <Select value={form.severity} options={SEVERITY_OPTIONS} onChange={v => handleChange('severity', v)} className="w-full" />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Loại cây trồng</label>
                  <div className="flex flex-wrap gap-2">
                    {CROP_TYPES.map(crop => (
                      <button
                        key={crop}
                        type="button"
                        onClick={() => toggleCrop(crop)}
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                          form.cropTypes.includes(crop)
                            ? 'bg-primary text-[#1B5E20]'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                        }`}
                      >
                        {crop}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Ảnh */}
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 flex flex-col gap-3">
                <h3 className="font-bold text-slate-800 dark:text-white text-base border-b border-slate-100 dark:border-slate-700 pb-3">Ảnh minh họa</h3>
                <ImageUploader
                  images={form.images}
                  onChange={urls => handleChange('images', urls)}
                  max={5}
                />
              </div>

              {/* Sản phẩm khuyến nghị */}
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 flex flex-col gap-4">
                <h3 className="font-bold text-slate-800 dark:text-white text-base border-b border-slate-100 dark:border-slate-700 pb-3">
                  Sản phẩm khuyến nghị
                </h3>

                {/* Chips đã chọn */}
                {selectedProductDetails.length > 0 && (
                  <div className="flex flex-col gap-2">
                    {selectedProductDetails.map(p => (
                      <div key={p.id} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg px-2.5 py-2 border border-slate-200 dark:border-slate-600">
                        {p.image ? (
                          <img src={p.image} alt={p.name} className="size-8 rounded object-cover shrink-0" />
                        ) : (
                          <div className="size-8 rounded bg-slate-200 dark:bg-slate-600 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[14px] text-slate-400">image</span>
                          </div>
                        )}
                        <span className="text-xs font-medium flex-1 text-slate-700 dark:text-slate-200 line-clamp-2 leading-tight">{p.name}</span>
                        <button
                          type="button"
                          onClick={() => removeProduct(p.id)}
                          className="shrink-0 text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px]">close</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Search input */}
                <div className="relative" ref={productSearchRef}>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                      {searchingProducts
                        ? <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                        : <span className="material-symbols-outlined text-[16px]">search</span>
                      }
                    </span>
                    <input
                      type="text"
                      value={productQuery}
                      onChange={e => setProductQuery(e.target.value)}
                      onFocus={() => productResults.length > 0 && setShowProductDropdown(true)}
                      onBlur={() => setTimeout(() => setShowProductDropdown(false), 150)}
                      placeholder="Tìm tên sản phẩm..."
                      className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>

                  {/* Dropdown results */}
                  {showProductDropdown && productResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl overflow-hidden">
                      <div className="max-h-52 overflow-y-auto">
                        {productResults.map(p => {
                          const isSelected = form.recommendedProductIds.includes(p.id);
                          const img = p.images?.[0]?.url ?? p.image_url;
                          return (
                            <button
                              key={p.id}
                              type="button"
                              onMouseDown={() => toggleProduct(p)}
                              className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-700 ${isSelected ? 'bg-primary/10 dark:bg-primary/10' : ''}`}
                            >
                              {img ? (
                                <img src={img} alt={p.name} className="size-9 rounded object-cover shrink-0" />
                              ) : (
                                <div className="size-9 rounded bg-slate-100 dark:bg-slate-600 flex items-center justify-center shrink-0">
                                  <span className="material-symbols-outlined text-[14px] text-slate-400">image</span>
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-800 dark:text-white line-clamp-1">{p.name}</p>
                                {p.category?.name && (
                                  <p className="text-xs text-slate-400">{p.category.name}</p>
                                )}
                              </div>
                              {isSelected && (
                                <span className="material-symbols-outlined text-primary text-[18px] shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {selectedProductDetails.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-1">Chưa có sản phẩm nào được chọn</p>
                )}
              </div>

              {/* Info edit */}
              {isEdit && (
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                  <p className="text-xs text-slate-500 font-medium mb-2 uppercase tracking-wider">Thông tin</p>
                  <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                    <span>ID</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">#{id}</span>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* ── Footer ─────────────────────────────────────────────────── */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              onClick={() => navigate('/admin/encyclopedia')}
              className="px-5 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              Hủy bỏ
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={handleSubmit}
                disabled={hasErrors || isEmpty || loading}
                className="px-6 py-2.5 text-sm font-bold bg-[#1B5E20] hover:bg-[#2E7D32] text-white rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
              >
                {isEdit ? 'Cập nhật bài viết' : 'Tạo bài viết'}
              </button>
            </div>
          </div>

        </div>
      </AdminLayout>
    </>
  );
};

export default EncyclopediaFormPage;
