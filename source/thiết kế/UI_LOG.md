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
| v26 | 2026-06-15 | admin/encyclopedia (quản lý tra cứu) + add/edit | — (không có prototype) | EncyclopediaAdminPage.jsx, EncyclopediaFormPage.jsx, encyclopediaService.js |
| v27 | 2026-06-15 | admin/encyclopedia — kết nối API /pest-entries | — | EncyclopediaAdminPage.jsx (server-side filter/pagination/stats), EncyclopediaFormPage.jsx (getEntryById/createEntry/updateEntry) |

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

---

## v19 — 2026-06-15

**Yêu cầu:** khi thêm sửa xóa bên admin cần có toast hiển thị message phía backend trả về
**Prototype tham chiếu:** không có (global UX pattern)

**Files tạo/cập nhật:**
- [+] frontend-admin/src/services/toastService.js — module singleton, success/error/warning/info + errMsg helper
- [+] frontend-admin/src/components/common/Toast.jsx — createPortal, useReducer, progress bar, auto-dismiss, slide animation
- [~] frontend-admin/src/index.css — @keyframes toast-progress
- [~] frontend-admin/src/components/admin/AdminLayout.jsx — import và render <Toast />
- [~] frontend-admin/src/pages/admin/EncyclopediaFormPage.jsx — toastService.success/error khi create/update
- [~] frontend-admin/src/pages/admin/ProductFormPage.jsx — thay MOCK_EDIT_DATA bằng getProductById, thay fake submit bằng createProduct/updateProduct + toast
- [~] frontend-admin/src/pages/admin/CategoryFormPage.jsx — thay MOCK_EDIT_DATA bằng getCategoryById, thay fake submit bằng createCategory/updateCategory + toast

**API endpoints sử dụng:**
- GET /products/:id, POST /products, PUT /products/:id
- GET /categories/:id, POST /categories, PUT /categories/:id
- POST /pest-entries, PUT /pest-entries/:id (đã có từ v trước)

---

---

## v20 — 2026-06-16

**Yêu cầu:** ớ nút xóa bài viết đâu rồi
**Prototype tham chiếu:** không có (thêm vào bảng hiện có)

**Files tạo/cập nhật:**
- [~] frontend-admin/src/pages/admin/EncyclopediaAdminPage.jsx — thêm cột "Thao tác" (edit + delete icon), inline confirm modal, handleDelete + toast

**API endpoints sử dụng:**
- DELETE /pest-entries/:id (auth: admin)

---

## v21 — 2026-06-16

**Yêu cầu:** đồng bộ các api về tra cứu với frontend
**Prototype tham chiếu:** customer/encyclopedia.html, customer/encyclopedia_detail.html

**Files tạo/cập nhật:**
- [~] frontend-admin/src/pages/customer/EncyclopediaPage.jsx — xoá FAKE_ENTRIES, dùng getAllEntries với server-side filtering (search/category/severity), pagination real API, field mapping đúng snake_case
- [~] frontend-admin/src/pages/customer/EncyclopediaDetailPage.jsx — xoá FAKE_ENTRIES.find, dùng getEntryById(id), tabs (triệu chứng/điều kiện/biện pháp), related entries, recommended products
- [~] frontend-admin/src/router/index.jsx — đổi /tra-cuu/:slug → /tra-cuu/:id

**API endpoints sử dụng:**
- GET /pest-entries?search=&category=&severity=&page=&limit= (list, filter, paginate)
- GET /pest-entries/:id (detail)
- GET /products/:id (recommended products)

---

## v22 — 2026-06-29

**Yêu cầu:** sửa lại trang chi tiết tra cứu (client) — hiển thị nhiều ảnh thay vì 1 ảnh
**Prototype tham chiếu:** customer/encyclopedia_detail.html

**Files tạo/cập nhật:**
- [~] frontend-admin/src/pages/customer/EncyclopediaDetailPage.jsx — thay ảnh đơn bằng gallery: ảnh chính + dải thumbnail, nút prev/next, counter, lightbox phóng to (click ảnh) + điều khiển bàn phím (Esc/←/→)

**API endpoints sử dụng:**
- GET /pest-entries/:slug (đã có — dùng entry.images[] thay vì chỉ images[0])

---

## v23 — 2026-06-29

**Yêu cầu:** cho tỷ lệ khớp với 5 ảnh con (gallery tra cứu)
**Prototype tham chiếu:** customer/encyclopedia_detail.html

**Files tạo/cập nhật:**
- [~] frontend-admin/src/pages/customer/EncyclopediaDetailPage.jsx — đổi dải thumbnail từ flex + size-20 cố định sang grid grid-cols-5 (aspect-square), 5 ảnh con dàn đều khớp bề ngang ảnh chính

---

## v24 — 2026-06-29

