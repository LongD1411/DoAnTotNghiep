# Giải thích Công nghệ và Cấu trúc File trong Backend (BE)

Dưới đây là giải thích chi tiết về các công nghệ sử dụng trong backend (BE) của dự án Hệ thống Nhà nông, dựa trên file Tổng quan.txt và cấu trúc code hiện tại. Tôi sẽ chia thành 2 phần: **Công nghệ** và **Cấu trúc file**.

## 1. Giải thích các công nghệ sử dụng trong BE
Dự án sử dụng stack hiện đại cho backend scalable, bảo mật và dễ maintain:

- **Node.js**:
  - Là runtime JavaScript server-side, cho phép chạy JS ngoài browser.
  - Ưu điểm: Non-blocking I/O (event-driven), phù hợp API real-time; cộng đồng lớn; dùng chung JS với FE (Next.js/React).
  - Trong dự án: Chạy server Express, xử lý requests từ FE.

- **Express.js**:
  - Framework web nhẹ cho Node.js, xây dựng API RESTful.
  - Ưu điểm: Middleware-based (dễ thêm auth, logging); routing đơn giản; extensible với plugins.
  - Trong dự án: Xử lý routes (/auth, /products), middleware (JWT auth), và response JSON.

- **MySQL**:
  - Database relational (quan hệ), lưu trữ dữ liệu có cấu trúc.
  - Ưu điểm: ACID compliant (đảm bảo transaction); phù hợp data phức tạp như orders, users; query mạnh với JOIN.
  - Trong dự án: Lưu User, Product, Order, etc. (thông qua Prisma).

- **Prisma**:
  - ORM (Object-Relational Mapping) hiện đại cho database.
  - Ưu điểm: Schema-as-code (định nghĩa DB bằng code); auto-generate client; type-safe queries; migration dễ dàng; hỗ trợ MySQL.
  - Trong dự án: Định nghĩa schema (models, relations); generate client để query DB an toàn; migrate DB.

- **Các thư viện bổ sung** (từ package.json):
  - **bcryptjs**: Hash password cho bảo mật.
  - **jsonwebtoken**: Tạo/verify JWT cho auth.
  - **passport + passport-google-oauth20/facebook**: Xử lý OAuth social login.
  - **dotenv**: Load env variables (.env).
  - **ts-node**: Chạy TypeScript (cho Prisma client .ts).

Stack này phù hợp Phase 1 (e-commerce), dễ mở rộng cho Phase 2/3 (forum, AI).

## 2. Giải thích cấu trúc file trong thư mục `backend`
Thư mục `backend` theo chuẩn MVC-like với ES modules. Dưới đây là mô tả từng file/thư mục chính:

- **package.json**: 
  - Config dự án Node.js: dependencies (express, prisma, etc.), devDependencies (ts-node), scripts (start/dev).
  - Chạy `npm install` để cài; `npm run dev` để dev với ts-node.

- **prisma/schema.prisma**: 
  - Định nghĩa schema DB: models (User, Product, etc.), relations, datasource (MySQL).
  - Chạy `npx prisma generate` để tạo client; `npx prisma migrate dev` để apply schema lên DB.

- **prisma.config.ts**: 
  - Config Prisma: path schema, migrations, env.

- **.env**: 
  - Biến môi trường: DATABASE_URL (MySQL), JWT_SECRET, OAuth keys.
  - Không commit (đã trong .gitignore).

- **src/index.js**: 
  - Entry point server: Import routes, middleware; khởi tạo Express app; listen port 3000.

- **src/config/database.js**: 
  - Khởi tạo Prisma client để connect DB.

- **src/controllers/**: 
  - Logic xử lý business: authController.js (register/login), productController.js (get/create products).
  - Mỗi controller export functions cho routes.

- **src/routes/**: 
  - Định nghĩa API endpoints: auth.js (/register, /login), products.js (/products).
  - Import controllers, middleware (auth).

- **src/middlewares/auth.js**: 
  - Middleware: authenticateToken (verify JWT), authorizeRole (check permissions).

- **src/services/** (trống): 
  - Dành cho logic phức tạp (ví dụ: email service, payment).

- **src/utils/** (trống): 
  - Helpers: validation, formatting.

- **tests/** (trống): 
  - Unit/integration tests (sử dụng Jest hoặc Mocha).

- **public/** (trống): 
  - Static files: images, docs.

- **README.md**: 
  - Hướng dẫn setup, API docs, troubleshooting.

- **node_modules/**: 
  - Dependencies installed.

- **generated/** (từ Prisma): 
  - Client generated (không edit).

Cấu trúc này tách biệt concerns: routes (API), controllers (logic), config (DB), middlewares (auth). Dễ test, maintain, và scale.