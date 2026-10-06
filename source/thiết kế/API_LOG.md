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

## v13 — 2026-06-29

**Resource:** upload
**Yêu cầu:** khi lưu form lỗi thì không để ảnh mồ côi trên server (đang up ảnh dù call API lưu lỗi)

**Nguyên nhân:** frontend `resolveImages` upload File lên T3/Cloudinary TRƯỚC khi gọi create/update. Save lỗi (server 500 / slug trùng...) → ảnh đã upload → rác.

**Giải pháp:** thêm endpoint xóa ảnh để frontend rollback trong `catch`.

| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| DELETE | /upload  | token | body `{ url }` → `deleteFromT3(url)` — xóa ảnh (rollback khi lưu lỗi) |

**Files:**
- [~] backend/src/controllers/uploadController.js — thêm `remove` (xóa ảnh theo url)
- [~] backend/src/routes/upload.js — `router.delete('/', authenticateToken, remove)`
- [~] frontend-admin/src/services/uploadService.js — thêm `deleteImage(url)`
- [~] frontend-admin/src/pages/admin/ProductFormPage.jsx — rollback: khi create/update lỗi → xóa `uploadedNow` (ảnh vừa upload từ File)
- [~] .claude/commands/ui.md — lưu quy tắc upload/rollback vào CONVENTIONS + KHÔNG ĐƯỢC
- [~] .claude/commands/api.md — quy tắc endpoint upload phải có DELETE; sửa convention search (bỏ mode:'insensitive')

---

## v14 — 2026-06-29 (refactor)

**Resource:** product
**Yêu cầu:** refactor — upload ảnh đúng cách (không upload rồi xóa)

Chuyển create/update sang **multipart**: frontend gửi field `data` (JSON) + `images` (File). Backend validate `data` TRƯỚC → mới upload file → lưu DB → rollback (`deleteFromT3`) nếu DB lỗi. Validate lỗi ⇒ KHÔNG upload gì. Bỏ hẳn cơ chế client upload-rời + xóa-bù.

| Method | Endpoint | Thay đổi |
|--------|----------|----------|
| POST/PUT | /products(/:id) | nhận multipart: `data` (JSON, có `existing_images`) + `images` (File); upload server-side sau validate + rollback khi lưu lỗi |

**Files:**
- [~] backend/src/routes/products.js — `multer.array('images', 5)` trên POST/PUT
- [~] backend/src/controllers/productController.js — helper `parseData`/`uploadFiles`/`rollbackImages`; rewrite create+update (validate→upload→save→rollback)
- [~] backend/src/models/input/product.input.js — `images` → `existing_images`
- [~] frontend-admin/src/services/productService.js — `buildFormData` gửi multipart
- [~] frontend-admin/src/pages/admin/ProductFormPage.jsx — bỏ resolveImages/deleteImage; `create/updateProduct(payload, form.images)`
- [~] .claude/commands/ui.md + api.md — cập nhật convention sang chuẩn multipart-server-side

**Ghi chú:** EncyclopediaFormPage vẫn dùng cơ chế cũ (upload rời + rollback client) — cần migrate sang multipart theo mẫu product (follow-up).

---

## v15 — 2026-06-29

**Resource:** product
**Yêu cầu:** PUT chưa xóa ảnh cũ khi update

**Lỗi:** update thay ProductImage (`deleteMany` + `create`) nhưng KHÔNG xóa file cũ trên storage → ảnh bị gỡ thành mồ côi.

**Fix:** trong `update`, lấy `oldUrls` (ảnh hiện tại) TRƯỚC khi ghi; sau khi update DB thành công, `deleteImages(oldUrls \ finalImages)` — xóa khỏi T3 các URL không còn trong danh sách mới. Chỉ xóa khi update thành công (DB lỗi → giữ nguyên ảnh cũ).

**Files:**
- [~] backend/src/controllers/productController.js — update: prefetch oldUrls + dọn ảnh bị gỡ sau update; rename helper `rollbackImages` → `deleteImages` (dùng chung rollback + cleanup)

