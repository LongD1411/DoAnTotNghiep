# Backend — Hệ thống Nhà nông

Node.js · Express · MySQL 8.0 · Prisma ORM · Docker

---

## Yêu cầu

| Công cụ | Phiên bản tối thiểu |
|---------|---------------------|
| [Docker Desktop](https://www.docker.com/products/docker-desktop/) | 24+ |

> Không cần cài Node.js, MySQL hay bất kỳ thứ gì khác — tất cả chạy trong Docker.

---

## Khởi động

### Bước 1 — Cấu hình môi trường

Mở `.env.docker`, đổi `JWT_SECRET` thành chuỗi bí mật của bạn:

```env
JWT_SECRET=chuoi_bi_mat_cua_ban_doi_truoc_khi_deploy
```

> Các giá trị còn lại (`DATABASE_URL`, `PORT`...) đã được cấu hình sẵn, không cần chỉnh.

### Bước 2 — Build và chạy

```bash
docker compose up --build
```

Docker tự động thực hiện theo thứ tự:
1. Khởi động MySQL 8.0 — chờ đến khi healthy
2. Build backend image
3. Chạy `prisma db push` — tạo/cập nhật bảng trong DB
4. Khởi động server với nodemon (hot-reload)

Log mong đợi:
```
backend  | >>> Pushing Prisma schema to database...
backend  | >>> Starting server...
backend  | Server running on port 3000
```

### Bước 3 — Kiểm tra

```powershell
Invoke-RestMethod http://localhost:3000
```

Kết quả: `{ message: "Welcome to Farmer System Backend" }`

---

## Workflow hàng ngày

| Tình huống | Lệnh |
|---|---|
| **Lần đầu** hoặc sau khi sửa `Dockerfile` / `package.json` | `docker compose up --build` |
| **Chạy bình thường** (đã build rồi) | `docker compose up` |
| **Sửa code** → nodemon tự restart, không cần làm gì thêm | — |
| **Sửa `schema.prisma`** → restart container là DB tự cập nhật | `docker compose restart backend` |
| Chạy nền (không chiếm terminal) | `docker compose up -d` |
| Dừng (giữ lại data) | `docker compose down` |
| **Reset toàn bộ** (xóa cả data DB) | `docker compose down -v` |

---

## Lệnh Docker thường dùng

```bash
# Xem trạng thái containers
docker compose ps

# Xem log realtime
docker compose logs -f backend

# Truy cập shell trong container backend
docker compose exec backend sh

# Truy cập MySQL trực tiếp
docker compose exec db mysql -u longd -pfarmer123 farmer_system

# Mở Prisma Studio (quản lý DB qua giao diện web, port 5555)
docker compose exec backend npx prisma studio
```

---

## Thông tin kết nối

| Service | URL |
|---------|-----|
| Backend API | http://localhost:3000 |
| MySQL (từ host) | localhost:**3308** |

---

## API Endpoints

### Auth

| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| POST | `/auth/register` | — | Đăng ký (`role` mặc định: `customer`) |
| POST | `/auth/login` | — | Đăng nhập → `accessToken` (15m) + `refreshToken` (7d) |
| POST | `/auth/refresh` | — | Cấp lại `accessToken`, rotate `refreshToken` |
| POST | `/auth/logout` | — | Vô hiệu hóa `refreshToken` |
| GET | `/auth/me` | Bearer token | Thông tin tài khoản hiện tại |

**Gửi access token trong header:**
```
Authorization: Bearer <accessToken>
```

**Body cho `/refresh` và `/logout`:**
```json
{ "refreshToken": "<refreshToken>" }
```

### Products

| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| GET | `/products` | — | Danh sách (`?search=&page=&limit=`) |
| GET | `/products/:id` | — | Chi tiết sản phẩm |
| POST | `/products` | admin | Tạo sản phẩm |
| PUT | `/products/:id` | admin | Cập nhật sản phẩm |
| DELETE | `/products/:id` | admin | Xóa sản phẩm |

### Users _(admin only)_

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/users` | Danh sách (`?search=&page=&limit=`) |
| GET | `/users/:id` | Chi tiết user |
| PUT | `/users/:id/role` | Đổi role (`customer` / `mod` / `admin`) |
| DELETE | `/users/:id` | Xóa user |

---

## Cấu trúc thư mục

```
backend/
├── prisma/
│   └── schema.prisma           # Models, relations
├── src/
│   ├── common/
│   │   ├── response.js         # HTTP codes, ERR codes, respond helpers
│   │   └── schema.js           # QuerySchema, listOutput factory
│   ├── config/
│   │   └── database.js         # Prisma client singleton
│   ├── controllers/            # Logic xử lý request
│   ├── middlewares/
│   │   └── auth.js             # authenticateToken, authorizeRole
│   ├── models/
│   │   ├── input/              # Zod schemas (validate request)
│   │   └── output/             # Serializers (shape response)
│   └── routes/                 # Định nghĩa endpoints
├── .env.docker                 # Biến môi trường
├── docker-compose.yml
├── Dockerfile
└── entrypoint.sh               # prisma db push → npm run dev
```

---

## Response format

```json
// Thành công
{ "success": true, "data": { ... } }

// Lỗi
{ "success": false, "code": "ER001", "message": "Có lỗi trong xử lý dữ liệu, vui lòng thử lại" }
```

---

## Xử lý lỗi thường gặp

**Container backend crash ngay khi khởi động**
```bash
docker compose logs backend
```

**`Can't reach database server` (P1001)**
Chờ DB healthy hoặc kiểm tra `docker compose ps`. `DATABASE_URL` phải dùng hostname `db`, không phải `localhost`.

**Port 3000 hoặc 3308 đã bị chiếm**
Đổi port trong `docker-compose.yml`: `"3001:3000"` hoặc `"3309:3306"`.
