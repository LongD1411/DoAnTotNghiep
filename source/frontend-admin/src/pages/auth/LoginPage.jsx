import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../services/authService';
import LoadingOverlay from '../../components/common/LoadingOverlay';

const LoginPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', rememberMe: false });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const validateField = (field, value, base = errors) => {
    const next = { ...base };
    if (field === 'email') {
      if (!value.trim()) next.email = 'Vui lòng nhập email';
      else delete next.email;
    }
    if (field === 'password') {
      if (!value) next.password = 'Vui lòng nhập mật khẩu';
      else if (value.length < 6) next.password = 'Mật khẩu tối thiểu 6 ký tự';
      else delete next.password;
    }
    return next;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setForm((prev) => ({ ...prev, [name]: val }));
    if (type !== 'checkbox') setErrors((prev) => validateField(name, val, prev));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    // Validate tất cả field tuần tự, truyền kết quả làm base cho lần kế tiếp
    const e1 = validateField('email', form.email, {});
    const e2 = validateField('password', form.password, e1);
    setErrors(e2);
    if (Object.keys(e2).length > 0) return;

    setLoading(true);
    try {
const res = await login(form.email, form.password);
      const { access_token, refresh_token } = res.data.data;
      const storage = form.rememberMe ? localStorage : sessionStorage;
      storage.setItem('access_token', access_token);
      storage.setItem('refresh_token', refresh_token);
      navigate('/admin/overview');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const hasErrors = Object.keys(errors).length > 0;


  return (
    <>
    <LoadingOverlay visible={loading} />
    <div className="bg-background-light dark:bg-background-dark min-h-screen flex items-center justify-center font-display p-4 bg-gradient-soft">
      <div className="w-full max-w-[480px] flex flex-col items-center">

        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-primary p-2 rounded-lg text-white">
            <span className="material-symbols-outlined text-3xl">agriculture</span>
          </div>
          <h2 className="text-[#111b0d] dark:text-white text-3xl font-extrabold leading-tight tracking-[-0.015em]">
            Nông nghiệp xanh
          </h2>
        </div>

        {/* Card */}
        <div className="w-full bg-white dark:bg-[#1c2d16] rounded-xl shadow-xl border border-[#eaf3e7] dark:border-white/10 p-8 md:p-10">

          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-[#111b0d] dark:text-white text-2xl font-bold leading-tight mb-2">
              Đăng Nhập Hệ Thống
            </h1>
            <p className="text-[#5f9a4c] dark:text-primary/80 text-base font-normal">
              Chào mừng trở lại! Vui lòng nhập thông tin của bạn.
            </p>
          </div>

          {/* Server error */}
          {serverError && (
            <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-base">
              {serverError}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit} noValidate>

            {/* Email */}
            <div className="flex flex-col gap-2">
              <label className="text-[#111b0d] dark:text-white text-base font-semibold">
                Email
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 leading-none text-[#5f9a4c] text-xl">
                  mail
                </span>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="example@agroshop.vn"
                  className={`w-full pl-12 pr-4 py-3.5 rounded-lg border bg-[#f9fcf8] dark:bg-[#152210] text-[#111b0d] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-[#5f9a4c]/60 ${
                    errors.email
                      ? 'border-red-400 focus:ring-red-300'
                      : 'border-[#d5e7cf] dark:border-white/10'
                  }`}
                />
              </div>
              {errors.email && (
                <span className="text-red-500 text-sm mt-0.5">{errors.email}</span>
              )}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <label className="text-[#111b0d] dark:text-white text-base font-semibold">
                Mật khẩu
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 leading-none text-[#5f9a4c] text-xl">
                  lock
                </span>
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full pl-12 pr-12 py-3.5 rounded-lg border bg-[#f9fcf8] dark:bg-[#152210] text-[#111b0d] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-[#5f9a4c]/60 ${
                    errors.password
                      ? 'border-red-400 focus:ring-red-300'
                      : 'border-[#d5e7cf] dark:border-white/10'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center text-[#5f9a4c] hover:text-primary"
                >
                  <span className="material-symbols-outlined leading-none">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              {errors.password && (
                <span className="text-red-500 text-sm mt-0.5">{errors.password}</span>
              )}
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between py-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  name="rememberMe"
                  type="checkbox"
                  checked={form.rememberMe}
                  onChange={handleChange}
                  className="w-5 h-5 rounded border-[#d5e7cf] text-primary focus:ring-primary bg-[#f9fcf8]"
                />
                <span className="text-base text-[#111b0d] dark:text-white/80 font-medium group-hover:text-primary transition-colors">
                  Ghi nhớ đăng nhập
                </span>
              </label>
              <a href="#" className="text-base font-bold text-primary hover:underline">
                Quên mật khẩu?
              </a>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || hasErrors}
              className="w-full bg-primary hover:bg-[#2e940c] disabled:opacity-60 disabled:cursor-not-allowed text-white py-4 rounded-lg font-bold text-lg shadow-lg shadow-primary/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#eaf3e7] dark:border-white/10" />
            </div>
            <div className="relative flex justify-center text-sm uppercase">
              <span className="bg-white dark:bg-[#1c2d16] px-2 text-[#5f9a4c]">
                Hoặc tiếp tục với
              </span>
            </div>
          </div>

          {/* Social buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              className="flex items-center justify-center gap-2 py-2.5 px-4 border border-[#d5e7cf] dark:border-white/10 rounded-lg hover:bg-[#f9fcf8] dark:hover:bg-white/5 transition-all"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span className="text-base font-semibold text-[#111b0d] dark:text-white">Google</span>
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2 py-2.5 px-4 border border-[#d5e7cf] dark:border-white/10 rounded-lg hover:bg-[#f9fcf8] dark:hover:bg-white/5 transition-all"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.885v2.27h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
              </svg>
              <span className="text-base font-semibold text-[#111b0d] dark:text-white">Facebook</span>
            </button>
          </div>

          {/* Register link */}
          <div className="mt-8 text-center border-t border-[#eaf3e7] dark:border-white/10 pt-6">
            <p className="text-[#111b0d] dark:text-white/80 text-base font-medium">
              Bạn chưa có tài khoản?{' '}
              <a href="/register" className="text-primary font-bold hover:underline ml-1">
                Đăng ký ngay
              </a>
            </p>
          </div>
        </div>

        {/* Footer */}
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

export default LoginPage;
