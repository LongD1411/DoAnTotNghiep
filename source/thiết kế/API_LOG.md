# API Agent — Version Log

| Version | Thời gian | Resource | Endpoints | Files thay đổi |
|---------|-----------|----------|-----------|----------------|
| v1 | 2026-05-25 | auth + users | 7 endpoints | authController, auth route, usersController, users route, index.js |
| v2 | 2026-05-25 | products (đầy đủ) + API_DOCS | 5 endpoints | productController, products route, API_DOCS.md |
| v3 | 2026-05-25 | models layer (Input/Output) | — | auth.model, product.model, user.model + cập nhật 3 controllers |
| v4 | 2026-06-15 | pest-entries (encyclopedia) | 5 endpoints | pestEntry.input, pestEntry.output, pestEntryController, pestEntries route, index.js |

---

## v1 — 2026-05-25

**Resource:** auth (mở rộng) + users (mới)
**Yêu cầu:** Tạo API login = auth cơ bản, với 2 role Admin (truy cập mọi router) và User thường (chỉ truy cập endpoint dành cho user)

**Endpoints tạo mới / cập nhật:**
| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| POST | /auth/register | public | Đăng ký tài khoản mới (role mặc định: customer) |
| POST | /auth/login | public | Đăng nhập, trả về JWT token |
| GET | /auth/me | authenticateToken | Xem profile của chính mình (customer + admin) |
| GET | /users | admin only | Danh sách tất cả users (có search, pagination) |
| GET | /users/:id | admin only | Xem chi tiết một user |
| PUT | /users/:id/role | admin only | Thay đổi role của user |
| DELETE | /users/:id | admin only | Xoá user |

**Files thay đổi:**
- [~] backend/src/controllers/authController.js — fix try/catch trong login, thêm getProfile, thêm input validation
- [~] backend/src/routes/auth.js — thêm GET /auth/me
- [+] backend/src/controllers/usersController.js
- [+] backend/src/routes/users.js
- [~] backend/src/index.js — đăng ký /users route

---

---

## v2 — 2026-05-25

**Resource:** products (cập nhật đầy đủ) + tạo API_DOCS.md
**Yêu cầu:** API phải có input/output rõ ràng, tổng hợp file md cho frontend

**Endpoints tạo mới:**
| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| GET | /products | public | Danh sách sản phẩm (search, pagination) |
| GET | /products/:id | public | Chi tiết sản phẩm |
| POST | /products | admin | Tạo sản phẩm (có validation đầy đủ) |
| PUT | /products/:id | admin | Cập nhật sản phẩm (partial update) |
| DELETE | /products/:id | admin | Xoá sản phẩm |

**Files thay đổi:**
- [~] backend/src/controllers/productController.js — viết lại đầy đủ: getAll/getById/create/update/remove + validation + Prisma error codes
- [~] backend/src/routes/products.js — thêm GET/:id, PUT/:id, DELETE/:id
- [+] thiết kế/API_DOCS.md — tài liệu API đầy đủ cho frontend (input/output/lỗi từng endpoint)

---

## v3 — 2026-06-29

**Resource:** category
**Yêu cầu:** dọn image_url khỏi category

Gỡ field `image_url` khỏi API danh mục (đồng bộ sau khi xóa `Category.imageUrl` ở schema — DB v5). Endpoints không đổi, chỉ bỏ field thừa khỏi request/response.

| Method | Endpoint | Auth | Thay đổi |
|--------|----------|------|----------|
| POST   | /categories     | admin  | request không còn nhận `image_url` |
| PUT    | /categories/:id | admin  | request không còn nhận `image_url` |
| GET    | /categories     | public | response không còn trả `image_url` |
| GET    | /categories/:id | public | response không còn trả `image_url` |

**Files:**
- [~] backend/src/models/input/category.input.js — bỏ `image_url` khỏi CreateCategorySchema
- [~] backend/src/models/output/category.output.js — bỏ `image_url` khỏi CategoryOutput
- [~] backend/src/controllers/categoryController.js — bỏ destructure + ghi `imageUrl` ở create/update

---

## v4 — 2026-06-29

**Resource:** category
**Yêu cầu:** dọn description khỏi category

Gỡ field `description` khỏi API danh mục (đồng bộ sau khi xóa `Category.description` ở schema — DB v6). Endpoints không đổi.

