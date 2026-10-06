import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CustomerLayout from '../../components/customer/CustomerLayout';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import { getProfile, updateProfile, changePassword, logout } from '../../services/authService';
import { getPosts } from '../../services/postService';
import { useCartStore, selectCartCount } from '../../store/useCartStore';
import { toastService, errMsg } from '../../services/toastService';

const initials = (name = '') => name.trim().split(/\s+/).slice(-2).map(w => w[0]).join('').toUpperCase() || '?';
const fmtDate  = (iso) => (iso ? new Date(iso).toLocaleDateString('vi-VN') : '—');

const ROLE_LABEL  = { customer: 'Khách hàng', mod: 'Kiểm duyệt viên', admin: 'Quản trị viên' };
const POST_STATUS = {
  published: { label: 'Công khai',  cls: 'bg-green-100 text-green-700 ring-green-600/20' },
  pending:   { label: 'Chờ duyệt', cls: 'bg-amber-100 text-amber-700 ring-amber-600/20' },
  hidden:    { label: 'Đã ẩn',      cls: 'bg-gray-200 text-gray-600 ring-gray-500/20' },
};

const TABS = [
  { id: 'overview', label: 'Tổng quan',           icon: 'person' },
  { id: 'edit',     label: 'Chỉnh sửa thông tin', icon: 'edit' },
  { id: 'password', label: 'Đổi mật khẩu',        icon: 'lock' },
  { id: 'posts',    label: 'Bài viết của tôi',    icon: 'forum' },
  { id: 'orders',   label: 'Đơn hàng',            icon: 'shopping_bag', disabled: true },
];

const INPUT_CLS = 'w-full rounded-lg border px-4 py-3 text-base text-[#101b0d] dark:text-white bg-[#f9fcf8] dark:bg-[#1c3019] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors';
const border = (err) => (err ? 'border-red-400' : 'border-[#d3e7cf] dark:border-[#3a5c35]');

