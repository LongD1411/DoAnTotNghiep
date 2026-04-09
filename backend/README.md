# Backend Hệ thống Nhà nông

Đây là backend cho dự án Hệ thống Nhà nông, xây dựng bằng Node.js, Express, MySQL và Prisma.

## Cấu trúc dự án

- `src/`: Mã nguồn chính
  - `config/`: Cấu hình database
  - `controllers/`: Xử lý logic request
  - `middlewares/`: Middleware xác thực và xử lý chung
  - `routes/`: Định nghĩa API routes
  - `services/`: Logic nghiệp vụ mở rộng
  - `utils/`: Hàm hỗ trợ và tiện ích
- `prisma/`: Định nghĩa schema database và migration
- `tests/`: Unit/integration tests
- `public/`: File tĩnh

## Cài đặt

Có hai cách chạy dự án: dùng Docker hoặc chạy trực tiếp trên máy.

### Option 1: Chạy với Docker

1. Chạy Docker Compose:
   ```bash
   docker compose up --build
   ```
2. Ứng dụng sẽ chạy trên `http://localhost:3000`.

> Khi chạy bằng Docker, bạn không cần `npm install` trên máy host.

### Option 2: Chạy trực tiếp trên máy

1. Cài dependencies:
   ```bash
   npm install
   ```
2. Cấu hình database:
   - Đảm bảo MySQL đang chạy.
   - Cập nhật `.env` với thông tin kết nối database.
3. Chạy migration:
   ```bash
   npx prisma migrate dev --name init
   ```
4. Tạo Prisma client:
   ```bash
   npx prisma generate
   ```
5. Chạy server:
   ```bash
   npm run dev
   ```

## Docker

Sử dụng Docker Compose để chạy backend và MySQL cùng nhau:

```bash
docker compose up --build
```

Docker sẽ tạo 2 service:
- `db`: MySQL
- `backend`: ứng dụng Node.js

Cấu hình Docker dùng file `docker-compose.yml` và `.env.docker`.

## API Endpoints

- `POST /auth/register` - Đăng ký người dùng
- `POST /auth/login` - Đăng nhập và nhận JWT
- `GET /products` - Lấy danh sách sản phẩm
- `POST /products` - Tạo sản phẩm mới (chỉ admin)

## Biến môi trường

- `DATABASE_URL`: chuỗi kết nối MySQL
- `JWT_SECRET`: secret dùng để sign JWT
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`: OAuth Google
- `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET`: OAuth Facebook
- `PORT`: cổng chạy server (mặc định 3000)

## Xử lý lỗi

- Nếu không kết nối được database, kiểm tra MySQL và thông tin trong `.env`.
- Nếu dùng OAuth, kiểm tra cấu hình client ID/secret trên dashboard của nhà cung cấp.