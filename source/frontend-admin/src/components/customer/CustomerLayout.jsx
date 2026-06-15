import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const NAV_LINKS = [
  { label: 'Tra cứu',   href: '/tra-cuu' },
  { label: 'Cửa hàng',  href: '/san-pham' },
  { label: 'Công nghệ', href: '#' },
  { label: 'Diễn đàn',  href: '/dien-dan' },
  { label: 'Giới thiệu', href: '/gioi-thieu' },
];

const CustomerLayout = ({ children, searchValue, onSearchChange }) => {
  const navigate = useNavigate();
  const [localSearch, setLocalSearch] = useState('');

  const isControlled = onSearchChange !== undefined;
  const search    = isControlled ? searchValue : localSearch;
  const setSearch = isControlled ? onSearchChange : setLocalSearch;

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !isControlled && localSearch.trim()) {
      navigate(`/san-pham?q=${encodeURIComponent(localSearch.trim())}`);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-[#101b0d] dark:text-white font-display flex flex-col min-h-screen">

      {/* ── Navbar ───────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full border-b border-[#e9f3e7] dark:border-white/10 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm">
        <div className="px-4 md:px-10 lg:px-20 xl:px-40 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <Link to="/trang-chu" className="flex items-center gap-2 text-[#101b0d] dark:text-white group">
              <div className="size-8 flex items-center justify-center text-[#2E7D32] dark:text-primary transition-transform group-hover:scale-110">
                <span className="material-symbols-outlined text-[32px]">spa</span>
              </div>
              <h2 className="text-[#2E7D32] dark:text-white text-xl font-black tracking-tight">Nông nghiệp xanh</h2>
            </Link>
            <nav className="hidden lg:flex items-center gap-8">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-[#101b0d] dark:text-gray-200 text-base font-medium hover:text-[#2E7D32] dark:hover:text-primary transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          <div className="flex flex-1 justify-end gap-4 md:gap-8 items-center">
            {/* Search */}
            <label className="hidden md:flex flex-col min-w-40 h-10 w-full max-w-64">
              <div className="flex w-full flex-1 items-stretch rounded-lg h-full bg-[#e9f3e7] dark:bg-white/10 border-transparent focus-within:ring-2 focus-within:ring-primary transition-all">
                <div className="flex items-center justify-center pl-4 rounded-l-lg">
                  <span className="material-symbols-outlined text-[#599a4c] dark:text-primary/70 text-[20px]">search</span>
                </div>
                <input
                  className="w-full bg-transparent border-none text-sm text-[#101b0d] dark:text-white placeholder:text-[#599a4c] dark:placeholder:text-gray-400 focus:ring-0 outline-none px-3 h-full rounded-r-lg"
                  placeholder="Tìm sản phẩm..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
            </label>

            {/* Action icons */}
            <div className="flex gap-3">
              <button className="flex items-center justify-center rounded-full h-10 w-10 bg-[#e9f3e7] dark:bg-white/10 hover:bg-primary hover:text-black dark:hover:bg-primary dark:hover:text-black transition-colors text-[#101b0d] dark:text-white">
                <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
              </button>
              <Link
                to="/dang-nhap"
                className="flex items-center justify-center rounded-full h-10 w-10 bg-[#e9f3e7] dark:bg-white/10 hover:bg-primary hover:text-black dark:hover:bg-primary dark:hover:text-black transition-colors text-[#101b0d] dark:text-white"
              >
                <span className="material-symbols-outlined text-[20px]">account_circle</span>
              </Link>
              <button className="lg:hidden flex items-center justify-center rounded-full h-10 w-10 bg-[#e9f3e7] dark:bg-white/10 text-[#101b0d] dark:text-white">
                <span className="material-symbols-outlined text-[20px]">menu</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Page content ─────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col">
        {children}
      </main>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className="bg-white dark:bg-background-dark border-t border-[#e9f3e7] dark:border-white/10 py-8 px-4 md:px-10 lg:px-20 xl:px-40">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">© 2024 Nông nghiệp xanh. Bảo lưu mọi quyền.</p>
          <div className="flex gap-6">
            <a href="#" className="text-gray-500 hover:text-[#2E7D32] dark:hover:text-primary text-sm">Chính sách bảo mật</a>
            <a href="#" className="text-gray-500 hover:text-[#2E7D32] dark:hover:text-primary text-sm">Điều khoản dịch vụ</a>
            <a href="#" className="text-gray-500 hover:text-[#2E7D32] dark:hover:text-primary text-sm">Hỗ trợ</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CustomerLayout;
