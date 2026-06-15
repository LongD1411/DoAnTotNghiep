import { useState } from 'react';
import { register } from '../../services/authService';
import LoadingOverlay from '../../components/common/LoadingOverlay';

const RegisterPage = () => {
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
    terms: false,
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const validateField = (field, value, base = errors) => {
    const next = { ...base };
    switch (field) {
      case 'full_name':
        if (!value.trim()) next.full_name = 'Vui lòng nhập họ và tên';
        else if (value.trim().length > 30) next.full_name = 'Họ và tên tối đa 30 ký tự';
        else delete next.full_name;
        break;
      case 'email':
        if (!value.trim()) next.email = 'Vui lòng nhập email';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) next.email = 'Email không hợp lệ';
        else delete next.email;
        break;
      case 'phone':
        if (!value.trim()) next.phone = 'Vui lòng nhập số điện thoại';
        else if (value.trim().length > 15) next.phone = 'Số điện thoại tối đa 15 ký tự';
        else if (!/^0\d{9}$/.test(value.replace(/\s/g, ''))) next.phone = 'Số điện thoại không hợp lệ';
        else delete next.phone;
        break;
      case 'password':
        if (!value) next.password = 'Vui lòng nhập mật khẩu';
        else if (value.length < 8) next.password = 'Mật khẩu tối thiểu 8 ký tự';
        else delete next.password;
        break;
      case 'confirm_password':
        if (!value) next.confirm_password = 'Vui lòng xác nhận mật khẩu';
        else if (value !== form.password) next.confirm_password = 'Mật khẩu xác nhận không khớp';
        else delete next.confirm_password;
        break;
      case 'terms':
        if (!value) next.terms = 'Bạn cần đồng ý với điều khoản';
        else delete next.terms;
        break;
    }
    return next;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setForm((prev) => ({ ...prev, [name]: val }));
    setErrors((prev) => validateField(name, val, prev));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    // Validate tuần tự, truyền kết quả làm base
    let errs = validateField('full_name', form.full_name, {});
    errs = validateField('email', form.email, errs);
    errs = validateField('phone', form.phone, errs);
    errs = validateField('password', form.password, errs);
    errs = validateField('confirm_password', form.confirm_password, errs);
    errs = validateField('terms', form.terms, errs);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      const res = await register({
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        password: form.password,
      });
      setSuccessMsg(res.data.message);
    } catch (err) {
      setServerError(err.response?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) =>
    `w-full rounded-lg text-[#111b0d] dark:text-white focus:outline-none focus:ring-2 border bg-[#f9fcf8] dark:bg-[#152210] h-12 pr-4 placeholder:text-[#5f9a4c]/60 text-base transition-all ${
      errors[field]
        ? 'border-red-400 focus:ring-red-300'
        : 'border-[#d5e7cf] dark:border-white/10 focus:ring-primary/50'
    }`;

  return (
    <>
    <LoadingOverlay visible={loading} />
    <div className="bg-background-light dark:bg-background-dark min-h-screen flex items-center justify-center font-display p-4 bg-gradient-soft">
      <div className="w-full max-w-[540px] flex flex-col items-center">

        {/* Logo — giống LoginPage */}
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-primary p-2 rounded-lg text-white">
            <span className="material-symbols-outlined text-3xl">agriculture</span>
          </div>
          <h2 className="text-[#111b0d] dark:text-white text-3xl font-extrabold leading-tight tracking-[-0.015em]">
            Nông nghiệp xanh
          </h2>
        </div>

        {/* Card — giống LoginPage */}
        <div className="w-full bg-white dark:bg-[#1c2d16] rounded-xl shadow-xl border border-[#eaf3e7] dark:border-white/10 overflow-hidden">
          <div className="p-8 md:p-10 pb-4">
            <div className="text-center mb-6">
              <h1 className="text-[#111b0d] dark:text-white text-2xl font-bold leading-tight mb-2">
                Đăng Ký Tài Khoản
              </h1>
              <p className="text-[#5f9a4c] dark:text-primary/80 text-base font-normal">
                Gia nhập mạng lưới nông nghiệp công nghệ cao hàng đầu
              </p>
            </div>

            {successMsg && (
              <div className="mb-4 px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-base flex items-center gap-2">
                <span className="material-symbols-outlined text-xl leading-none">check_circle</span>
                {successMsg}
              </div>
            )}

            {serverError && (
              <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-base">
                {serverError}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit} noValidate>

              {/* Họ và tên */}
              <div className="flex flex-col gap-2">
                <label className="text-[#111b0d] dark:text-white text-base font-semibold">Họ và tên</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 leading-none text-[#5f9a4c] text-xl">person</span>
                  <input name="full_name" type="text" value={form.full_name} onChange={handleChange} placeholder="Nguyễn Văn A" maxLength={30} className={`${inputClass('full_name')} pl-12`} />
                </div>
                {errors.full_name && <span className="text-red-500 text-sm">{errors.full_name}</span>}
              </div>

              {/* Email + Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[#111b0d] dark:text-white text-base font-semibold">Email</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 leading-none text-[#5f9a4c] text-xl">mail</span>
                    <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="example@gmail.com" className={`${inputClass('email')} pl-12`} />
                  </div>
                  {errors.email && <span className="text-red-500 text-sm">{errors.email}</span>}
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[#111b0d] dark:text-white text-base font-semibold">Số điện thoại</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 leading-none text-[#5f9a4c] text-xl">call</span>
                    <input name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="09xx xxx xxx" maxLength={15} className={`${inputClass('phone')} pl-12`} />
                  </div>
                  {errors.phone && <span className="text-red-500 text-sm">{errors.phone}</span>}
                </div>
              </div>

              {/* Mật khẩu */}
              <div className="flex flex-col gap-2">
                <label className="text-[#111b0d] dark:text-white text-base font-semibold">Mật khẩu</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 leading-none text-[#5f9a4c] text-xl">lock</span>
                  <input name="password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={handleChange} placeholder="••••••••" className={`${inputClass('password')} pl-12 pr-12`} />
                  <button type="button" onClick={() => setShowPassword((p) => !p)} className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center text-[#5f9a4c] hover:text-primary">
                    <span className="material-symbols-outlined leading-none">{showPassword ? 'visibility' : 'visibility_off'}</span>
                  </button>
                </div>
                {errors.password && <span className="text-red-500 text-sm">{errors.password}</span>}
              </div>

              {/* Xác nhận mật khẩu */}
              <div className="flex flex-col gap-2">
                <label className="text-[#111b0d] dark:text-white text-base font-semibold">Xác nhận mật khẩu</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 leading-none text-[#5f9a4c] text-xl">lock_reset</span>
                  <input name="confirm_password" type={showConfirm ? 'text' : 'password'} value={form.confirm_password} onChange={handleChange} placeholder="••••••••" className={`${inputClass('confirm_password')} pl-12 pr-12`} />
                  <button type="button" onClick={() => setShowConfirm((p) => !p)} className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center text-[#5f9a4c] hover:text-primary">
                    <span className="material-symbols-outlined leading-none">{showConfirm ? 'visibility' : 'visibility_off'}</span>
                  </button>
                </div>
                {errors.confirm_password && <span className="text-red-500 text-sm">{errors.confirm_password}</span>}
              </div>

              {/* Điều khoản */}
              <div className="flex flex-col gap-1 py-1">
                <div className="flex items-center gap-3">
                  <input id="terms" name="terms" type="checkbox" checked={form.terms} onChange={handleChange} className="shrink-0 h-5 w-5 rounded border-[#d5e7cf] text-primary focus:ring-primary bg-[#f9fcf8] cursor-pointer" />
                  <label htmlFor="terms" className="text-base text-[#111b0d] dark:text-white/80 font-medium leading-snug cursor-pointer">
                    Tôi đồng ý với các{' '}
                    <a href="#" className="text-primary font-bold hover:underline">điều khoản và điều kiện</a>
                    {' '}của Nông nghiệp xanh.
                  </label>
                </div>
                {errors.terms && <span className="text-red-500 text-sm">{errors.terms}</span>}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-[#2e940c] disabled:opacity-60 disabled:cursor-not-allowed text-white py-4 rounded-lg font-bold text-lg shadow-lg shadow-primary/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
              >
                <span>{loading ? 'Đang đăng ký...' : 'Đăng ký ngay'}</span>
                {!loading && <span className="material-symbols-outlined leading-none text-xl">arrow_forward</span>}
              </button>

              {/* Login link */}
              <div className="text-center border-t border-[#eaf3e7] dark:border-white/10 pt-5 mt-2">
                <p className="text-[#111b0d] dark:text-white/80 text-base font-medium">
                  Đã có tài khoản?{' '}
                  <a href="/login" className="text-primary font-bold hover:underline ml-1">Đăng nhập</a>
                </p>
              </div>
            </form>
          </div>

        </div>

        {/* Footer links — giống LoginPage */}
        <div className="mt-8 flex gap-6 text-[#5f9a4c] text-base font-medium">
          <a href="#" className="hover:text-primary transition-colors">Điều khoản</a>
          <a href="#" className="hover:text-primary transition-colors">Bảo mật</a>
          <a href="#" className="hover:text-primary transition-colors">Hỗ trợ</a>
        </div>
      </div>
    </div>
    </>
  );
};

export default RegisterPage;