**Yêu cầu:** đẩy text lên top cùng dòng với ảnh (hero tra cứu)
**Prototype tham chiếu:** customer/encyclopedia_detail.html

**Files tạo/cập nhật:**
- [~] frontend-admin/src/pages/customer/EncyclopediaDetailPage.jsx — đổi cột Info từ justify-center → justify-start để text canh đầu trên cùng hàng với ảnh chính

---

## v25 — 2026-06-29

**Yêu cầu:** bỏ ảnh ở danh mục đi, tôi thấy chả cần lắm

**Files tạo/cập nhật:**
- [~] frontend-admin/src/pages/admin/CategoryFormPage.jsx — bỏ section "Ảnh đại diện" + ImageUploader, gỡ import uploadImage/ImageUploader, bỏ imageUrl khỏi EMPTY_FORM/load edit, bỏ image_url khỏi payload
- [~] frontend-admin/src/pages/admin/CategoriesPage.jsx — bỏ nhánh `<img>` trong cột tên, luôn render icon; gỡ field imageUrl khỏi MOCK_CATEGORIES

---

## v26 — 2026-06-29

**Yêu cầu:** xóa luôn cả mô tả đi (gỡ field description khỏi danh mục)

**Files tạo/cập nhật:**
- [~] frontend-admin/src/pages/admin/CategoryFormPage.jsx — bỏ textarea "Mô tả", gỡ description khỏi EMPTY_FORM/load edit/payload
- [~] frontend-admin/src/pages/admin/CategoriesPage.jsx — bỏ cột "Mô tả" (header + cell), gỡ description khỏi MOCK_CATEGORIES, colSpan empty-state 4→3

---

## v27 — 2026-06-29

**Yêu cầu:** nút tạo danh mục lệch xa quá (canh lại sau khi gỡ ảnh + mô tả)

**Files tạo/cập nhật:**
- [~] frontend-admin/src/pages/admin/CategoryFormPage.jsx — bỏ grid 3 cột (cột phải đã trống ở add mode), cho card "Thông tin cơ bản" full-width trong max-w-3xl; footer justify-between giờ thẳng hàng với mép card → nút "Tạo danh mục" hết lệch. Info card khi edit chuyển xuống dưới, full-width

---

## v28 — 2026-06-29

**Yêu cầu:** trang danh mục (admin) kết nối api get list danh mục, xóa data mock

**Files tạo/cập nhật:**
- [~] frontend-admin/src/pages/admin/CategoriesPage.jsx — xóa MOCK_CATEGORIES + STATS hardcode + ICON_MAP; fetch thật qua getAllCategories({ limit: 100 }) (res.data.data.data), giữ filter + phân trang client-side; stats tính từ data thật (tổng danh mục / có SP / chưa có SP / tổng sản phẩm); cell dùng `product_count`; loading thật + toast lỗi; empty-state chỉ hiện khi `!loading`

**API endpoints sử dụng:**
- GET /categories — danh sách danh mục (kèm product_count)

---

## v29 — 2026-06-29

**Yêu cầu:** thêm cái nút xóa nhé, ở mỗi dòng item (trang danh mục admin)

**Files tạo/cập nhật:**
- [~] frontend-admin/src/pages/admin/CategoriesPage.jsx — thêm cột "Thao tác" + nút xóa (icon delete) mỗi dòng (stopPropagation để không trigger điều hướng edit); modal xác nhận xóa theo pattern EncyclopediaAdminPage; `handleDelete` gọi deleteCategory, cập nhật state client-side + lùi trang nếu rỗng; cảnh báo + chặn nút xóa khi danh mục còn sản phẩm (product_count > 0, backend reject FK); colSpan empty-state 3→4

**API endpoints sử dụng:**
- DELETE /categories/:id — xóa danh mục

---

## v30 — 2026-06-29

**Yêu cầu:** xóa datamock trang admin sản phẩm đi

**Files tạo/cập nhật:**
- [~] frontend-admin/src/pages/admin/ProductsPage.jsx — xóa MOCK_PRODUCTS + STATS hardcode (kèm % tăng/giảm bịa) + CATEGORY_MAP/CATEGORY_OPTIONS tĩnh; fetch thật qua getAllProducts({ limit: 100 }) (res.data.data.data); status suy ra từ is_active+stock (đang-ban/het-hang/ngung-ban); hiển thị category.name + image_url + price format vi-VN + updated_at; dropdown danh mục dựng động từ data thật (slug khớp DB); stats tính thật (tổng / đang bán / hết hàng / ngừng bán); loading thật + LoadingOverlay + toast lỗi; empty-state chỉ hiện khi !loading

**API endpoints sử dụng:**
- GET /products — danh sách sản phẩm (kèm category)

---

## v31 — 2026-06-29

**Yêu cầu:** trang tạo sản phẩm admin — bổ sung trường thiếu so với frontend customer (ingredient/safetyNote/badge)