| Method | Endpoint | Auth | Thay đổi |
|--------|----------|------|----------|
| POST   | /categories     | admin  | request không còn nhận `description` |
| PUT    | /categories/:id | admin  | request không còn nhận `description` |
| GET    | /categories     | public | response không còn trả `description` |
| GET    | /categories/:id | public | response không còn trả `description` |

**Files:**
- [~] backend/src/models/input/category.input.js — bỏ `description` khỏi CreateCategorySchema
- [~] backend/src/models/output/category.output.js — bỏ `description` khỏi CategoryOutput
- [~] backend/src/controllers/categoryController.js — bỏ destructure + ghi `description` ở create/update

---

## v5 — 2026-06-29

**Resource:** category
**Yêu cầu:** kiểm tra lại api get all danh mục và get theo id (admin)

Review 2 endpoint GET. `getAll` đạt yêu cầu (validate query, phân trang, count, output đúng; không dùng `mode:'insensitive'` là đúng cho MySQL). `getById` có lỗi: id không phải số → `parseInt` ra NaN → Prisma throw → trả 500 thay vì 404. Đã thêm guard `/^\d+$/.test(id)` (theo pattern pestEntry). Quyền GET giữ **public** theo xác nhận của user (phục vụ catalog customer).

| Method | Endpoint | Auth | Thay đổi |
|--------|----------|------|----------|
| GET    | /categories     | public | không đổi — đã đạt |
| GET    | /categories/:id | public | + guard id non-numeric → trả 404 thay vì 500 |

**Files:**
- [~] backend/src/controllers/categoryController.js — getById: thêm guard `if (!/^\d+$/.test(id)) return respond.notFound(res, ERR.NOT_FOUND)`

---

## v6 — 2026-06-29

**Resource:** product
**Yêu cầu:** thêm trường ingredient / safety_note / badge cho sản phẩm (đồng bộ DB v7)

| Method | Endpoint | Auth | Thay đổi |
|--------|----------|------|----------|
| POST   | /products     | admin  | request nhận thêm `ingredient`, `safety_note`, `badge` |
| PUT    | /products/:id | admin  | request nhận thêm `ingredient`, `safety_note`, `badge` |
| GET    | /products     | public | response trả thêm 3 field |
| GET    | /products/:id | public | response trả thêm 3 field |

**Files:**
- [~] backend/src/models/input/product.input.js — thêm `ingredient`, `safety_note`, `badge` (z.string optional; badge max 50)
- [~] backend/src/models/output/product.output.js — thêm `ingredient`, `safety_note`, `badge`
- [~] backend/src/controllers/productController.js — create: map `safety_note`→`safetyNote` + ghi 3 field; update: tách `safety_note` remap, `ingredient`/`badge` qua `...rest`

---

## v7 — 2026-06-29

**Resource:** product
**Yêu cầu:** thêm field specifications (thông số kỹ thuật rich-text) — đồng bộ DB v8

| Method | Endpoint | Auth | Thay đổi |
|--------|----------|------|----------|
| POST   | /products     | admin  | request nhận thêm `specifications` (HTML) |
| PUT    | /products/:id | admin  | request nhận thêm `specifications` (qua ...rest) |
| GET    | /products(/:id) | public | response trả thêm `specifications` |

**Files:**
- [~] backend/src/models/input/product.input.js — thêm `specifications` (z.string optional)
- [~] backend/src/models/output/product.output.js — thêm `specifications`
- [~] backend/src/controllers/productController.js — create: destructure + ghi `specifications`; update: qua `...rest`

---

## v8 — 2026-06-29

**Resource:** product
**Yêu cầu:** thêm hazard_level (mức độ nguy hiểm → màu hộp an toàn) — đồng bộ DB v9

| Method | Endpoint | Auth | Thay đổi |
|--------|----------|------|----------|
| POST/PUT | /products(/:id) | admin | request nhận `hazard_level` (enum NONE/TRUNG_BINH/NANG/NGUY_HIEM) |
| GET    | /products(/:id) | public | response trả `hazard_level` (mặc định NONE) |

