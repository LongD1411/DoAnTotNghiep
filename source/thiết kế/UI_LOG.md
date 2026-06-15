# UI Agent — Version Log

| Version | Thời gian | Màn hình | Prototype | Files tạo ra |
|---------|-----------|----------|-----------|--------------|
| v1 | 2026-05-26 | customer/login (Đăng nhập) | stitch.../customer/login.html | LoginPage.jsx, authService.js |
| v2 | 2026-05-26 | customer/register (Đăng ký) | stitch.../customer/register.html | RegisterPage.jsx |
| v3 | 2026-05-27 | customer/trang-chu (Trang chủ) | homepage.html | HomePage.jsx (full redesign theo homepage.html) |
| v4 | 2026-05-27 | customer/trang-chu — fake ảnh | — | HomePage.jsx (picsum placeholder images) |
| v5 | 2026-05-28 | customer/trang-chu — UI polish | homepage.html | HomePage.jsx, index.css, ui.md |
| v6 | 2026-05-28 | customer shared layout | homepage.html | CustomerLayout.jsx, HomePage.jsx |
| v7 | 2026-05-28 | customer/tra-cuu (Bách khoa sâu bệnh) | encyclopedia.html | EncyclopediaPage.jsx |
| v8 | 2026-05-29 | customer/catalog (Cửa hàng) | catalog.html | CatalogPage.jsx |
| v9  | 2026-05-30 | customer/dien-dan (Diễn đàn) | forum.html | ForumPage.jsx |
| v10 | 2026-05-30 | customer/dien-dan/:slug (Chi tiết bài viết) | — | ForumPostPage.jsx, forumData.js |
| v11 | 2026-05-30 | customer/dien-dan/tao-bai (Tạo bài viết) | — | CreatePostPage.jsx |
| v12 | 2026-05-30 | customer/san-pham/:slug (Chi tiết sản phẩm) | product_detail.html | ProductDetailPage.jsx, productData.js |
| v13 | 2026-05-30 | customer/tra-cuu/:slug (Chi tiết sâu bệnh) | — | EncyclopediaDetailPage.jsx, encyclopediaData.js |
| v14 | 2026-05-31 | customer/gioi-thieu (Giới thiệu) | — | AboutPage.jsx |
| v15 | 2026-06-08 | admin/overview (Tổng quan hệ thống) | stitch.../admin/overview.html | OverviewPage.jsx |
| v16 | 2026-06-08 | admin/overview — thêm biểu đồ Recharts | — | OverviewPage.jsx (AreaChart + BarChart) |
| v17 | 2026-06-08 | admin/orders (Quản lý đơn hàng) | stitch.../admin/orders.html | OrdersPage.jsx |
| v18 | 2026-06-08 | admin/products (Quản lý sản phẩm) | stitch.../admin/products.html | ProductsPage.jsx, productService.js |
| v19 | 2026-06-08 | admin/moderate (Quản lý cộng đồng) | stitch.../admin/moderate_forum.html | ModeratePage.jsx |
| v20 | 2026-06-08 | admin — font size scale up | — | AdminLayout.jsx (+admin-layout class), index.css (CSS override) |
| v21 | 2026-06-08 | admin/notifications (Trang thông báo) | — (không có prototype) | NotificationsPage.jsx |
| v22 | 2026-06-08 | admin/edit-order (Chỉnh sửa đơn hàng) | stitch.../admin/edit_order.html | EditOrderPage.jsx |
| v23 | 2026-06-12 | admin/products — fix dropdown clipping | — | ProductsPage.jsx (bỏ overflow-hidden outer card) |
| v24 | 2026-06-12 | admin/add-product + admin/edit-product/:id (dùng chung layout) | stitch.../admin/add_product_form.html | ProductFormPage.jsx, router/index.jsx, ProductsPage.jsx |
| v25 | 2026-06-14 | admin/categories (danh sách) + admin/add-category + admin/edit-category/:id | — (không có prototype) | CategoriesPage.jsx, CategoryFormPage.jsx, categoryService.js, backend CRUD |

---

## v1 — 2026-05-26

**Yêu cầu:** Tạo component đăng nhập
**Prototype tham chiếu:** stitch_product_catalog_crop_protection/customer/login.html

**Files tạo/cập nhật:**
- [+] frontend-admin/src/pages/auth/LoginPage.jsx
- [+] frontend-admin/src/services/authService.js