**Files tạo/cập nhật:**
- [~] frontend-admin/src/pages/admin/ProductFormPage.jsx — thêm 3 field: `ingredient` (Hoạt chất, input — Thông tin cơ bản), `safetyNote` (Lưu ý an toàn, textarea — Thông tin cơ bản), `badge` (Nhãn nổi bật, input maxLength 50 — Thông tin bổ sung); thêm vào EMPTY_FORM, load edit (d.ingredient/d.safety_note/d.badge), payload (snake_case)

**API endpoints sử dụng:**
- POST/PUT /products — gửi thêm ingredient, safety_note, badge

**Pipeline kèm theo:** DB v7 (3 cột Product) → API v6 (input/output/controller)

---

## v32 — 2026-06-29

**Yêu cầu:** Mô tả / Thông số kỹ thuật / An toàn sử dụng soạn dạng Word (rich-text); bỏ "Thông số nhanh" ở client

**Files tạo/cập nhật:**
- [~] frontend-admin/src/pages/admin/ProductFormPage.jsx — thêm card "Nội dung chi tiết" với 3 RichTextEditor: Mô tả (description), Thông số kỹ thuật (specifications — field mới), An toàn sử dụng (safetyNote); gỡ textarea Mô tả (toolbar giả) + textarea Lưu ý an toàn khỏi "Thông tin cơ bản"; thêm helper `toApiHtml`, `handleRich`, field `specifications` vào EMPTY_FORM/load/payload; description/specifications/safety_note gửi qua toApiHtml (bỏ `<p></p>` rỗng)
- [~] frontend-admin/src/pages/customer/ProductDetailPage.jsx — bỏ sidebar "Thông số nhanh", cho tab content full-width (grid 3 cột → block)

**API endpoints sử dụng:**
- POST/PUT /products — gửi thêm specifications + description/safety_note dạng HTML

**Pipeline kèm theo:** DB v8 (specifications @Text + description→@Text) → API v7

---

## v33 — 2026-06-29

**Yêu cầu:** sản phẩm nguy hiểm hiển thị hộp cảnh báo màu đỏ (mức độ nguy hiểm)

**Files tạo/cập nhật:**
- [~] frontend-admin/src/pages/admin/ProductFormPage.jsx — thêm dropdown "Mức độ nguy hiểm" (Select HAZARD_OPTIONS: NONE/TRUNG_BINH/NANG/NGUY_HIEM) cạnh ô An toàn sử dụng; field hazardLevel vào EMPTY_FORM/load/payload (gửi `hazard_level`)
- [~] frontend-admin/src/pages/customer/ProductDetailPage.jsx — thêm HAZARD_STYLE (vàng/cam/đỏ + icon warning/dangerous); hộp an toàn (hero + tab) đổi màu theo `product.hazardLevel`, NONE = ẩn hộp
- [~] frontend-admin/src/data/productData.js — thêm hazardLevel cho 12 sản phẩm mock (thuốc=NANG, Paraquat=NGUY_HIEM, phân=TRUNG_BINH, dụng cụ=NONE)

**API endpoints sử dụng:**
- POST/PUT /products — gửi thêm hazard_level

**Pipeline kèm theo:** DB v9 (hazardLevel) → API v8

---

## v34 — 2026-06-29

**Yêu cầu:** call api get danh mục để cho vào dropdown (form sản phẩm)

**Files tạo/cập nhật:**
- [~] frontend-admin/src/pages/admin/ProductFormPage.jsx — bỏ CATEGORY_OPTIONS hardcode (id 1-5); fetch getAllCategories({ limit: 100 }) vào state, build categoryOptions động (useMemo) = placeholder + categories.map({value:id,label:name}); Select danh mục dùng categoryOptions

**API endpoints sử dụng:**
- GET /categories — danh mục cho dropdown

---

## v35 — 2026-06-29

**Yêu cầu:** thiếu slug cho sản phẩm — thêm ô slug vào form admin

**Files tạo/cập nhật:**
- [~] frontend-admin/src/pages/admin/ProductFormPage.jsx — thêm ô "Slug" (mono, dưới ô Tên); helper VI_MAP+toSlug; auto-fill slug từ tên khi thêm mới (handleChange), giữ nguyên khi sửa; slug vào EMPTY_FORM/load/payload (`form.slug.trim() || undefined` → bỏ trống thì backend auto-gen)

**API endpoints sử dụng:**
- POST/PUT /products — gửi thêm slug

**Pipeline kèm theo:** API v10 (input slug + getById theo slug + P2002)

---

## v36 — 2026-06-29

**Yêu cầu:** chỉnh trường form sản phẩm (6 mục)

