# API Agent — Version Log

| Version | Thời gian | Resource | Endpoints | Files thay đổi |
|---------|-----------|----------|-----------|----------------|
| v1 | 2026-05-25 | auth + users | 7 endpoints | authController, auth route, usersController, users route, index.js |
| v2 | 2026-05-25 | products (đầy đủ) + API_DOCS | 5 endpoints | productController, products route, API_DOCS.md |
| v3 | 2026-05-25 | models layer (Input/Output) | — | auth.model, product.model, user.model + cập nhật 3 controllers |

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

> Tự động cập nhật khi chạy `/api`.
> Không sửa tay trực tiếp.