---

## v16 — 2026-06-29

**Resource:** product
**Yêu cầu:** xóa sản phẩm — soft-delete (đồng bộ DB v11)

| Method | Endpoint | Thay đổi |
|--------|----------|----------|
| DELETE | /products/:id | set `deletedAt = now()` thay vì xóa cứng (giữ lịch sử đơn, hết FK P2003) |
| GET | /products     | where thêm `deletedAt: null` |
| GET | /products/:id | trả 404 nếu `deletedAt` khác null |

**Files:**
- [~] backend/src/controllers/productController.js — getAll: `where.deletedAt = null`; getById: 404 khi đã xóa; remove: `update({ deletedAt })` thay `delete`

---

## v17 — 2026-06-29

**Resource:** review
**Yêu cầu:** build API Review (chuẩn bị nối phần đánh giá ở trang chi tiết customer)

Model `Review` đã có sẵn. Tạo API list theo sản phẩm (kèm summary rating) + gửi đánh giá.

| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| GET  | /reviews?product_id=&page=&limit= | public | list review 1 SP + `summary { average, total, distribution[5★..1★] }` |
| POST | /reviews | đăng nhập | gửi đánh giá (rating 1–5, comment); `verified_purchase` tự tính theo OrderItem; 1 review/SP/user |

**ERR mới:** `ER301` REVIEW_DUP — "Bạn đã đánh giá sản phẩm này rồi" (P2002 do @@unique[productId,userId]).

**Files:**
- [+] backend/src/models/input/review.input.js
- [+] backend/src/models/output/review.output.js
- [+] backend/src/controllers/reviewController.js
- [+] backend/src/routes/reviews.js
- [~] backend/src/index.js — app.use('/reviews')
- [~] backend/src/common/response.js — + ERR.REVIEW_DUP

---

## v18 — 2026-06-29

**Resource:** review
**Yêu cầu:** mỗi lần mua được đánh giá 1 lần (đồng bộ DB v12)

Đổi từ "1 review/SP/user" → **"1 review/lần mua (order item)"**.

| Method | Endpoint | Auth | Thay đổi |
|--------|----------|------|----------|
| POST | /reviews | đăng nhập | body `{ order_item_id, rating, comment }` (bỏ product_id); validate order item thuộc user + đơn `delivered/completed`; productId suy từ order item; 1 review/order item |

**ERR:** `ER301` REVIEW_DUP đổi message → "Lần mua này đã được đánh giá"; + `ER302` REVIEW_NOT_ALLOWED — "Bạn chỉ có thể đánh giá sản phẩm trong đơn đã nhận của mình".

**Files:**
- [~] backend/src/models/input/review.input.js — `product_id` → `order_item_id`
- [~] backend/src/models/output/review.output.js — + `order_item_id`
- [~] backend/src/controllers/reviewController.js — create: validate order item (ownership + status) → tạo review theo order item
- [~] backend/src/common/response.js — REVIEW_DUP message + REVIEW_NOT_ALLOWED

---

## v19 — 2026-06-29

**Resource:** post
**Yêu cầu:** kiểm tra/tạo API create bài viết (multipart vì có ảnh trong nội dung)

Chưa có API post → tạo mới. Ảnh inline trong nội dung dùng **multipart + placeholder**: content chứa `__IMG_i__`, files[i] tương ứng; upload SAU validate, thay placeholder bằng URL thật, rollback nếu DB lỗi.

| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| GET  | /posts | optionalAuth | list; khách chỉ thấy `status='published'`, staff thấy tất cả; filter search/category_id |
| GET  | /posts/:id | optionalAuth | chi tiết theo id/slug; bài chưa duyệt chỉ staff/tác giả xem; +viewCount |
| POST | /posts | đăng nhập | multipart `data{title,category_id,content}` + `images[]`; upload→thay `__IMG_i__`→lưu (status pending) |