**Files tạo/cập nhật:**
- [~] frontend-admin/src/pages/admin/ProductFormPage.jsx:
  1. Bỏ chữ "(tự sinh từ tên)" ở label Slug
  2. Bỏ field "Hoạt chất / thành phần" (ingredient)
  3. Thêm "Lưu ý mức độ nguy hiểm" (hazardNote, textarea cạnh An toàn sử dụng)
  4. Bỏ field "Hạn sử dụng" + "Xuất xứ"
  5. Thêm input "Link video (nhúng)" (videoUrl)
  6. Đơn vị tính: bỏ kg + lít, thêm "bao"; Trọng lượng thêm Select đơn vị kg/lít/ml (weightUnit)
  - State/load/payload: −origin/−expiryDays/−ingredient; +weightUnit/hazardNote/videoUrl; unit default 'bao'; bỏ validate expiryDays

**API endpoints sử dụng:**
- POST/PUT /products

**Pipeline kèm theo:** DB v10 + API v11

---

## v37 — 2026-06-29

**Yêu cầu:** tab "Vận chuyển & Đổi trả" (client) fix cứng

**Files tạo/cập nhật:**
- [~] frontend-admin/src/pages/customer/ProductDetailPage.jsx — tách nội dung tab "Vận chuyển & Đổi trả" thành hằng `SHIPPING_RETURN` (intro + items) ở đầu file; tab render từ hằng. Nội dung CỐ ĐỊNH, không lấy từ data sản phẩm — sửa tại một chỗ.

---

## v38 — 2026-06-29 (TẠM/debug)

**Yêu cầu:** không vào được màn edit — tạm bỏ auto-redirect để thấy lỗi

**Files tạo/cập nhật:**
- [~] frontend-admin/src/pages/admin/ProductFormPage.jsx — TẠM: khi getProductById lỗi không `navigate('/admin/products')` nữa mà set `loadError` + hiện banner đỏ (status + message) ngay trên form, để xác nhận navigation chạy và lộ lỗi thật GET /products/:id. **Cần revert sau khi fix xong** (khôi phục redirect).

---

## v39 — 2026-06-29 (bugfix)

**Yêu cầu:** màn edit sản phẩm trắng tinh

**Nguyên nhân:** ImageUploader cần `images` là mảng string|File, nhưng khi edit nạp `d.images` từ API là mảng object `{id,url,order}` → `getDisplayUrl` gọi `URL.createObjectURL(object)` → throw khi render → trang trắng. Chỉ xảy ra với sản phẩm CÓ ảnh.

**Files tạo/cập nhật:**
- [~] frontend-admin/src/pages/admin/ProductFormPage.jsx — khi load edit, map `d.images` → mảng URL string: `d.images.map(img => typeof img === 'string' ? img : img?.url).filter(Boolean)`

---

## v40 — 2026-06-29

**Yêu cầu:** trang sản phẩm — thêm button xóa, liên kết API xóa mềm

**Files tạo/cập nhật:**
- [~] frontend-admin/src/pages/admin/ProductsPage.jsx — thêm cột "Thao tác" + nút xóa (icon delete) mỗi dòng (stopPropagation để không trigger điều hướng edit); modal xác nhận (nêu rõ xóa mềm, giữ lịch sử đơn); `handleDelete` gọi `deleteProduct` (DELETE /products/:id → soft-delete), cập nhật state client-side + lùi trang nếu rỗng; colSpan empty-state 6→7

**API endpoints sử dụng:**
- DELETE /products/:id — xóa mềm (deletedAt)

## v41 — 2026-06-29

**Yêu cầu:** mapping các api sản phẩm với client (nối 2 trang customer với API thật)

**Files tạo/cập nhật:**
- [+] frontend-admin/src/services/reviewService.js — getReviews(productId), createReview
- [~] frontend-admin/src/pages/customer/CatalogPage.jsx — bỏ FAKE_PRODUCTS; fetch GET /products (limit 100); card dùng image_url/category.name/giá/badge; description strip HTML; filter danh mục + quick chip dựng từ data thật; bỏ ingredient + sort "đánh giá cao"
- [~] frontend-admin/src/pages/customer/ProductDetailPage.jsx — bỏ FAKE_PRODUCTS/SHARED_REVIEWS; fetch GET /products/:slug + GET /reviews?product_id=; render description/specifications/safety_note bằng dangerouslySetInnerHTML (class rich-prose); hộp an toàn theo hazard_level; section video nếu có video_url (iframe); khối rating + review từ API summary/data; "Viết đánh giá" → toast (gửi từ trang Đơn hàng); related cùng danh mục; loading + notFound state

**API endpoints sử dụng:**
- GET /products, GET /products/:slug, GET /reviews?product_id=

---

## v42 — 2026-06-29

**Yêu cầu:** trang chi tiết SP — ảnh chính nhỏ lại, ảnh phụ 5 ảnh/dòng, bỏ nút "Viết đánh giá"

