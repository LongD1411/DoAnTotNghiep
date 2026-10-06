import { Routes, Route, Navigate } from 'react-router-dom';
import { getCurrentUser } from '../services/authService';
import LoginPage from '../pages/auth/LoginPage';

// ── Thêm import page mới ở đây ──────────────────────────────────────────────
import RegisterPage      from '../pages/auth/RegisterPage';
import HomePage          from '../pages/customer/HomePage';
import EncyclopediaPage       from '../pages/customer/EncyclopediaPage';
import EncyclopediaDetailPage from '../pages/customer/EncyclopediaDetailPage';
import AdminOverviewPage  from '../pages/admin/OverviewPage';
import AdminProductsPage  from '../pages/admin/ProductsPage';
import AdminOrdersPage    from '../pages/admin/OrdersPage';
import AdminProductFormPage from '../pages/admin/ProductFormPage';
import AdminEditOrderPage    from '../pages/admin/EditOrderPage';
import AdminCategoriesPage   from '../pages/admin/CategoriesPage';
import AdminCategoryFormPage    from '../pages/admin/CategoryFormPage';
import AdminEncyclopediaPage    from '../pages/admin/EncyclopediaAdminPage';
import AdminEncyclopediaFormPage from '../pages/admin/EncyclopediaFormPage';
import AdminNotificationsPage   from '../pages/admin/NotificationsPage';
import CatalogPage        from '../pages/customer/CatalogPage';
import ProductDetailPage  from '../pages/customer/ProductDetailPage';
import CartPage           from '../pages/customer/CartPage';
import ProfilePage        from '../pages/customer/ProfilePage';
import CheckoutPage       from '../pages/customer/CheckoutPage';
// import DashboardPage      from '../pages/customer/DashboardPage';
import ForumPage          from '../pages/customer/ForumPage';
import ForumPostPage      from '../pages/customer/ForumPostPage';
import ForumModeratePage  from '../pages/customer/ForumModeratePage';
import CreatePostPage     from '../pages/customer/CreatePostPage';
import AboutPage          from '../pages/customer/AboutPage';
// ────────────────────────────────────────────────────────────────────────────

const isAuthenticated = () =>
  !!(localStorage.getItem('access_token') || sessionStorage.getItem('access_token'));

const PrivateRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/dang-nhap" replace />;
};

// Guard theo vai trò: chưa đăng nhập -> về login; sai quyền -> về trang chủ.
const RoleRoute = ({ children, allow }) => {
  if (!isAuthenticated()) return <Navigate to="/dang-nhap" replace />;
  const role = getCurrentUser()?.role;
  return allow.includes(role) ? children : <Navigate to="/trang-chu" replace />;
};

const AppRouter = () => (
  <Routes>
    {/* ── Public ── */}
    <Route path="/dang-nhap"           element={<LoginPage />} />
    <Route path="/dang-ky"        element={<RegisterPage />} />
    <Route path="/trang-chu"  element={<HomePage />} />
    <Route path="/tra-cuu"           element={<EncyclopediaPage />} />
    <Route path="/tra-cuu/:slug"       element={<EncyclopediaDetailPage />} />
    <Route path="/san-pham"   element={<CatalogPage />} />
    
    {/* ── Admin (chỉ role admin) ── */}
    <Route path="/admin/overview"   element={<RoleRoute allow={['admin']}><AdminOverviewPage /></RoleRoute>} />
    <Route path="/admin/products"   element={<RoleRoute allow={['admin']}><AdminProductsPage /></RoleRoute>} />
    <Route path="/admin/orders"     element={<RoleRoute allow={['admin']}><AdminOrdersPage /></RoleRoute>} />
    <Route path="/admin/add-product"         element={<RoleRoute allow={['admin']}><AdminProductFormPage /></RoleRoute>} />
    <Route path="/admin/edit-product/:id"   element={<RoleRoute allow={['admin']}><AdminProductFormPage /></RoleRoute>} />
    <Route path="/admin/edit-order/:id"       element={<RoleRoute allow={['admin']}><AdminEditOrderPage /></RoleRoute>} />
    <Route path="/admin/categories"           element={<RoleRoute allow={['admin']}><AdminCategoriesPage /></RoleRoute>} />
    <Route path="/admin/add-category"         element={<RoleRoute allow={['admin']}><AdminCategoryFormPage /></RoleRoute>} />
    <Route path="/admin/edit-category/:id"    element={<RoleRoute allow={['admin']}><AdminCategoryFormPage /></RoleRoute>} />
    <Route path="/admin/encyclopedia"          element={<RoleRoute allow={['admin']}><AdminEncyclopediaPage /></RoleRoute>} />
    <Route path="/admin/encyclopedia/add"     element={<RoleRoute allow={['admin']}><AdminEncyclopediaFormPage /></RoleRoute>} />
    <Route path="/admin/encyclopedia/edit/:id" element={<RoleRoute allow={['admin']}><AdminEncyclopediaFormPage /></RoleRoute>} />
    <Route path="/admin/notifications"        element={<RoleRoute allow={['admin']}><AdminNotificationsPage /></RoleRoute>} />

    {/* ── Customer (cần đăng nhập) ── */}
    <Route path="/san-pham/:slug" element={<ProductDetailPage />} />
    <Route path="/gio-hang"  element={<CartPage />} />
    <Route path="/tai-khoan" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
    <Route path="/checkout"  element={<PrivateRoute><CheckoutPage /></PrivateRoute>} />
    <Route path="/dashboard" element={<PrivateRoute><div>Dashboard — coming soon</div></PrivateRoute>} />
    <Route path="/gioi-thieu"           element={<AboutPage />} />
    <Route path="/dien-dan"            element={<ForumPage />} />
    <Route path="/dien-dan/tao-bai"   element={<CreatePostPage />} />
    <Route path="/dien-dan/sua/:slug" element={<PrivateRoute><CreatePostPage /></PrivateRoute>} />
    <Route path="/dien-dan/kiem-duyet" element={<RoleRoute allow={['mod', 'admin']}><ForumModeratePage /></RoleRoute>} />
    <Route path="/dien-dan/:slug"     element={<ForumPostPage />} />

    {/* ── Fallback ── */}
    <Route path="/"  element={<Navigate to="/dang-nhap" replace />} />
    <Route path="*"  element={<Navigate to="/dang-nhap" replace />} />
  </Routes>
);

export default AppRouter;