**API endpoints sử dụng:**
- POST /auth/login — Xác thực tài khoản, nhận JWT token

---

## v2 — 2026-05-26

**Yêu cầu:** Tạo trang đăng ký
**Prototype tham chiếu:** stitch_product_catalog_crop_protection/customer/register.html

**Files tạo/cập nhật:**
- [+] frontend-admin/src/pages/auth/RegisterPage.jsx
- [~] frontend-admin/src/router/index.jsx (bỏ comment RegisterPage)

**API endpoints sử dụng:**
- POST /auth/register — Tạo tài khoản mới (có localTime)

---

---

## v3 — 2026-05-27

**Yêu cầu:** Sửa lỗi trang /trang-chu

**Files cập nhật:**
- [~] frontend-admin/src/pages/customer/HomePage.jsx
- [~] backend/src/models/output/product.output.js
- [~] backend/src/models/input/product.input.js
- [~] backend/src/controllers/productController.js

**Bugs đã sửa:**
1. `res.data.data ?? []` → `res.data.data?.data ?? []` (listOutput lồng thêm 1 cấp data)
2. `{product.category}` → `{product.category?.name}` (category là object không phải string)
3. Backend output: `imageUrl` → `image_url`, `categoryId` → `category_id`, `createdAt` → `created_at`, `updatedAt` → `updated_at` (snake_case convention)
4. Backend input: `imageUrl` → `image_url`, `categoryId` → `category_id` (snake_case convention)

**API endpoints sử dụng:**
- GET /products — Lấy danh sách sản phẩm có phân trang

---

---

## v4 — 2026-05-27

**Yêu cầu:** fake ảnh đi

**Files cập nhật:**
- [~] frontend-admin/src/pages/customer/HomePage.jsx (MOCK_PRODUCTS image_url → picsum.photos)

**Ghi chú:**
- Dùng `https://picsum.photos/seed/{seed}/400/300` — mỗi sản phẩm có seed riêng để ảnh nhất quán qua mỗi lần render
- API call vẫn đang comment out; khi bật lại thì ảnh thật từ DB sẽ thay thế

---

---

## v5 — 2026-05-28

**Yêu cầu:** UI polish: font size, width ratio, remove hover underline, unify button color, brighter primary

**Files cập nhật:**
- [~] frontend-admin/src/index.css (`--color-primary: #38b30f` → `#4bee2b`)
- [~] frontend-admin/src/pages/customer/HomePage.jsx
- [~] .claude/commands/ui.md (thêm convention BTN_ADD và màu primary)

**Thay đổi chi tiết:**
1. Font: nav links, forum post title, "Xem tất cả" → `text-base`; category badge `text-xs` → `text-sm`
2. Padding: `lg:px-40` → `lg:px-20 xl:px-40` trên tất cả container (rộng hơn ở 1024-1280px)
3. Bỏ `hover:underline` trên link "Xem tất cả"
4. Tất cả "Thêm" button thống nhất: `bg-[#e9f3e7] text-[#2E7D32] hover:bg-[#2E7D32] hover:text-white` (khai báo hằng `BTN_ADD`)
5. Primary color `#4bee2b` (sáng hơn) tự động cập nhật hero badge, "Tối đa năng suất", "Mua sắm ngay"

---

---

## v6 — 2026-05-28

**Yêu cầu:** Tách header + footer thành layout chung phía customer

**Files tạo/cập nhật:**
- [+] frontend-admin/src/components/customer/CustomerLayout.jsx
- [~] frontend-admin/src/pages/customer/HomePage.jsx (import CustomerLayout, bỏ header/footer inline)

**Thiết kế CustomerLayout:**
- Props: `children`, `searchValue?`, `onSearchChange?`
- Controlled mode: khi page truyền `searchValue/onSearchChange` → header search điều khiển bởi page (dùng cho HomePage để lọc sản phẩm)
- Uncontrolled mode: header search dùng state nội bộ, Enter → `navigate('/catalog?q=...')`
- Nav links: Tra cứu, Cửa hàng, Công nghệ, Diễn đàn, Giới thiệu (từ `NAV_LINKS` array để dễ cập nhật)

---

---

## v7 — 2026-05-28

**Yêu cầu:** Tạo trang tra cứu /tra-cuu với template mẫu encyclopedia.html (fake data)
**Prototype tham chiếu:** stitch_product_catalog_crop_protection/customer/encyclopedia.html

