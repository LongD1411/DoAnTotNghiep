import { Routes, Route, Navigate } from 'react-router-dom';
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
// import CheckoutPage       from '../pages/customer/CheckoutPage';
// import DashboardPage      from '../pages/customer/DashboardPage';
import ForumPage          from '../pages/customer/ForumPage';
import ForumPostPage      from '../pages/customer/ForumPostPage';
import CreatePostPage     from '../pages/customer/CreatePostPage';
import AboutPage          from '../pages/customer/AboutPage';
// ────────────────────────────────────────────────────────────────────────────

const isAuthenticated = () =>
  !!(localStorage.getItem('access_token') || sessionStorage.getItem('access_token'));

const PrivateRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/dang-nhap" replace />;
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
    
    {/* ── Admin (cần đăng nhập) ── */}
    <Route path="/admin/overview"   element={<PrivateRoute><AdminOverviewPage /></PrivateRoute>} />
    <Route path="/admin/products"   element={<PrivateRoute><AdminProductsPage /></PrivateRoute>} />
    <Route path="/admin/orders"     element={<PrivateRoute><AdminOrdersPage /></PrivateRoute>} />
    <Route path="/admin/add-product"         element={<PrivateRoute><AdminProductFormPage /></PrivateRoute>} />
    <Route path="/admin/edit-product/:id"   element={<PrivateRoute><AdminProductFormPage /></PrivateRoute>} />
    <Route path="/admin/edit-order/:id"       element={<PrivateRoute><AdminEditOrderPage /></PrivateRoute>} />
    <Route path="/admin/categories"           element={<PrivateRoute><AdminCategoriesPage /></PrivateRoute>} />
    <Route path="/admin/add-category"         element={<PrivateRoute><AdminCategoryFormPage /></PrivateRoute>} />
    <Route path="/admin/edit-category/:id"    element={<PrivateRoute><AdminCategoryFormPage /></PrivateRoute>} />
    <Route path="/admin/encyclopedia"          element={<PrivateRoute><AdminEncyclopediaPage /></PrivateRoute>} />
    <Route path="/admin/encyclopedia/add"     element={<PrivateRoute><AdminEncyclopediaFormPage /></PrivateRoute>} />
    <Route path="/admin/encyclopedia/edit/:id" element={<PrivateRoute><AdminEncyclopediaFormPage /></PrivateRoute>} />
    <Route path="/admin/notifications"        element={<PrivateRoute><AdminNotificationsPage /></PrivateRoute>} />

    {/* ── Customer (cần đăng nhập) ── */}
    <Route path="/san-pham/:slug" element={<ProductDetailPage />} />
    <Route path="/checkout"  element={<PrivateRoute><div>Checkout — coming soon</div></PrivateRoute>} />
    <Route path="/dashboard" element={<PrivateRoute><div>Dashboard — coming soon</div></PrivateRoute>} />
    <Route path="/gioi-thieu"           element={<AboutPage />} />
    <Route path="/dien-dan"            element={<ForumPage />} />
    <Route path="/dien-dan/tao-bai"   element={<CreatePostPage />} />
    <Route path="/dien-dan/:slug"     element={<ForumPostPage />} />

    {/* ── Fallback ── */}
    <Route path="/"  element={<Navigate to="/dang-nhap" replace />} />
    <Route path="*"  element={<Navigate to="/dang-nhap" replace />} />
  </Routes>
);

export default AppRouter;
