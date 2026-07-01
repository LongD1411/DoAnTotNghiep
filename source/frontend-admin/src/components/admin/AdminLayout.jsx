import { Link, useLocation, useNavigate } from 'react-router-dom';
import Toast from '../common/Toast';

const NAV_ITEMS = [
  { label: 'Dashboard',  icon: 'dashboard',    path: '/admin/overview'  },
  { label: 'Đơn hàng',   icon: 'shopping_cart', path: '/admin/orders'    },
  { label: 'Sản phẩm',   icon: 'potted_plant',  path: '/admin/products',   fill: true },
  { label: 'Danh mục',   icon: 'category',      path: '/admin/categories'            },
  { label: 'Tra cứu',    icon: 'menu_book',     path: '/admin/encyclopedia'          },
  { label: 'Cài đặt',    icon: 'settings',      path: '/admin/settings'              },
];

const AdminLayout = ({ children, title = 'AgroAdmin' }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    sessionStorage.removeItem('access_token');
    navigate('/dang-nhap');
  };

  return (
    <div className="admin-layout flex h-screen w-full overflow-hidden bg-[#f6f8f6] text-slate-900 font-display">

      {/* ── Sidebar ──────────────────────────────────────────────────── */}
      <aside className="w-64 bg-[#1B5E20] text-white flex flex-col shrink-0">
        <div className="p-6 flex flex-col gap-8 h-full">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 p-2 rounded-lg">
              <span className="material-symbols-outlined text-primary text-3xl">eco</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-white text-lg font-bold leading-none">AgroAdmin</h1>
              <p className="text-primary text-xs font-medium">Hệ thống quản trị</p>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex flex-col gap-2 flex-1">
            {NAV_ITEMS.map(item => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm ${
                    isActive
                      ? 'bg-primary text-[#1B5E20] font-bold'
                      : 'font-medium hover:bg-white/10'
                  }`}
                >
                  <span
                    className="material-symbols-outlined"
                    style={item.fill && isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                  >
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Profile + Logout */}
          <div className="mt-auto pt-6 border-t border-white/10 flex flex-col gap-4">
            <div className="flex items-center gap-3 px-2">
              <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/30">
                <span className="material-symbols-outlined text-primary">account_circle</span>
              </div>
              <div className="flex flex-col min-w-0">
                <p className="text-sm font-bold truncate">Admin</p>
                <p className="text-xs text-slate-300">Quản lý cấp cao</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors text-sm font-bold"
            >
              <span className="material-symbols-outlined text-lg">logout</span>
              Đăng xuất
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col overflow-y-scroll">
        {children}
      </main>

      <Toast />
    </div>
  );
};

export default AdminLayout;