**Files tạo/cập nhật:**
- [~] frontend-admin/src/pages/customer/ProductDetailPage.jsx — hero grid `lg:grid-cols-2` → `lg:grid-cols-[460px_1fr]` (ảnh chính ~460px, nhỏ lại vừa; cột info rộng hơn); thumbnail `grid-cols-4 gap-3` → `grid-cols-5 gap-2` (5 ảnh/1 dòng); bỏ nút "Viết đánh giá" + handleWriteReview + import toastService/errMsg thừa

---

## v43 — 2026-06-29

**Yêu cầu:** cột ảnh chính to thêm (520px); bỏ hộp cảnh báo an toàn ở tab "An toàn sử dụng" (đã có ở hero)

**Files tạo/cập nhật:**
- [~] frontend-admin/src/pages/customer/ProductDetailPage.jsx — hero grid ảnh chính `460px` → `520px`; tab "An toàn sử dụng" bỏ hộp render `safety_note` (trùng với hộp cảnh báo ở hero), chỉ giữ 2 đoạn hướng dẫn an toàn chung

---

## v44 — 2026-06-29

**Yêu cầu:** trang danh sách SP (catalog) — bỏ icon con mắt mỗi card; bỏ hàng chip danh mục (Tất cả / …)

**Files tạo/cập nhật:**
- [~] frontend-admin/src/pages/customer/CatalogPage.jsx — bỏ nút icon `visibility` (Xem chi tiết) trên card; bỏ hàng "Quick filter chips" (Danh mục: Tất cả + chip); dọn state `activeChip`, `quickFilters`, `handleChip` + nhánh filter theo chip (lọc danh mục vẫn dùng checkbox sidebar)

---

## v45 — 2026-06-29

**Yêu cầu:** header — bỏ field tìm sản phẩm

**Files tạo/cập nhật:**
- [~] frontend-admin/src/components/customer/CustomerLayout.jsx — bỏ ô search trong header; dọn logic search thừa (props searchValue/onSearchChange, localSearch, handleKeyDown, useNavigate/useState); signature còn `{ children }`

**Lưu ý:** HomePage vẫn truyền `searchValue`/`onSearchChange` (giờ bị bỏ qua vô hại) — filter theo header search của HomePage không còn tác dụng (do đã bỏ ô tìm ở header).

---

## v46 — 2026-06-29

**Yêu cầu:** diễn đàn — bỏ logic thêm tag (bài viết không cần tag)

**Files tạo/cập nhật:**
- [~] frontend-admin/src/pages/customer/CreatePostPage.jsx — gỡ toàn bộ tag: state `tags`/`tagInput`/`tagList`, hàm `addTag`/`removeTag`/`handleTagKeyDown`, block JSX "Tags", bỏ `tags` khỏi payload (comment API)
- [~] frontend-admin/src/pages/customer/ForumPage.jsx — bỏ sidebar "Tags phổ biến" + hằng `POPULAR_TAGS` (không còn tag)

---

## v47 — 2026-06-29

**Yêu cầu:** breadcrumb bài viết diễn đàn — bỏ cấp chủ đề (Quy định), đi thẳng Diễn đàn → tên bài

**Files tạo/cập nhật:**
- [~] frontend-admin/src/pages/customer/ForumPostPage.jsx — breadcrumb bỏ block `{badge && ...}` (cấp chủ đề) → còn Trang chủ / Diễn đàn / {tên bài}. Badge chủ đề trên thân bài viết vẫn giữ.

---

## v48 — 2026-06-29

**Yêu cầu:** tạo bài viết — nội dung dạng edit Word, kéo ảnh vào ô text (preview, upload khi gửi)

**Files tạo/cập nhật:**
- [~] frontend-admin/src/components/common/RichTextEditor.jsx — thêm prop `enableImages`: Image extension (@tiptap/extension-image), kéo-thả (handleDrop) + dán (handlePaste) + nút chèn ảnh → chèn ảnh dạng blob URL (preview local). Opt-in, không ảnh hưởng form khác.
- [~] frontend-admin/src/pages/customer/CreatePostPage.jsx — ô Nội dung: textarea → `<RichTextEditor enableImages>`; validate theo text đã strip HTML; submit `async` → `uploadContentImages` (upload ảnh blob qua POST /upload rồi thay src bằng URL thật) trước khi gửi
- [~] frontend-admin/src/index.css — style `.rich-prose img` (max-width, bo góc, selected outline)

**API endpoints sử dụng:**
- POST /upload — upload ảnh trong nội dung (khi nhấn Đăng bài)

**⚠️ CẦN CÀI NPM:** `@tiptap/extension-image@^3.26.1` (nếu chưa cài, RichTextEditor lỗi import → gãy cả các form admin dùng nó)

---

## v49 — 2026-06-29

**Yêu cầu:** tạo bài viết — bỏ /upload, dùng POST /posts multipart