const ProfilePage = () => {
  const navigate = useNavigate();
  const cartCount = useCartStore(selectCartCount);

  const [profile, setProfile]   = useState(null);
  const [myPosts, setMyPosts]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState('overview');

  // Form sửa thông tin
  const [form, setForm]     = useState({ full_name: '', phone: '' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Form đổi mật khẩu
  const [pwForm, setPwForm]     = useState({ current_password: '', new_password: '', confirm: '' });
  const [pwErrors, setPwErrors] = useState({});
  const [pwSaving, setPwSaving] = useState(false);

  useEffect(() => {
    Promise.all([getProfile(), getPosts({ limit: 100 })])
      .then(([pRes, postsRes]) => {
        const p = pRes.data.data;
        setProfile(p);
        setForm({ full_name: p.name ?? '', phone: p.phone ?? '' });
        setMyPosts(postsRes.data.data.data.filter(post => post.user?.id === p.id));
      })
      .catch(err => toastService.error(errMsg(err)))
      .finally(() => setLoading(false));
  }, []);

  // ── Validate (onChange) ──────────────────────────────────────────────────────
  const validate = (field, value) => {
    const next = { ...errors };
    switch (field) {
      case 'full_name':
        if (!value.trim())                next.full_name = 'Họ tên không được để trống';
        else if (value.trim().length > 30) next.full_name = 'Họ tên tối đa 30 ký tự';
        else delete next.full_name;
        break;
      case 'phone':
        if (value && !/^\d{8,15}$/.test(value)) next.phone = 'Số điện thoại 8–15 chữ số';
        else delete next.phone;
        break;
      default: break;
    }
    setErrors(next);
    return !next[field];
  };

  const validatePw = (field, value, ref = pwForm) => {
    const next = { ...pwErrors };
    switch (field) {
      case 'current_password':
        if (!value) next.current_password = 'Vui lòng nhập mật khẩu hiện tại';
        else delete next.current_password;
        break;
      case 'new_password':
        if (!value)               next.new_password = 'Vui lòng nhập mật khẩu mới';
        else if (value.length < 6) next.new_password = 'Mật khẩu tối thiểu 6 ký tự';
        else delete next.new_password;
        // kiểm tra lại confirm khi mật khẩu mới thay đổi
        if (ref.confirm && ref.confirm !== value) next.confirm = 'Mật khẩu nhập lại không khớp';
        else if (ref.confirm) delete next.confirm;
        break;
      case 'confirm':
        if (value !== ref.new_password) next.confirm = 'Mật khẩu nhập lại không khớp';
        else delete next.confirm;
        break;
      default: break;
    }
    setPwErrors(next);
    return !next[field];
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    validate(name, value);
  };

  const handlePwChange = (e) => {
    const { name, value } = e.target;
    const nextForm = { ...pwForm, [name]: value };
    setPwForm(nextForm);
    validatePw(name, value, nextForm);
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!['full_name', 'phone'].every(f => validate(f, form[f]))) return;
    setSaving(true);
    try {
      const res = await updateProfile({ full_name: form.full_name.trim(), phone: form.phone || null });
      setProfile(res.data.data);
      toastService.success('Cập nhật thông tin thành công');
      setTab('overview');
    } catch (err) {
      toastService.error(errMsg(err));
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const ok = ['current_password', 'new_password', 'confirm'].every(f => validatePw(f, pwForm[f]));
    if (!ok) return;
    setPwSaving(true);
    try {
      await changePassword({ current_password: pwForm.current_password, new_password: pwForm.new_password });
      toastService.success('Đổi mật khẩu thành công');
      setPwForm({ current_password: '', new_password: '', confirm: '' });
      setPwErrors({});
    } catch (err) {
      toastService.error(errMsg(err));
    } finally {
      setPwSaving(false);
    }
  };

  const handleLogout = async () => {
    try { await logout(); } catch { /* token đã được xoá phía client */ }
    useCartStore.getState().reset();
    toastService.success('Đã đăng xuất');
    navigate('/trang-chu');
  };

  const pwValid = !pwErrors.current_password && !pwErrors.new_password && !pwErrors.confirm
    && pwForm.current_password && pwForm.new_password && pwForm.confirm;

  return (
    <CustomerLayout>
      <LoadingOverlay visible={loading} />

      <div className="w-full px-4 md:px-10 lg:px-20 xl:px-40 py-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-6 flex-wrap">
          <Link to="/trang-chu" className="text-[#599a4c] hover:text-primary font-medium transition-colors">Trang chủ</Link>
          <span className="text-[#599a4c]">/</span>
          <span className="text-[#101b0d] dark:text-white font-medium">Tài khoản của tôi</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* ── Sidebar ─────────────────────────────────────────────────── */}
          <aside className="w-full lg:w-72 shrink-0 bg-white dark:bg-[#132210] rounded-xl border border-gray-200 dark:border-[#2a4524] overflow-hidden">
            {/* Avatar + tên */}
            <div className="p-6 flex flex-col items-center gap-3 border-b border-gray-100 dark:border-white/10">
              <div className="size-20 rounded-full bg-[#e9f3e7] dark:bg-primary/20 flex items-center justify-center text-2xl font-black text-[#2E7D32] dark:text-primary">
                {initials(profile?.name)}
              </div>
              <div className="text-center">
                <h1 className="text-base font-bold text-[#101b0d] dark:text-white">{profile?.name ?? '...'}</h1>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#2E7D32] dark:text-primary mt-1">
                  {ROLE_LABEL[profile?.role] ?? ''}
                </p>
              </div>
            </div>

            {/* Nav */}
            <nav className="p-3 flex flex-col gap-1">
              {TABS.map(t => (
                <button
                  key={t.id}
                  onClick={() => !t.disabled && setTab(t.id)}
                  disabled={t.disabled}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors text-left ${
                    tab === t.id
                      ? 'bg-[#e9f3e7] dark:bg-[#2a4524] text-[#2E7D32] dark:text-primary'
                      : t.disabled
                        ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">{t.icon}</span>
                  {t.label}
                  {t.disabled && <span className="ml-auto text-[10px] font-medium text-gray-400 italic">Sắp ra mắt</span>}
                </button>
              ))}
              <div className="h-px bg-gray-100 dark:bg-white/10 my-2" />
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors text-left"
              >
                <span className="material-symbols-outlined text-[20px]">logout</span>
                Đăng xuất
              </button>
            </nav>
          </aside>

          {/* ── Main ────────────────────────────────────────────────────── */}
          <main className="flex-1 min-w-0 w-full flex flex-col gap-6">

            {/* ═══ Tổng quan ═══ */}
            {tab === 'overview' && profile && (
              <>
                <div>
                  <h2 className="text-3xl md:text-4xl font-black tracking-tight text-[#101b0d] dark:text-white">
                    Xin chào, {profile.name}
                  </h2>
                  <p className="text-lg md:text-xl font-medium text-[#599a4c] dark:text-primary/80 mt-1">
                    Quản lý thông tin và hoạt động của bạn tại đây.
                  </p>
                </div>

                {/* Stat tiles */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white dark:bg-[#132210] rounded-xl border border-gray-200 dark:border-[#2a4524] p-5">
                    <p className="text-sm font-semibold uppercase tracking-wide text-gray-400">Bài viết diễn đàn</p>
                    <p className="text-3xl font-black text-[#101b0d] dark:text-white mt-2">{myPosts.length}</p>
                  </div>
                  <div className="bg-white dark:bg-[#132210] rounded-xl border border-gray-200 dark:border-[#2a4524] p-5">
                    <p className="text-sm font-semibold uppercase tracking-wide text-gray-400">Sản phẩm trong giỏ</p>
                    <p className="text-3xl font-black text-[#101b0d] dark:text-white mt-2">{cartCount}</p>
                  </div>
                  <div className="bg-white dark:bg-[#132210] rounded-xl border border-gray-200 dark:border-[#2a4524] p-5">
                    <p className="text-sm font-semibold uppercase tracking-wide text-gray-400">Thành viên từ</p>
                    <p className="text-3xl font-black text-[#101b0d] dark:text-white mt-2">{fmtDate(profile.createdAt)}</p>
                  </div>
                </div>

                {/* Thông tin cá nhân */}
                <div className="bg-white dark:bg-[#132210] rounded-xl border border-gray-200 dark:border-[#2a4524] p-6">
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100 dark:border-white/10">
                    <h3 className="text-lg font-bold text-[#101b0d] dark:text-white">Thông tin cá nhân</h3>
                    <button
                      onClick={() => setTab('edit')}
                      className="group/edit inline-flex items-center gap-1 text-base font-bold text-[#2E7D32] dark:text-primary"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                      <span className="group-hover/edit:underline">Chỉnh sửa</span>
                    </button>
                  </div>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                    <div>
                      <dt className="text-sm text-gray-400">Họ và tên</dt>
                      <dd className="text-base font-semibold text-[#101b0d] dark:text-white mt-0.5">{profile.name}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-400">Email</dt>
                      <dd className="text-base font-semibold text-[#101b0d] dark:text-white mt-0.5">{profile.email}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-400">Số điện thoại</dt>
                      <dd className="text-base font-semibold text-[#101b0d] dark:text-white mt-0.5">{profile.phone || 'Chưa cập nhật'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-400">Vai trò</dt>
                      <dd className="text-base font-semibold text-[#101b0d] dark:text-white mt-0.5">{ROLE_LABEL[profile.role] ?? profile.role}</dd>
                    </div>
                  </dl>
                </div>
              </>
            )}

            {/* ═══ Chỉnh sửa thông tin ═══ */}
            {tab === 'edit' && (
              <div className="bg-white dark:bg-[#132210] rounded-xl border border-gray-200 dark:border-[#2a4524] p-6 md:p-8 max-w-xl">
                <h2 className="text-2xl font-black text-[#101b0d] dark:text-white mb-6">Chỉnh sửa thông tin</h2>
                <form onSubmit={handleSaveProfile} className="flex flex-col gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="full_name" className="text-base font-semibold text-[#101b0d] dark:text-white">Họ và tên</label>
                    <input id="full_name" name="full_name" type="text" maxLength={30}
                      value={form.full_name} onChange={handleChange}
                      className={`${INPUT_CLS} ${border(errors.full_name)}`} />
                    {errors.full_name && <p className="text-sm text-red-500">{errors.full_name}</p>}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="phone" className="text-base font-semibold text-[#101b0d] dark:text-white">Số điện thoại</label>
                    <input id="phone" name="phone" type="tel" maxLength={15} placeholder="Chưa cập nhật"
                      value={form.phone} onChange={handleChange}
                      className={`${INPUT_CLS} ${border(errors.phone)}`} />
                    {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-base font-semibold text-[#101b0d] dark:text-white">Email</label>
                    <input type="email" value={profile?.email ?? ''} disabled
                      className={`${INPUT_CLS} border-[#d3e7cf] dark:border-[#3a5c35] opacity-60 cursor-not-allowed`} />
                    <p className="text-sm text-gray-400">Email dùng để đăng nhập, không thể thay đổi.</p>
                  </div>
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button type="button" onClick={() => setTab('overview')}
                      className="px-5 py-2.5 text-base font-semibold border border-gray-200 dark:border-[#3a5c35] text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                      Hủy
                    </button>
                    <button type="submit" disabled={saving || !!errors.full_name || !!errors.phone || !form.full_name.trim()}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary hover:bg-[#3ed622] text-[#101b0d] text-base font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                      {saving
                        ? <span className="size-4 border-2 border-[#101b0d]/30 border-t-[#101b0d] rounded-full animate-spin" />
                        : <span className="material-symbols-outlined text-[18px]">save</span>}
                      Lưu thay đổi
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ═══ Đổi mật khẩu ═══ */}
            {tab === 'password' && (
              <div className="bg-white dark:bg-[#132210] rounded-xl border border-gray-200 dark:border-[#2a4524] p-6 md:p-8 max-w-xl">
                <h2 className="text-2xl font-black text-[#101b0d] dark:text-white mb-6">Đổi mật khẩu</h2>
                <form onSubmit={handleChangePassword} className="flex flex-col gap-5">
                  {[
                    { name: 'current_password', label: 'Mật khẩu hiện tại' },
                    { name: 'new_password',     label: 'Mật khẩu mới' },
                    { name: 'confirm',          label: 'Nhập lại mật khẩu mới' },
                  ].map(f => (
                    <div key={f.name} className="flex flex-col gap-1.5">
                      <label htmlFor={f.name} className="text-base font-semibold text-[#101b0d] dark:text-white">{f.label}</label>
                      <input id={f.name} name={f.name} type="password"
                        value={pwForm[f.name]} onChange={handlePwChange}
                        className={`${INPUT_CLS} ${border(pwErrors[f.name])}`} />
                      {pwErrors[f.name] && <p className="text-sm text-red-500">{pwErrors[f.name]}</p>}
                    </div>
                  ))}
                  <div className="flex justify-end pt-2">
                    <button type="submit" disabled={pwSaving || !pwValid}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary hover:bg-[#3ed622] text-[#101b0d] text-base font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                      {pwSaving
                        ? <span className="size-4 border-2 border-[#101b0d]/30 border-t-[#101b0d] rounded-full animate-spin" />
                        : <span className="material-symbols-outlined text-[18px]">lock_reset</span>}
                      Đổi mật khẩu
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ═══ Bài viết của tôi ═══ */}
            {tab === 'posts' && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black text-[#101b0d] dark:text-white">Bài viết của tôi ({myPosts.length})</h2>
                  <Link to="/dien-dan/tao-bai" className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-[#3ed622] text-[#101b0d] text-sm font-bold transition-colors">
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    Tạo bài viết
                  </Link>
                </div>

                {myPosts.length === 0 ? (
                  <div className="bg-white dark:bg-[#132210] rounded-xl border border-gray-100 dark:border-[#2a4524] p-10 flex flex-col items-center gap-2 text-gray-400">
                    <span className="material-symbols-outlined text-[40px]">forum</span>
                    <p className="text-sm">Bạn chưa đăng bài viết nào.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {myPosts.map(post => {
                      const st = POST_STATUS[post.status] ?? POST_STATUS.published;
                      return (
                        <div key={post.id} className="bg-white dark:bg-[#132210] rounded-xl border border-gray-200 dark:border-[#2a4524] p-4 flex items-center gap-4 flex-wrap sm:flex-nowrap">
                          <div className="flex-1 min-w-0">
                            <Link to={`/dien-dan/${post.slug}`} className="text-base font-bold text-[#101b0d] dark:text-white hover:text-[#2E7D32] dark:hover:text-primary transition-colors line-clamp-1">
                              {post.title}
                            </Link>
                            <p className="text-xs text-gray-400 mt-1 flex items-center gap-3">
                              <span>{fmtDate(post.created_at)}</span>
                              <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">chat_bubble</span>
                                {post.comment_count ?? 0}
                              </span>
                              <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">visibility</span>
                                {post.view_count ?? 0}
                              </span>
                            </p>
                          </div>
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset shrink-0 ${st.cls}`}>
                            {st.label}
                          </span>
                          <Link to={`/dien-dan/sua/${post.slug}`} title="Chỉnh sửa bài viết"
                            className="flex items-center justify-center size-8 rounded-lg text-[#2E7D32] dark:text-primary hover:bg-primary/10 transition-colors shrink-0">
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </CustomerLayout>
  );
};

export default ProfilePage;