**Files:**
- [+] backend/src/models/input/post.input.js
- [+] backend/src/models/output/post.output.js
- [+] backend/src/controllers/postController.js
- [+] backend/src/routes/posts.js (multer.array('images', 10))
- [~] backend/src/index.js — app.use('/posts')

**Phụ thuộc:** `category_id` là id của **ForumCategory** (chưa có API/seed) — frontend cần lấy danh mục thật để gửi đúng id. update/delete/like/comment chưa làm (follow-up).

---

## v20 — 2026-06-29

**Resource:** forum-category
**Yêu cầu:** tạo GET /forum-categories + seed data (như mock) vào DB

| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| GET | /forum-categories | public | danh sách chủ đề diễn đàn (trả mảng, không phân trang) — `[{id,name,slug,description,order,post_count}]` |

**Seed (đã chạy vào DB):** #1 Sâu & Bệnh (pest) · #2 Mẹo Nông Nghiệp (tips) · #3 Chung (general) — dùng cho `category_id` khi tạo bài viết.

**Files:**
- [+] backend/src/models/output/forumCategory.output.js
- [+] backend/src/controllers/forumCategoryController.js
- [+] backend/src/routes/forumCategories.js
- [+] backend/prisma/seedForum.js (script seed — chạy: `docker compose exec backend node prisma/seedForum.js`)
- [~] backend/src/index.js — app.use('/forum-categories')

---

## v21 — 2026-06-29

**Resource:** post
**Yêu cầu:** dọn logic dư thừa create + đảm bảo tạo bài lỗi thì KHÔNG upload ảnh lên cloud

**Thay đổi (postController.create):**
- [~] Kiểm tra `forumCategory` tồn tại **TRƯỚC** khi upload → chủ đề sai (lỗi hay gặp nhất) trả 400 mà **chưa đẩy ảnh nào lên cloud**
- [~] Gộp 2 khối `try` (upload + DB) làm 1 → gọn hơn
- [~] Bỏ nhánh `P2003` (giờ dư — category đã pre-check); vẫn giữ `deleteImages(uploaded)` trong catch để rollback nếu lỗi bất ngờ sau upload

**Giới hạn (bản chất):** ảnh phải upload TRƯỚC khi insert (vì content cần URL thật thay placeholder). Nay mọi lỗi kiểm-tra-được (validate, chủ đề) đều xảy ra trước upload; chỉ lỗi DB bất ngờ mới upload-rồi-rollback (đảm bảo không mồ côi).

---

## v22 — 2026-06-29

**Resource:** post (moderation)
**Yêu cầu:** thêm logic nếu là admin hoặc mod thì duyệt bài

| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| GET | /posts/pending | mod, admin | Hàng chờ duyệt (mặc định `status=pending`, cũ nhất trước). Khách/customer gọi → 403 |
| PATCH | /posts/:id/status | mod, admin | Đổi trạng thái bài: `published` (duyệt) · `hidden` (ẩn) · `pending` (trả lại chờ) |
| DELETE | /posts/:id | mod, admin | Không duyệt → xoá hẳn bài (cascade comment/image/report) + dọn ảnh cloud nhúng trong content |

**Thay đổi:**
- [~] `post.input.js`: thêm `ModeratePostSchema { status: enum(published|pending|hidden) }`; thêm `status` (optional) vào `PostQuerySchema` để staff lọc theo trạng thái
- [~] `postController.js`: thêm `getModeration` (hàng chờ, staff-only) + `moderate` (status → PostOutput) + `remove` (hard delete: đọc content lấy URL `res.cloudinary.com`, `prisma.post.delete` cascade, rồi `deleteImages` dọn cloud; P2025 → NOT_FOUND); `getAll` cho staff lọc `?status=` (khách vẫn ép `published`)
- [~] `posts.js`: `GET /pending` (đặt TRƯỚC `/:id`) + `PATCH /:id/status` + `DELETE /:id` — đều gắn authenticateToken + authorizeRole(['mod','admin'])

**Body mẫu:** `{ "status": "published" }` → duyệt bài. Khách/customer gọi → 403 (ER103).

