import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CustomerLayout from '../../components/customer/CustomerLayout';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import Select from '../../components/common/Select';

const CATEGORY_OPTIONS = [
  { value: '',        label: 'Chọn chủ đề...' },
  { value: 'pest',    label: 'Sâu & Bệnh'      },
  { value: 'tips',    label: 'Mẹo Nông Nghiệp' },
  { value: 'general', label: 'Chung'            },
];

const GUIDELINES = [
  { icon: 'check_circle', text: 'Tiêu đề rõ ràng, mô tả đúng vấn đề.' },
  { icon: 'check_circle', text: 'Chọn đúng chủ đề để dễ tìm kiếm.' },
  { icon: 'check_circle', text: 'Mô tả chi tiết: loại cây, triệu chứng, điều kiện thời tiết...' },
  { icon: 'check_circle', text: 'Đính kèm ảnh nếu có để nhận tư vấn chính xác hơn.' },
  { icon: 'cancel',       text: 'Không đăng quảng cáo hoặc nội dung không liên quan.' },
  { icon: 'cancel',       text: 'Không đăng lại bài đã có sẵn trong diễn đàn.' },
];

const CreatePostPage = () => {
  const navigate  = useNavigate();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({ title: '', catId: '', content: '', tags: '' });
  const [errors, setErrors] = useState({});
  const [tagInput, setTagInput] = useState('');
  const [tagList, setTagList]   = useState([]);

  const validate = (field, value) => {
    const next = { ...errors };
    switch (field) {
      case 'title':
        if (!value.trim())               next.title = 'Tiêu đề không được để trống';
        else if (value.trim().length < 10) next.title = 'Tiêu đề tối thiểu 10 ký tự';
        else if (value.trim().length > 200) next.title = 'Tiêu đề tối đa 200 ký tự';
        else delete next.title;
        break;
      case 'catId':
        if (!value) next.catId = 'Vui lòng chọn chủ đề';
        else delete next.catId;
        break;
      case 'content':
        if (!value.trim())                next.content = 'Nội dung không được để trống';
        else if (value.trim().length < 50) next.content = 'Nội dung tối thiểu 50 ký tự';
        else delete next.content;
        break;
      default: break;
    }
    setErrors(next);
    return !next[field];
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    validate(name, value);
  };

  const handleCatChange = (val) => {
    setForm(prev => ({ ...prev, catId: val }));
    validate('catId', val);
  };

  const addTag = () => {
    const t = tagInput.trim().replace(/^#/, '');
    if (t && !tagList.includes(t) && tagList.length < 5) {
      setTagList(prev => [...prev, t]);
    }
    setTagInput('');
  };

  const removeTag = (t) => setTagList(prev => prev.filter(x => x !== t));

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); }
  };

  const isValid = !errors.title && !errors.catId && !errors.content
    && form.title.trim() && form.catId && form.content.trim();

  const handleSubmit = (e) => {
    e.preventDefault();
    const allValid = ['title', 'catId', 'content'].every(f => validate(f, form[f]));
    if (!allValid) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert('Bài viết đã được đăng (demo)');
      navigate('/dien-dan');
    }, 800);
    // Khi có API: axios.post(`${API_URL}/posts`, { ...form, tags: tagList, localTime: new Date().toISOString() }, getAuthHeader())
  };

  const charCount = form.content.length;
  const titleCount = form.title.length;

  return (
    <CustomerLayout>
      <LoadingOverlay visible={loading} />

      <div className="w-full px-4 md:px-10 lg:px-20 xl:px-40 py-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-6 flex-wrap">
          <Link to="/trang-chu" className="text-[#599a4c] hover:text-primary font-medium transition-colors">Trang chủ</Link>
          <span className="text-[#599a4c]">/</span>
          <Link to="/dien-dan" className="text-[#599a4c] hover:text-primary font-medium transition-colors">Diễn đàn</Link>
          <span className="text-[#599a4c]">/</span>
          <span className="text-[#101b0d] dark:text-white font-medium">Tạo bài viết</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── Form ─────────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            <div className="bg-white dark:bg-[#132210] rounded-xl border border-gray-200 dark:border-[#2a4524] shadow-sm p-6 md:p-8">
              <h1 className="text-2xl font-black text-[#101b0d] dark:text-white mb-6">Tạo bài viết mới</h1>

              <form onSubmit={handleSubmit} className="flex flex-col gap-6">

                {/* Tiêu đề */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="title" className="text-base font-semibold text-[#101b0d] dark:text-white">
                      Tiêu đề <span className="text-red-500">*</span>
                    </label>
                    <span className={`text-xs ${titleCount > 180 ? 'text-red-400' : 'text-gray-400'}`}>
                      {titleCount}/200
                    </span>
                  </div>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Đặt tiêu đề rõ ràng, mô tả đúng vấn đề của bạn..."
                    maxLength={200}
                    className={`w-full rounded-lg border px-4 py-3 text-base text-[#101b0d] dark:text-white bg-[#f9fcf8] dark:bg-[#1c3019] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors ${
                      errors.title ? 'border-red-400' : 'border-[#d3e7cf] dark:border-[#3a5c35]'
                    }`}
                  />
                  {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                </div>

                {/* Chủ đề */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-base font-semibold text-[#101b0d] dark:text-white">
                    Chủ đề <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={form.catId}
                    options={CATEGORY_OPTIONS}
                    onChange={handleCatChange}
                    className="w-full"
                  />
                  {errors.catId && <p className="text-sm text-red-500">{errors.catId}</p>}
                </div>

                {/* Nội dung */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="content" className="text-base font-semibold text-[#101b0d] dark:text-white">
                      Nội dung <span className="text-red-500">*</span>
                    </label>
                    <span className={`text-xs ${charCount < 50 && charCount > 0 ? 'text-orange-400' : 'text-gray-400'}`}>
                      {charCount} ký tự {charCount < 50 ? `(cần thêm ${50 - charCount})` : ''}
                    </span>
                  </div>
                  <textarea
                    id="content"
                    name="content"
                    rows={10}
                    value={form.content}
                    onChange={handleChange}
                    placeholder="Mô tả chi tiết vấn đề: loại cây trồng, triệu chứng bệnh, điều kiện thời tiết, những gì bạn đã thử... Càng chi tiết, câu trả lời càng chính xác."
                    className={`w-full rounded-lg border px-4 py-3 text-base text-[#101b0d] dark:text-white bg-[#f9fcf8] dark:bg-[#1c3019] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y transition-colors ${
                      errors.content ? 'border-red-400' : 'border-[#d3e7cf] dark:border-[#3a5c35]'
                    }`}
                  />
                  {errors.content && <p className="text-sm text-red-500">{errors.content}</p>}
                </div>

                {/* Tags */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="tags" className="text-base font-semibold text-[#101b0d] dark:text-white">
                    Tags <span className="text-sm font-normal text-gray-400">(tuỳ chọn, tối đa 5)</span>
                  </label>

                  {/* Tag chips */}
                  {tagList.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {tagList.map(t => (
                        <span key={t} className="inline-flex items-center gap-1 rounded-md bg-[#e9f3e7] dark:bg-[#2a4524] px-2.5 py-1 text-sm font-medium text-[#2E7D32] dark:text-primary">
                          #{t}
                          <button type="button" onClick={() => removeTag(t)} className="ml-0.5 hover:text-red-500 transition-colors">
                            <span className="material-symbols-outlined text-[14px]">close</span>
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {tagList.length < 5 && (
                    <div className="flex gap-2">
                      <input
                        id="tags"
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleTagKeyDown}
                        placeholder='Nhập tag rồi nhấn Enter (vd: ngô, lúa...)'
                        className="flex-1 rounded-lg border border-[#d3e7cf] dark:border-[#3a5c35] px-4 py-2.5 text-sm text-[#101b0d] dark:text-white bg-[#f9fcf8] dark:bg-[#1c3019] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={addTag}
                        disabled={!tagInput.trim()}
                        className="px-4 py-2.5 rounded-lg bg-[#e9f3e7] dark:bg-white/10 text-[#2E7D32] dark:text-primary hover:bg-[#2E7D32] hover:text-white dark:hover:bg-[#2E7D32] transition-colors text-sm font-bold disabled:opacity-40"
                      >
                        Thêm
                      </button>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                  <Link
                    to="/dien-dan"
                    className="flex items-center gap-1.5 text-base text-gray-500 hover:text-[#2E7D32] dark:hover:text-primary transition-colors font-medium"
                  >
                    <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                    Huỷ
                  </Link>
                  <button
                    type="submit"
                    disabled={!isValid || loading}
                    className="flex items-center gap-2 px-8 py-3 rounded-lg bg-primary hover:bg-[#3ed622] text-[#101b0d] font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[18px]">send</span>
                    Đăng bài
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* ── Sidebar ──────────────────────────────────────────────── */}
          <aside className="w-full lg:w-72 shrink-0 flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">

            {/* Guidelines */}
            <div className="bg-white dark:bg-[#132210] rounded-xl border border-gray-200 dark:border-[#2a4524] p-5 flex flex-col gap-4">
              <h3 className="text-base font-bold text-[#101b0d] dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-[#599a4c] text-[20px]">info</span>
                Hướng dẫn đăng bài
              </h3>
              <ul className="flex flex-col gap-3">
                {GUIDELINES.map((g, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className={`material-symbols-outlined text-[18px] shrink-0 mt-0.5 ${g.icon === 'check_circle' ? 'text-[#2E7D32] dark:text-primary' : 'text-red-400'}`}
                      style={{ fontVariationSettings: "'FILL' 1" }}>
                      {g.icon}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-300">{g.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Nội quy */}
            <div className="bg-[#e9f3e7] dark:bg-[#1a2e16] rounded-xl border border-[#d3e7cf] dark:border-[#2a4524] p-5 flex flex-col gap-3">
              <h3 className="text-sm font-bold text-[#2E7D32] dark:text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">gavel</span>
                Nhớ đọc nội quy
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                Mọi bài viết vi phạm nội quy sẽ bị xoá. Tài khoản vi phạm nhiều lần sẽ bị khoá.
              </p>
              <Link to="/dien-dan/1-noi-quy-dien-dan" className="text-base font-bold text-primary hover:underline flex items-center gap-1">
                Đọc nội quy <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </CustomerLayout>
  );
};

export default CreatePostPage;