**Files:**
- [~] backend/src/models/input/product.input.js — `hazard_level: z.enum([...]).optional()`
- [~] backend/src/models/output/product.output.js — `hazard_level` (?? 'NONE')
- [~] backend/src/controllers/productController.js — create: map `hazard_level`→`hazardLevel`; update: tách remap

---

## v9 — 2026-06-29

**Resource:** product
**Yêu cầu:** tạo các api liên quan đến sản phẩm (admin) → tách hiển thị public vs admin

CRUD sản phẩm đã có sẵn. Lần này: (1) sửa bug search, (2) tách hiển thị public/admin, (3) guard id getById.

| Method | Endpoint | Auth | Thay đổi |
|--------|----------|------|----------|
| GET    | /products     | optionalAuth | khách chỉ thấy `is_active=true`; admin thấy tất cả |
| GET    | /products/:id | optionalAuth | non-admin không xem được sản phẩm đã tắt (404); + guard id non-numeric |

**Sửa bug:** `getAll` bỏ `mode:'insensitive'` (MySQL không hỗ trợ → search trước đây trả 500).

**Files:**
- [~] backend/src/middlewares/auth.js — thêm `optionalAuth` (decode token nếu có, không chặn)
- [~] backend/src/routes/products.js — GET / và GET /:id dùng `optionalAuth`
- [~] backend/src/controllers/productController.js — getAll: `where.isActive` theo role; getById: ẩn hàng tắt với non-admin + guard id; bỏ `mode:'insensitive'`

---

## v10 — 2026-06-29

**Resource:** product
**Yêu cầu:** thiếu slug cho sản phẩm (GET theo slug + cho phép set/sửa slug)

| Method | Endpoint | Auth | Thay đổi |
|--------|----------|------|----------|
| GET    | /products/:id | optionalAuth | nhận cả **id số** hoặc **slug** (giống pestEntry) |
| POST   | /products     | admin | nhận `slug` tùy chọn (bỏ trống → auto-gen từ tên) |
| PUT    | /products/:id | admin | sửa được `slug` (qua ...rest) |

Slug đã có sẵn trong `ProductOutput` (list + detail) — không đổi.

**Files:**
- [~] backend/src/models/input/product.input.js — thêm `slug` (regex `^[a-z0-9-]+$`, optional)
- [~] backend/src/controllers/productController.js — create: dùng slug nhập hoặc auto-gen; getById: `isNumeric ? {id} : {slug}`; thêm P2002 (slug trùng) ở create + update

---

## v11 — 2026-06-29

**Resource:** product
**Yêu cầu:** chỉnh trường sản phẩm (đồng bộ DB v10)

| Method | Endpoint | Thay đổi |
|--------|----------|----------|
| POST/PUT | /products(/:id) | bỏ nhận `origin`, `expiry_days`, `ingredient`; nhận thêm `weight_unit` (kg/lít/ml), `hazard_note`, `video_url`; unit default `bao` |
| GET | /products(/:id) | output bỏ origin/expiry_days/ingredient; trả thêm weight_unit, hazard_note, video_url |

**Files:**
- [~] backend/src/models/input/product.input.js — −origin/−expiry_days/−ingredient; +weight_unit (enum), +hazard_note, +video_url (url)
- [~] backend/src/models/output/product.output.js — tương ứng
- [~] backend/src/controllers/productController.js — create: default unit 'bao', map weight_unit/hazard_note/video_url; update: tách remap 3 field mới, bỏ expiry_days

---

## v12 — 2026-06-29

**Resource:** product
**Yêu cầu:** kiểm tra api create sản phẩm (không tạo được)

**Chẩn đoán:** schema.prisma đã thêm/xóa nhiều cột (specifications, hazardLevel, hazardNote, videoUrl, weightUnit; bỏ origin/expiryDays/ingredient) nhưng **DB chưa sync** (chỉ có migration `init`). Controller `create` ghi cột mới → Prisma Client/DB chưa biết → throw → 500. GET vẫn chạy vì chỉ đọc cột cũ. Code create/input controller **không có lỗi logic**.

**Fix:** đẩy schema xuống DB + regenerate client (`prisma db push`).

**Files:**
- [~] backend/src/controllers/productController.js — thêm `console.error('[product.create]', ...)` trong catch để lộ lỗi thật khi debug

---

> Tự động cập nhật khi chạy `/api`.
> Không sửa tay trực tiếp.
