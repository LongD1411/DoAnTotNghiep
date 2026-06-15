import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import LoadingOverlay from '../../components/common/LoadingOverlay';
// ── Constants ────────────────────────────────────────────────────────────────

const EMPTY_FORM = {
  name:        '',
  slug:        '',
  description: '',
  imageUrl:    '',
};

const MOCK_EDIT_DATA = {
  1: { name: 'Phân bón',               slug: 'phan-bon',              description: 'Các loại phân bón hóa học và vô cơ',           imageUrl: '' },
  2: { name: 'Thuốc bảo vệ thực vật',  slug: 'thuoc-bao-ve-thuc-vat', description: 'Thuốc trừ sâu, thuốc trừ cỏ đặc trị',          imageUrl: '' },
  3: { name: 'Hạt giống cây trồng',    slug: 'hat-giong-cay-trong',   description: 'Hạt giống F1, hạt giống thuần chủng',           imageUrl: '' },
  4: { name: 'Thuốc trừ nấm',          slug: 'thuoc-tru-nam',         description: 'Nhóm thuốc chuyên trị nấm bệnh cây trồng',      imageUrl: '' },
  5: { name: 'Phân hữu cơ',            slug: 'phan-huu-co',           description: 'Phân compost, phân vi sinh, phân hữu cơ khoáng', imageUrl: '' },
};

const VI_MAP = {'à':'a','á':'a','ả':'a','ã':'a','ạ':'a','ă':'a','ắ':'a','ằ':'a','ẳ':'a','ẵ':'a','ặ':'a','â':'a','ấ':'a','ầ':'a','ẩ':'a','ẫ':'a','ậ':'a','đ':'d','è':'e','é':'e','ẻ':'e','ẽ':'e','ẹ':'e','ê':'e','ế':'e','ề':'e','ể':'e','ễ':'e','ệ':'e','ì':'i','í':'i','ỉ':'i','ĩ':'i','ị':'i','ò':'o','ó':'o','ỏ':'o','õ':'o','ọ':'o','ô':'o','ố':'o','ồ':'o','ổ':'o','ỗ':'o','ộ':'o','ơ':'o','ớ':'o','ờ':'o','ở':'o','ỡ':'o','ợ':'o','ù':'u','ú':'u','ủ':'u','ũ':'u','ụ':'u','ư':'u','ứ':'u','ừ':'u','ử':'u','ữ':'u','ự':'u','ỳ':'y','ý':'y','ỷ':'y','ỹ':'y','ỵ':'y'};
const toSlug = (str) => { let s = str.toLowerCase(); for (const [k,v] of Object.entries(VI_MAP)) s = s.split(k).join(v); return s.replace(/[^a-z0-9\s-]/g,'').trim().replace(/\s+/g,'-').replace(/-+/g,'-'); };

// ── Validation ────────────────────────────────────────────────────────────────

const validateField = (field, value, currentErrors) => {
  const errors = { ...currentErrors };
  if (field === 'name') {
    if (!String(value).trim()) errors.name = 'Tên danh mục không được để trống';
    else delete errors.name;
  }
  if (field === 'imageUrl' && value) {
    try { new URL(value); delete errors.imageUrl; }
    catch { errors.imageUrl = 'URL ảnh không hợp lệ'; }
  } else if (field === 'imageUrl') {
    delete errors.imageUrl;
  }
  return errors;
};

// ── Component ─────────────────────────────────────────────────────────────────