**Files tạo/cập nhật:**
- [+] frontend-admin/src/services/postService.js — getForumCategories, getPosts, getPostById, createPost(data, images) (multipart: data JSON + images files)
- [~] frontend-admin/src/pages/customer/CreatePostPage.jsx — bỏ uploadContentImages(/upload); thêm extractContentImages (blob → placeholder `__IMG_i__` + files); dropdown chủ đề fetch từ GET /forum-categories (value = id thật); submit gọi `createPost({ title, category_id, content }, files)` (backend upload ảnh khi tạo bài); toast "chờ duyệt"

**API endpoints sử dụng:**
- GET /forum-categories, POST /posts (multipart)

---

## v50 — 2026-06-29

**Yêu cầu:** giới hạn kích thước ảnh khi hiển thị

**Files tạo/cập nhật:**
- [~] frontend-admin/src/index.css — `.rich-prose img` thêm `max-height: 360px` + `width/height: auto` + `object-fit: contain` (giữ tỉ lệ). Áp dụng cho ảnh trong editor lẫn nội dung hiển thị (product detail, bài viết).

---

## v51 — 2026-06-29

**Yêu cầu:** toast tạo bài không hiện; xóa data mock trang danh sách diễn đàn

**Files tạo/cập nhật:**
- [~] frontend-admin/src/components/customer/CustomerLayout.jsx — thêm `<Toast />` (trước giờ chỉ AdminLayout có → mọi toast ở trang customer không render). Nay create post / lỗi đều hiện toast.
- [~] frontend-admin/src/pages/customer/ForumPage.jsx — bỏ `FAKE_THREADS`; fetch `GET /posts` (limit 100); map field API (is_pinned/comment_count/view_count/category.slug/user); badge qua CAT_BADGE[slug]; excerpt strip HTML; bỏ locked/hot (không có trong API); loading + toast lỗi + empty-state

**API endpoints sử dụng:**
- GET /posts

**Lưu ý:** ForumPostPage (chi tiết bài) VẪN dùng mock → click bài thật sẽ "không tìm thấy" cho tới khi nối `GET /posts/:slug` (follow-up).

---

## v52 — 2026-06-29

**Yêu cầu:** làm trang chi tiết diễn đàn (nối API)

**Files tạo/cập nhật:**
- [~] frontend-admin/src/pages/customer/ForumPostPage.jsx — bỏ FAKE_THREADS/FAKE_COMMENTS; fetch `GET /posts/:slug` (backend tra theo slug) → render title/badge(CAT_BADGE[slug])/author(user)/thời gian/lượt xem; content HTML bằng dangerouslySetInnerHTML (class rich-prose, có ảnh inline); bài liên quan qua `GET /posts` (cùng category slug); loading + notFound state; like/save/share giữ là UI local. **Bình luận**: chưa có API → hiện placeholder "đang phát triển" + form gửi → toast "sắp ra mắt".

**API endpoints sử dụng:**
- GET /posts/:slug, GET /posts

**Lưu ý:** API bình luận (PostComment) + like/save chưa có → các phần đó là placeholder/UI-only. Bài pending chỉ tác giả/staff xem được (khớp backend).

---

## v53 — 2026-06-29

**Yêu cầu:** từ trang diễn đàn thêm nút duyệt bài viết → mở danh sách bài chờ duyệt; API get này chỉ admin/mod gọi được

**Files tạo/cập nhật:**
- [+] frontend-admin/src/pages/customer/ForumModeratePage.jsx — hàng chờ duyệt: fetch `GET /posts/pending`; mỗi bài có **Xem / Xóa / Duyệt**. Duyệt → `PATCH /posts/:id/status` (published); **Xóa** (không duyệt) → confirm modal → `DELETE /posts/:id` (xoá hẳn + dọn ảnh). Xử lý xong bỏ khỏi list + toast; guard `isStaff()` → không phải staff thì `<Navigate to="/dien-dan">`. Loading + empty state.
  - _v53.1:_ bỏ nút "Ẩn" (hidden), thay bằng "Xóa" hẳn theo yêu cầu (admin không duyệt thì xoá luôn).
- [~] frontend-admin/src/pages/customer/ForumPage.jsx — thêm nút "Duyệt bài viết" ở sidebar, **chỉ hiện với mod/admin** (`isStaff()`) → link `/dien-dan/kiem-duyet`.
- [~] frontend-admin/src/services/postService.js — thêm `getPendingPosts(params)`, `moderatePost(id, status)`.
- [~] frontend-admin/src/services/authService.js — thêm `getCurrentUser()` (decode payload JWT access_token → { id, role }) + `isStaff()`.
- [~] frontend-admin/src/router/index.jsx — route `/dien-dan/kiem-duyet` (PrivateRoute, đặt trước `/dien-dan/:slug`).

**API endpoints sử dụng:**
- GET /posts/pending (mod/admin) · PATCH /posts/:id/status (mod/admin)

