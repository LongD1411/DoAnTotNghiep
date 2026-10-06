import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import CustomerLayout from '../../components/customer/CustomerLayout';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import Select from '../../components/common/Select';
import RichTextEditor from '../../components/common/RichTextEditor';
import { createPost, updatePost, getPostById, getForumCategories } from '../../services/postService';
import { toastService, errMsg } from '../../services/toastService';
import { stripHtml, extractContentImages, totalSize, MAX_UPLOAD_BYTES } from '../../utils/richContent';

const CAT_PLACEHOLDER = { value: '', label: 'Chọn chủ đề...' };

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
  const { slug }  = useParams();      // có slug → chế độ sửa bài
  const isEdit    = !!slug;
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({ title: '', catId: '', content: '' });
  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [postId, setPostId] = useState(null); // id bài đang sửa

  // Chủ đề cho dropdown — lấy từ API (id thật để gửi category_id)
  useEffect(() => {
    getForumCategories()
      .then(res => setCategories(res.data.data))
      .catch(() => {});
  }, []);

  // Chế độ sửa: nạp dữ liệu bài hiện có để prefill form
  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    getPostById(slug)
      .then(res => {
        const p = res.data.data;
        setPostId(p.id);
        setForm({ title: p.title ?? '', catId: p.category?.id ?? '', content: p.content ?? '' });
      })
      .catch(err => { toastService.error(errMsg(err)); navigate('/dien-dan'); })
      .finally(() => setLoading(false));
  }, [isEdit, slug, navigate]);

  const categoryOptions = useMemo(
    () => [CAT_PLACEHOLDER, ...categories.map(c => ({ value: c.id, label: c.name }))],
    [categories],
  );

  const validate = (field, value) => {
    const next = { ...errors };
    switch (field) {
      case 'title':
        if (!value.trim())               next.title = 'Tiêu đề không được để trống';
        else if (value.trim().length < 10) next.title = 'Tiêu đề tối thiểu 10 ký tự';
        else if (value.trim().length > 40) next.title = 'Tiêu đề tối đa 40 ký tự';
        else delete next.title;
        break;
      case 'catId':
        if (!value) next.catId = 'Vui lòng chọn chủ đề';
        else delete next.catId;
        break;
      // content: không bắt buộc — không validate
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

  const handleContentChange = (html) => {
    setForm(prev => ({ ...prev, content: html }));
  };

  const isValid = !errors.title && !errors.catId && form.title.trim() && form.catId;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const allValid = ['title', 'catId'].every(f => validate(f, form[f]));
    if (!allValid) return;

    setLoading(true);
    try {
      // Tách ảnh blob → placeholder + files; backend upload khi tạo bài (multipart)
      const { content, files } = await extractContentImages(form.content);

      // Tổng dung lượng ảnh không vượt quá 10MB (nhiều ảnh cộng lại)
      if (totalSize(files) > MAX_UPLOAD_BYTES) {
        toastService.error('Tổng dung lượng ảnh vượt quá 10MB, vui lòng giảm bớt hoặc nén ảnh');
        return;
      }

      // Không có text lẫn ảnh (kể cả URL ảnh cũ khi sửa) → lưu null (content không bắt buộc)
      const finalContent = (!stripHtml(content) && files.length === 0 && !/https?:\/\//.test(content || '')) ? null : content;
      const payload = { title: form.title.trim(), category_id: Number(form.catId), content: finalContent };

      if (isEdit) {
        await updatePost(postId, payload, files);
        toastService.success('Cập nhật bài viết thành công!');
      } else {
        await createPost(payload, files);
        toastService.success('Đăng bài thành công! Bài viết đang chờ duyệt.');
      }
      navigate('/dien-dan');
    } catch (err) {
      toastService.error(errMsg(err));
    } finally {
      setLoading(false);
    }
  };

  const charCount = stripHtml(form.content).length;
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
          <span className="text-[#101b0d] dark:text-white font-medium">{isEdit ? 'Chỉnh sửa bài viết' : 'Tạo bài viết'}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── Form ─────────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            <div className="bg-white dark:bg-[#132210] rounded-xl border border-gray-200 dark:border-[#2a4524] shadow-sm p-6 md:p-8">
              <h1 className="text-2xl font-black text-[#101b0d] dark:text-white mb-6">{isEdit ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}</h1>

              <form onSubmit={handleSubmit} className="flex flex-col gap-6">

                {/* Tiêu đề */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="title" className="text-base font-semibold text-[#101b0d] dark:text-white">
                      Tiêu đề <span className="text-red-500">*</span>
                    </label>
                    <span className={`text-xs ${titleCount > 36 ? 'text-red-400' : 'text-gray-400'}`}>
                      {titleCount}/40
                    </span>
                  </div>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Đặt tiêu đề rõ ràng, mô tả đúng vấn đề của bạn..."
                    maxLength={40}
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
                    options={categoryOptions}
                    onChange={handleCatChange}
                    className="w-full"
                  />
                  {errors.catId && <p className="text-sm text-red-500">{errors.catId}</p>}
                </div>

                {/* Nội dung */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="content" className="text-base font-semibold text-[#101b0d] dark:text-white">
                      Nội dung
                    </label>
                    <span className="text-xs text-gray-400">
                      {charCount} ký tự
                    </span>
                  </div>
                  <RichTextEditor
                    value={form.content}
                    onChange={handleContentChange}
                    enableImages
                    placeholder="Mô tả chi tiết: loại cây, triệu chứng, điều kiện thời tiết... Kéo/thả hoặc dán ảnh vào ô để chèn."
                    minHeight={220}
                  />
                  <p className="text-xs text-gray-400">Kéo/thả hoặc dán ảnh trực tiếp vào ô nội dung — ảnh chỉ được upload lên server khi bạn nhấn "Đăng bài".</p>
                  {errors.content && <p className="text-sm text-red-500">{errors.content}</p>}
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
                    <span className="material-symbols-outlined text-[18px]">{isEdit ? 'save' : 'send'}</span>
                    {isEdit ? 'Cập nhật' : 'Đăng bài'}
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