**Files tạo/cập nhật:**
- [+] frontend-admin/src/pages/customer/EncyclopediaPage.jsx
- [~] frontend-admin/src/router/index.jsx (thêm route /tra-cuu public)
- [~] frontend-admin/src/components/customer/CustomerLayout.jsx (NAV_LINKS Tra cứu → /tra-cuu)

**API endpoints sử dụng:**
- Không có — 9 mục fake data trực tiếp trong component (FAKE_ENTRIES)

**Tính năng:**
- Hero section + search bar lọc theo tên/tên Latin/mô tả
- Sidebar accordion filters: Loại cây trồng, Danh mục, Mức độ nghiêm trọng
- Quick-filter chips: Tất cả, Mức độ cao, Cà chua, Ngô, Bệnh nấm
- Grid 3 cột card với badge mức độ (NGUY HIỂM/NẶNG/TRUNG BÌNH)
- Pagination động (6 item/trang)
- Community banner

---

---

## v8 — 2026-05-29 10:00

**Yêu cầu:** Tạo trang cửa hàng với bố cục giống trang tra cứu
**Prototype tham chiếu:** stitch_product_catalog_crop_protection/customer/catalog.html

**Files tạo/cập nhật:**
- [+] frontend-admin/src/pages/customer/CatalogPage.jsx
- [~] frontend-admin/src/router/index.jsx (bỏ comment import CatalogPage, đổi /catalog → public route)
- [~] frontend-admin/src/components/customer/CustomerLayout.jsx (Cửa hàng href → /catalog)

**API endpoints sử dụng:**
- Không có — 12 sản phẩm fake data (FAKE_PRODUCTS)

**Tính năng:**
- Hero section + search bar lọc theo tên/hoạt chất/mô tả
- Sidebar accordion filters: Danh mục sản phẩm (5 loại + count), Khoảng giá (4 ranges)
- Quick-filter chips: Tất cả, Diệt cỏ, Trừ nấm, Trừ sâu, Phân bón
- Toolbar: hiển thị số lượng + sort dropdown (Liên quan/Giá asc/Giá desc/Đánh giá)
- Grid 3 cột card với badge (Mới/Bán chạy/giảm%), quick-view button on hover
- Phân trang động (6 item/trang), scroll smooth về đầu grid khi đổi trang

---

---

## v15 — 2026-06-08

**Yêu cầu:** tạo layout trang chủ admin
**Prototype tham chiếu:** stitch_product_catalog_crop_protection/admin/overview.html

**Files tạo/cập nhật:**
- [+] frontend-admin/src/pages/admin/OverviewPage.jsx
- [~] frontend-admin/src/router/index.jsx (bỏ comment AdminOverviewPage, kích hoạt route /admin/overview)

**API endpoints sử dụng:**
- Dữ liệu mock (chưa có endpoint thống kê/overview trên backend)
- Sẽ tích hợp: GET /orders (danh sách đơn gần đây), GET /users (thành viên mới), GET /products (tổng sản phẩm)

---

---

## v17 — 2026-06-08

**Yêu cầu:** tạo trang đơn hàng
**Prototype tham chiếu:** stitch_product_catalog_crop_protection/admin/orders.html

**Files tạo/cập nhật:**
- [+] frontend-admin/src/pages/admin/OrdersPage.jsx
- [~] frontend-admin/src/router/index.jsx (bỏ comment AdminOrdersPage, kích hoạt route /admin/orders)

**API endpoints sử dụng:**
- Dữ liệu mock 20 đơn hàng (chưa có /orders endpoint trên backend)

---

---

## v18 — 2026-06-08

**Yêu cầu:** tạo trang sản phẩm
**Prototype tham chiếu:** stitch_product_catalog_crop_protection/admin/products.html

**Files tạo/cập nhật:**
- [+] frontend-admin/src/pages/admin/ProductsPage.jsx
- [+] frontend-admin/src/services/productService.js
- [~] frontend-admin/src/router/index.jsx (bỏ comment AdminProductsPage, kích hoạt route /admin/products)

**API endpoints sử dụng:**
- Mock data 20 sản phẩm (productService.js sẵn sàng dùng khi backend thật chạy)
- GET /products — danh sách sản phẩm
- DELETE /products/:id — xóa sản phẩm (auth required)

---

> Tự động cập nhật khi chạy `/ui`.
> Không sửa tay trực tiếp.