---

---

## v23 — 2026-07-16

**Resource:** cart
**Yêu cầu:** làm các API giỏ hàng mapping với frontend (guest localStorage → đăng nhập đồng bộ)

| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| GET | /cart | token | Giỏ của user hiện tại (tự tạo nếu chưa có) |
| POST | /cart/items | token | Thêm sản phẩm — cộng dồn quantity, trần theo stock; hết hàng → ER501 |
| PUT | /cart/items/:productId | token | Đặt lại số lượng (trần stock); không có trong giỏ → 404 |
| DELETE | /cart/items/:productId | token | Bỏ sản phẩm khỏi giỏ (idempotent) |
| POST | /cart/sync | token | Merge giỏ guest (localStorage) sau đăng nhập — item không hợp lệ bị bỏ qua |

**Files:**
- [+] backend/src/models/input/cart.input.js — AddCartItem / UpdateCartItem / SyncCart (max 100 items)
- [+] backend/src/models/output/cart.output.js — CartOutput: items[] kèm product snapshot (id, name, slug, price, discount_price, unit, stock, image_url)
- [+] backend/src/controllers/cartController.js — `_getOrCreateCart` (upsert theo userId) · `_addItem` (kiểm tra isActive/deletedAt/stock, upsert cộng dồn) · mọi mutation trả `_fullCart` (giỏ đầy đủ) để FE set state 1 lần
- [+] backend/src/routes/carts.js — mount `/cart`, tất cả `authenticateToken` (mọi role)
- [~] backend/src/index.js — import + `app.use('/cart', ...)`
- [~] backend/src/common/response.js — thêm `ER501 OUT_OF_STOCK` ("Sản phẩm đã hết hàng hoặc không còn kinh doanh")
- [~] thiết kế/API_DOCS.md — section Cart + 5 dòng bảng tóm tắt

**Mapping frontend (services/cartService.js + store/useCartStore.js):**
- Guest: thao tác trên `localStorage['guest_cart']` (kèm snapshot sản phẩm) — KHÔNG gọi API
- Đăng nhập: mọi thao tác gọi API; response giỏ đầy đủ → `set({ items })`
- Sau login: `syncAfterLogin()` → `POST /cart/sync` rồi xoá bản local (nuốt lỗi, không chặn flow login)

---

## v24 — 2026-07-16

**Resource:** auth (profile)
**Yêu cầu:** API cho trang thông tin cá nhân customer (/tai-khoan) — sửa hồ sơ + đổi mật khẩu

| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| PUT | /auth/me | token | Sửa hồ sơ chính mình (`full_name` 1–30, `phone` ≤15/null); không đổi email/role; không có field → ER004 |
| PUT | /auth/me/password | token | Đổi mật khẩu: bcrypt compare mật khẩu hiện tại (sai → ER205), mật khẩu mới ≥ 6 ký tự |

**Files:**
- [~] backend/src/models/input/auth.input.js — thêm `UpdateProfileSchema`, `ChangePasswordSchema`
- [~] backend/src/controllers/authController.js — thêm `updateProfile`, `changePassword`; `getProfile` select thêm `phone`
- [~] backend/src/routes/auth.js — `PUT /me`, `PUT /me/password` (authenticateToken)
- [~] backend/src/models/output/user.output.js — `UserOutput` thêm `phone` (ProfileOutput reuse)
- [~] backend/src/common/response.js — thêm `ER205 BAD_PASSWORD` ("Mật khẩu hiện tại không đúng")
- [~] thiết kế/API_DOCS.md — 2 section mới + `phone` trong response GET /auth/me + 2 dòng bảng tóm tắt

**Ghi chú:** đổi mật khẩu KHÔNG thu hồi refresh token hiện có (phiên khác vẫn sống đến khi hết hạn 7 ngày) — nếu cần bảo mật chặt hơn thì xoá `refreshToken` của user sau khi đổi.


> Tự động cập nhật khi chạy `/api`.
> Không sửa tay trực tiếp.