const CategoryFormPage = () => {
  const { id }   = useParams();
  const navigate = useNavigate();
  const isEdit   = !!id;

  const [form,    setForm]    = useState(EMPTY_FORM);
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);
  const [saved,   setSaved]   = useState(false);

  // Load mock data in edit mode
  useEffect(() => {
    if (!isEdit) return;
    const data = MOCK_EDIT_DATA[Number(id)];
    if (data) setForm({ ...EMPTY_FORM, ...data });
  }, [id, isEdit]);

  const handleChange = (field, value) => {
    setForm(prev => {
      const next = { ...prev, [field]: value };
      // Auto-fill slug from name in add mode
      if (field === 'name' && !isEdit) next.slug = toSlug(value);
      return next;
    });
    setErrors(prev => validateField(field, value, prev));
  };

  const hasErrors = Object.keys(errors).length > 0;
  const isEmpty   = !form.name.trim();

  const handleSubmit = async () => {
    // Final validate
    let errs = {};
    errs = validateField('name',     form.name,     errs);
    errs = validateField('imageUrl', form.imageUrl, errs);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    await new Promise(r => setTimeout(r, 600)); // simulate API
    setLoading(false);
    setSaved(true);
    setTimeout(() => navigate('/admin/categories'), 1200);
  };

  return (
    <>
      <LoadingOverlay visible={loading} />
      <AdminLayout>
        <div className="p-6 flex flex-col gap-6 max-w-3xl mx-auto w-full">

          {/* ── Header ─────────────────────────────────────────────────── */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {isEdit ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                {isEdit ? `Đang chỉnh sửa ID #${id}` : 'Tạo danh mục sản phẩm mới trong hệ thống'}
              </p>
            </div>
          </div>

          {/* ── Form ───────────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Left — thông tin */}
            <div className="md:col-span-2 flex flex-col gap-4">

              {/* Thông tin cơ bản */}
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 flex flex-col gap-5">
                <h3 className="font-bold text-slate-800 dark:text-white text-base border-b border-slate-100 dark:border-slate-700 pb-3">
                  Thông tin cơ bản
                </h3>

                {/* Tên */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Tên danh mục <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => handleChange('name', e.target.value)}
                    placeholder="VD: Phân bón hữu cơ"
                    className={`w-full px-3 py-2.5 text-sm border rounded-lg bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors ${
                      errors.name
                        ? 'border-red-400 focus:ring-red-300'
                        : 'border-slate-200 dark:border-slate-600'
                    }`}
                  />
                  {errors.name && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">error</span>
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Slug */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Slug {!isEdit && <span className="text-slate-400 font-normal text-xs ml-1">(tự sinh từ tên)</span>}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono select-none">/</span>
                    <input
                      type="text"
                      value={form.slug}
                      onChange={e => handleChange('slug', e.target.value)}
                      placeholder="phan-bon-huu-co"
                      className="w-full pl-6 pr-3 py-2.5 text-sm font-mono border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors"
                    />
                  </div>
                </div>

                {/* Mô tả */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Mô tả</label>
                  <textarea
                    value={form.description}
                    onChange={e => handleChange('description', e.target.value)}
                    placeholder="Mô tả ngắn về danh mục này..."
                    rows={4}
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                  />
                </div>
              </div>

              {/* Ảnh đại diện */}
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 flex flex-col gap-4">
                <h3 className="font-bold text-slate-800 dark:text-white text-base border-b border-slate-100 dark:border-slate-700 pb-3">
                  Ảnh đại diện
                </h3>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">URL ảnh</label>
                  <input
                    type="text"
                    value={form.imageUrl}
                    onChange={e => handleChange('imageUrl', e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className={`w-full px-3 py-2.5 text-sm border rounded-lg bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/40 ${
                      errors.imageUrl
                        ? 'border-red-400 focus:ring-red-300'
                        : 'border-slate-200 dark:border-slate-600'
                    }`}
                  />
                  {errors.imageUrl && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">error</span>
                      {errors.imageUrl}
                    </p>
                  )}
                  {form.imageUrl && !errors.imageUrl && (
                    <div className="mt-2 w-24 h-24 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-600 bg-slate-100 dark:bg-slate-700">
                      <img
                        src={form.imageUrl}
                        alt="preview"
                        className="w-full h-full object-cover"
                        onError={e => { e.target.style.display = 'none'; }}
                      />
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Right */}
            <div className="flex flex-col gap-4">

              {/* Info card khi edit */}
              {isEdit && (
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                  <p className="text-xs text-slate-500 font-medium mb-2 uppercase tracking-wider">Thông tin</p>
                  <div className="flex flex-col gap-1.5 text-sm text-slate-600 dark:text-slate-400">
                    <div className="flex justify-between">
                      <span>ID</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">#{id}</span>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* ── Footer actions ──────────────────────────────────────────── */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              onClick={() => navigate('/admin/categories')}
              className="px-5 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              Hủy bỏ
            </button>

            <div className="flex items-center gap-3">
              {saved && (
                <span className="flex items-center gap-1.5 text-sm font-semibold text-primary">
                  <span className="material-symbols-outlined text-base">check_circle</span>
                  Đã lưu!
                </span>
              )}
              <button
                onClick={handleSubmit}
                disabled={hasErrors || isEmpty}
                className="px-6 py-2.5 text-sm font-bold bg-[#1B5E20] hover:bg-[#2E7D32] text-white rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
              >
                {isEdit ? 'Cập nhật danh mục' : 'Tạo danh mục'}
              </button>
            </div>
          </div>

        </div>
      </AdminLayout>
    </>
  );
};

export default CategoryFormPage;