**Lưu ý:** UI ẩn nút theo role chỉ là UX; chặn thật nằm ở backend (403 nếu không phải mod/admin). Role đọc từ JWT client-side, không verify chữ ký.

---

## v54 — 2026-06-29

**Yêu cầu:** admin/mod thì được thêm nút xóa bài ở mỗi row (danh sách diễn đàn)
**Prototype tham chiếu:** customer/forum.html

**Files tạo/cập nhật:**
- [~] frontend-admin/src/pages/customer/ForumPage.jsx — mỗi card bài viết có nút **xóa** (icon thùng rác, đỏ) ở footer, **chỉ hiện với mod/admin** (`isStaff()`); bấm → confirm modal → `DELETE /posts/:id`; xóa xong bỏ khỏi list + toast. Dùng lại `deletePost` (postService) đã có.

**API endpoints sử dụng:**
- DELETE /posts/:id (mod/admin)

**Lưu ý:** ẩn nút theo role chỉ là UX; backend chặn thật (403 nếu không phải mod/admin). Xóa cứng — trùng cơ chế trang kiểm duyệt (v53).

---

## v55 — 2026-07-16

**Yêu cầu:** trang diễn đàn, khi hover vào row item thì hiện con trỏ (pointer) và ấn vào bất kỳ đâu trên row thì chuyển sang trang chi tiết, không phải chỉ bấm vào tên bài
**Prototype tham chiếu:** customer/forum.html (không đổi layout — chỉ hành vi tương tác)

**Files tạo/cập nhật:**
- [~] frontend-admin/src/pages/customer/ForumPage.jsx — card bài viết thêm `cursor-pointer` + `onClick` → `navigate(/dien-dan/{slug})`; title Link `stopPropagation` (tránh navigate đúp); nút xóa/sửa `stopPropagation` (bấm action không bị chuyển trang).

**API endpoints sử dụng:**
- (không đổi)

---

## v56 — 2026-07-16

**Yêu cầu:** tạo logic thêm vào giỏ hàng — chưa đăng nhập lưu tạm client (localStorage), đăng nhập thì đồng bộ với giỏ hàng của user
**Prototype tham chiếu:** (không có màn hình mới — wire vào các trang hiện có)

**Files tạo/cập nhật:**
- [+] backend/src/models/input/cart.input.js — AddCartItem / UpdateCartItem / SyncCart schemas
- [+] backend/src/models/output/cart.output.js — CartOutput (items + product snapshot)
- [+] backend/src/controllers/cartController.js — getCart / addItem (cộng dồn, trần stock) / updateItem / removeItem / sync (merge giỏ guest)
- [+] backend/src/routes/carts.js — mount /cart (tất cả authenticateToken)
- [~] backend/src/index.js — mount /cart; response.js thêm ER501 OUT_OF_STOCK
- [+] frontend-admin/src/services/cartService.js
- [+] frontend-admin/src/store/useCartStore.js — Zustand store: guest = localStorage key guest_cart, authed = API; syncAfterLogin merge + xoá bản local
- [~] CustomerLayout.jsx — init store + badge số lượng trên icon giỏ
- [~] CatalogPage.jsx / ProductDetailPage.jsx — nút Thêm gọi addItem (disabled khi hết hàng, toast kết quả)
- [~] LoginPage.jsx — syncAfterLogin() sau khi login thành công

**API endpoints sử dụng:**
- GET /cart · POST /cart/items · PUT /cart/items/:productId · DELETE /cart/items/:productId · POST /cart/sync

**Lưu ý:** cài thêm package `zustand@5` (--legacy-peer-deps do conflict tiptap có sẵn). HomePage vẫn dùng MOCK_PRODUCTS nên CHƯA wire nút Thêm ở đó — cần chuyển HomePage sang API thật trước.

---

## v57 — 2026-07-16

**Yêu cầu:** làm pop up giỏ hàng + trang giỏ hàng chi tiết
**Prototype tham chiếu:** customer/checkout.html (mượn style Order Summary — không có cart.html riêng)

**Files tạo/cập nhật:**
- [+] frontend-admin/src/components/customer/CartPopup.jsx — mini cart dropdown dưới icon giỏ: list item (ảnh, tên, sl × giá, nút xoá), tạm tính, nút Xem giỏ hàng; empty state
- [+] frontend-admin/src/pages/customer/CartPage.jsx — trang /gio-hang: row item (ảnh, tên link, giá gạch/giảm, stepper số lượng chặn stock, thành tiền, xoá), summary card (tạm tính, tiết kiệm, tổng, CTA thanh toán), empty state, hint đăng nhập cho guest
- [~] components/customer/CustomerLayout.jsx — icon giỏ toggle CartPopup, đóng khi click ra ngoài
- [~] router/index.jsx — route /gio-hang (public — guest xem giỏ localStorage)

**API endpoints sử dụng:**
- (qua useCartStore) GET /cart · PUT /cart/items/:productId · DELETE /cart/items/:productId — khi đã đăng nhập; guest thao tác localStorage

---

## v58 — 2026-07-16

**Yêu cầu:** thiết kế trang thông tin cá nhân (bên client) gồm các chức năng đặc trưng
**Prototype tham chiếu:** customer/dashboard.html (sidebar avatar+nav+logout, overview, stats, forum activity)

**Files tạo/cập nhật:**
- [+] frontend-admin/src/pages/customer/ProfilePage.jsx — /tai-khoan, 5 tab: **Tổng quan** (stat tiles: bài viết/giỏ hàng/thành viên từ + card thông tin), **Chỉnh sửa thông tin** (họ tên + sđt, onChange validation, email khoá), **Đổi mật khẩu** (3 field, check khớp confirm), **Bài viết của tôi** (list bài kèm badge trạng thái + nút sửa), **Đơn hàng** (disabled — sắp ra mắt); nút **Đăng xuất** (logout + reset cart store)
- [~] backend: PUT /auth/me (UpdateProfileSchema: full_name/phone) + PUT /auth/me/password (ChangePasswordSchema, bcrypt compare, ER205 BAD_PASSWORD); ProfileOutput/UserOutput thêm phone
- [~] services/authService.js — updateProfile, changePassword
- [~] CustomerLayout.jsx — icon account: đã đăng nhập → /tai-khoan, chưa → /dang-nhap
- [~] router/index.jsx — route /tai-khoan (PrivateRoute)

**API endpoints sử dụng:**
- GET /auth/me · PUT /auth/me · PUT /auth/me/password · GET /posts (lọc bài của mình client-side)

---

## v59 — 2026-10-06

**Yêu cầu:** viết trang thanh toán
**Prototype tham chiếu:** customer/checkout.html (stepper, 3 section form, Order Summary sticky, trust badges, help card)

**Files tạo/cập nhật:**
- [+] frontend-admin/src/pages/customer/CheckoutPage.jsx — /checkout (PrivateRoute): stepper (Giỏ hàng ✓ / Giao hàng & Thanh toán / Hoàn tất); cột trái 3 section — **Liên hệ** (email khoá, prefill từ hồ sơ), **Địa chỉ giao hàng** (họ tên, SĐT, tỉnh/thành, quận/huyện, phường/xã, địa chỉ cụ thể, ghi chú — onChange validation), **Phương thức thanh toán** (radio card: cod mặc định / bank_transfer / vnpay); cột phải Order Summary sticky (list sản phẩm từ giỏ + badge sl, mã giảm giá stub→toast, tạm tính/tiết kiệm/phí ship miễn phí ≥500k, tổng, nút Đặt hàng, trust badges, card hỗ trợ); empty state khi giỏ rỗng; palette hệ thống (#4bee2b / #2E7D32), KHÔNG dùng #36cf17 của prototype
- [+] frontend-admin/src/services/orderService.js — createOrder (POST /orders + localTime), getMyOrders, getOrderById; có doc contract kỳ vọng cho /api
- [~] router/index.jsx — route /checkout trỏ CheckoutPage (thay placeholder), bỏ comment import

**API endpoints sử dụng:**
- POST /orders — ⚠️ CHƯA có backend (chỉ có model Order trong Prisma). Nút "Đặt hàng" sẽ 404 tới khi chạy `/api` tạo controller+route. Contract: body `{ address:{fullName,phone,street,ward,district,city}, paymentMethod, note, shippingFee, localTime }`; backend đọc giỏ server-side của user để dựng OrderItem + tính total, tạo Address+Order, xoá giỏ, trả đơn
- (giỏ) đồng bộ client về rỗng sau khi đặt hàng thành công qua `useCartStore.setState({ items: [] })`
- GET /auth/me — prefill họ tên/SĐT/email người nhận

**Tinh chỉnh cùng session:**
- CheckoutPage: thêm dấu `*` đỏ cho field bắt buộc (họ tên, SĐT, tỉnh/thành, quận/huyện, địa chỉ cụ thể); stepper fix icon check lệch (lồng icon vào vòng tròn + `leading-none`); vô hiệu hoá option **VNPay** (bôi xám, radio disabled, badge "Sắp ra mắt") — mặc định vẫn COD
- [+] frontend-admin/src/utils/productImage.js — helper `productImage(p)` = `image_url ?? images[0].url`; dùng chung cho **ảnh chính sản phẩm** ở CartPopup, CartPage, CheckoutPage (order summary) + snapshot trong `useCartStore`. Thống nhất một quy tắc resolve ảnh chính, có fallback gallery khi item mang `images`

**API endpoints sử dụng (tinh chỉnh):**
- (không thêm API) — chỉ hợp nhất logic resolve ảnh chính phía client

---


> Tự động cập nhật khi chạy `/ui`.
> Không sửa tay trực tiếp.
