# Agent: /api — Backend API Agent

## Vai trò
Tạo hoặc mở rộng REST API trong backend Express. Là agent giữa trong pipeline: **db → api → ui**.

---

## INPUT — Đọc tự động trước khi làm

| # | File | Mục đích |
|---|------|----------|
| 1 | `backend/prisma/schema.prisma` | Models, fields, relations → viết Prisma queries |
| 2 | `backend/src/index.js` | Routes đã đăng ký → tránh duplicate |
| 3 | `backend/src/routes/*.js` | Pattern hiện tại |
| 4 | `backend/src/controllers/*.js` | Pattern hiện tại |
| 5 | `backend/src/models/input/*.js` | Schemas đã có |
| 6 | `backend/src/models/output/*.js` | Serializers đã có |
| 7 | `backend/src/common/response.js` | ERR codes hiện tại — xem trước khi thêm code mới |
| 8 | `thiết kế/API_LOG.md` | Version tiếp theo |

**User input:** `$ARGUMENTS`

---

## CẤU TRÚC THƯ MỤC

```
backend/src/
├── common/
│   └── response.js          ← HTTP codes, ERR codes, respond helpers
├── models/
│   ├── input/               ← Zod schemas (validate request)
│   │   └── {resource}.input.js
│   └── output/              ← Serializers (shape response data)
│       └── {resource}.output.js
├── controllers/
│   └── {resource}Controller.js
├── routes/
│   └── {resource}.js
├── middlewares/
│   └── auth.js
└── config/
    └── database.js
```

---

## RESPONSE CONVENTION

Toàn bộ API dùng **1 shape duy nhất**. Frontend luôn check `success` trước:

```json
// Thành công (200 / 201)
{ "success": true, "data": { ... } }

// Lỗi
{ "success": false, "code": "ER001", "message": "Có lỗi trong xử lý dữ liệu, vui lòng thử lại" }
```

### Error codes — định nghĩa trong `backend/src/common/response.js`

> **Không được hard-code string message trong controller/route.** Chỉ dùng `ERR.*`.

| Code | Message | HTTP |
|------|---------|------|
| `ER001` | Có lỗi trong xử lý dữ liệu, vui lòng thử lại | 400 |
| `ER002` | Không tìm thấy dữ liệu | 404 |
| `ER003` | Lỗi hệ thống, vui lòng thử lại sau | 500 |
| `ER004` | Không có thông tin nào cần cập nhật | 400 |
| `ER101` | Lỗi xác thực, vui lòng đăng nhập lại | 401 |
| `ER102` | Lỗi xác thực, vui lòng đăng nhập lại | 401 |
| `ER103` | Bạn không có quyền thực hiện thao tác này | 403 |
| `ER201` | Email hoặc mật khẩu không đúng | 401 |
| `ER202` | Email này đã được sử dụng | 400 |
| `ER203` | Không thể thay đổi role của chính mình | 400 |
| `ER204` | Không thể xóa tài khoản của chính mình | 400 |

Khi thêm resource mới cần code nghiệp vụ riêng → thêm vào `ERR` trong `response.js` theo dải tiếp theo (`ER3xx`, `ER4xx`...).

### `respond` helpers (import từ `common/response.js`)

```js
respond.ok(res, data)           // 200 { success: true, data }
respond.created(res, data)      // 201 { success: true, data }
respond.badRequest(res, ERR.X)  // 400 { success: false, code, message }
respond.unauthorized(res, ERR.X)// 401
respond.forbidden(res, ERR.X)   // 403
respond.notFound(res, ERR.X)    // 404
respond.serverError(res, ERR.X) // 500
```

---

## QUY TRÌNH THỰC THI

### Bước 1 — Phân tích & lên kế hoạch
- Đọc tất cả INPUT files
- Xác định resource, Prisma model liên quan, endpoints cần tạo
- Kiểm tra file đã tồn tại chưa trước khi tạo

In ra trước khi code:
```
[/api] Kế hoạch:
  Resource  : {resource}
  Prisma    : {Model}
  Input     : backend/src/models/input/{resource}.input.js
  Output    : backend/src/models/output/{resource}.output.js
  Controller: backend/src/controllers/{resource}Controller.js
  Route     : backend/src/routes/{resource}.js
  Endpoints :
    GET    /{resource}        — public
    GET    /{resource}/:id    — public
    POST   /{resource}        — admin
    PUT    /{resource}/:id    — admin
    DELETE /{resource}/:id    — admin
  index.js  : thêm import + app.use
  ERR codes : {danh sách code nghiệp vụ mới nếu cần}
```

### Bước 2 — Thêm ERR code nghiệp vụ (nếu cần)
Nếu resource có lỗi nghiệp vụ riêng, thêm vào `backend/src/common/response.js`:
```js
// ER3xx — {Resource}
ER3xx: { code: 'ER3xx', message: 'Mô tả lỗi bằng tiếng Việt' },
```

### Bước 3 — Tạo Input Model
File: `backend/src/models/input/{resource}.input.js`

```js
import { z } from 'zod';

// Không dùng custom message trong Zod — backend chỉ trả ERR.VALIDATION, message không ra frontend
export const Create{Resource}Schema = z.object({
  field1:  z.string().min(1),
  field2:  z.number().nonnegative(),
  field3:  z.number().int().positive(),
  field4:  z.string().optional(),
  field5:  z.number().int().nonnegative().default(0),
  imageUrl: z.string().url().optional(),
});

// PUT — tất cả field optional
export const Update{Resource}Schema = z.object({
  field1:  z.string().min(1).optional(),
  field2:  z.number().nonnegative().optional(),
  field3:  z.number().int().positive().optional(),
  field4:  z.string().optional(),
  field5:  z.number().int().nonnegative().optional(),
});

// Query params — z.coerce tự convert string → number
export const {Resource}QuerySchema = z.object({
  search: z.string().optional(),
  page:   z.coerce.number().int().positive().default(1),
  limit:  z.coerce.number().int().positive().max(100).default(20),
});
```

**Zod validators hay dùng:**
| Validator | Ý nghĩa |
|-----------|---------|
| `z.string().min(1)` | String không rỗng |
| `z.string().email()` | Email hợp lệ |
| `z.string().url()` | URL hợp lệ |
| `z.number().nonnegative()` | Số ≥ 0 |
| `z.number().int().positive()` | Số nguyên > 0 |
| `z.coerce.number()` | Convert string → number (query params) |
| `z.enum(['a', 'b'])` | Giá trị trong danh sách |
| `.optional()` | Không bắt buộc |
| `.default(value)` | Giá trị mặc định |

### Bước 4 — Tạo Output Model
File: `backend/src/models/output/{resource}.output.js`

```js
export const {Resource}Output = (item) => ({
  id:        item.id,
  field1:    item.field1,
  field2:    item.field2,
  relation:  item.relation ?? undefined,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
});

export const {Resource}ListOutput = ({ data, total, page, limit }) => ({
  data:  data.map({Resource}Output),
  total,
  page,
  limit,
});
```

**Quy tắc:**
- Không expose `password`, `googleId`, `facebookId`, internal fields
- Dùng `?? undefined` cho relation (include có thể null)
- List luôn bọc trong `{ data, total, page, limit }`

### Bước 5 — Tạo Controller
File: `backend/src/controllers/{resource}Controller.js`

```js
import prisma from '../config/database.js';
import { Create{Resource}Schema, Update{Resource}Schema, {Resource}QuerySchema } from '../models/input/{resource}.input.js';
import { {Resource}Output, {Resource}ListOutput } from '../models/output/{resource}.output.js';
import { respond, ERR } from '../common/response.js';

const getAll = async (req, res) => {
  const result = {Resource}QuerySchema.safeParse(req.query);
  if (!result.success) return respond.badRequest(res, ERR.VALIDATION);
  const { search, page, limit } = result.data;
  try {
    const where = search ? { name: { contains: search, mode: 'insensitive' } } : {};
    const [items, total] = await Promise.all([
      prisma.{model}.findMany({ where, skip: (page - 1) * limit, take: limit, include: {...}, orderBy: { createdAt: 'desc' } }),
      prisma.{model}.count({ where }),
    ]);
    respond.ok(res, {Resource}ListOutput({ data: items, total, page, limit }));
  } catch {
    respond.serverError(res, ERR.SERVER);
  }
};

const getById = async (req, res) => {
  const { id } = req.params;
  try {
    const item = await prisma.{model}.findUnique({ where: { id: parseInt(id) }, include: {...} });
    if (!item) return respond.notFound(res, ERR.NOT_FOUND);
    respond.ok(res, {Resource}Output(item));
  } catch {
    respond.serverError(res, ERR.SERVER);
  }
};

const create = async (req, res) => {
  const result = Create{Resource}Schema.safeParse(req.body);
  if (!result.success) return respond.badRequest(res, ERR.VALIDATION);
  try {
    const item = await prisma.{model}.create({ data: result.data, include: {...} });
    respond.created(res, {Resource}Output(item));
  } catch (err) {
    if (err.code === 'P2003') return respond.badRequest(res, ERR.VALIDATION);
    respond.serverError(res, ERR.SERVER);
  }
};

const update = async (req, res) => {
  const { id } = req.params;
  const result = Update{Resource}Schema.safeParse(req.body);
  if (!result.success) return respond.badRequest(res, ERR.VALIDATION);
  const data = result.data;
  if (Object.keys(data).length === 0) return respond.badRequest(res, ERR.NO_UPDATE);
  try {
    const item = await prisma.{model}.update({ where: { id: parseInt(id) }, data, include: {...} });
    respond.ok(res, {Resource}Output(item));
  } catch (err) {
    if (err.code === 'P2025') return respond.notFound(res, ERR.NOT_FOUND);
    if (err.code === 'P2003') return respond.badRequest(res, ERR.VALIDATION);
    respond.serverError(res, ERR.SERVER);
  }
};

const remove = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.{model}.delete({ where: { id: parseInt(id) } });
    respond.ok(res, { message: '{Resource} deleted' });
  } catch (err) {
    if (err.code === 'P2025') return respond.notFound(res, ERR.NOT_FOUND);
    respond.serverError(res, ERR.SERVER);
  }
};

export { getAll, getById, create, update, remove };
```

**Quy tắc:**
- Validate bằng `Schema.safeParse()` → fail thì `respond.badRequest(res, ERR.VALIDATION)` ngay
- Dùng `result.data` (đã parsed + default) — không dùng `req.body` trực tiếp
- Wrap response qua `Output()` / `ListOutput()` — không trả Prisma object thô
- Prisma errors: `P2025` → `ERR.NOT_FOUND`, `P2003` → `ERR.VALIDATION`
- Chỉ dùng `ERR.*` — không hard-code string message

### Bước 6 — Tạo Route
File: `backend/src/routes/{resource}.js`

```js
import express from 'express';
import { getAll, getById, create, update, remove } from '../controllers/{resource}Controller.js';
import { authenticateToken, authorizeRole } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', getAll);
router.get('/:id', getById);
router.post('/', authenticateToken, authorizeRole(['admin']), create);
router.put('/:id', authenticateToken, authorizeRole(['admin']), update);
router.delete('/:id', authenticateToken, authorizeRole(['admin']), remove);

export default router;
```

**Phân quyền:**
| Role | Quyền |
|------|-------|
| public | GET list, GET by id |
| `customer` | cart, orders của mình, addresses của mình |
| `mod`, `admin` | approve/cancel orders, moderate forum |
| `admin` | CRUD products, categories, users |

### Bước 7 — Đăng ký trong index.js
```js
import {resource}Routes from './routes/{resource}.js';
app.use('/{resource}', {resource}Routes);
```

### Bước 8 — Cập nhật API_DOCS.md
Append vào `thiết kế/API_DOCS.md`:
- Mô tả từng endpoint: method, auth, request fields (bảng), response JSON mẫu, error codes có thể trả về
- Cập nhật bảng tóm tắt cuối file

### Bước 9 — Cập nhật API_LOG.md
```markdown
## v{N} — YYYY-MM-DD

**Resource:** {resource}
**Yêu cầu:** {$ARGUMENTS}

| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| ...    | ...      | ...  | ...   |

**Files:**
- [+] backend/src/models/input/{resource}.input.js
- [+] backend/src/models/output/{resource}.output.js
- [+] backend/src/controllers/{resource}Controller.js
- [+] backend/src/routes/{resource}.js
- [~] backend/src/index.js
- [~] backend/src/common/response.js  ← nếu có thêm ERR code
- [~] thiết kế/API_DOCS.md
```

### Bước 10 — Báo cáo
```
[/api] Hoàn tất
  RESOURCE : {resource}
  OUTPUT   : models/input, models/output, controller, route, index.js
  ENDPOINTS: {N} endpoints
  ERR codes: {danh sách code mới nếu có}
  LOG      : API_LOG.md → v{N}
  NEXT     : /ui {tên màn hình}
```

---

## CONVENTIONS

- ES Module (`import/export`) — không dùng `require`
- Tên file: `{resource}.input.js` · `{resource}.output.js` · `{resource}Controller.js` · `{resource}.js` (route)
- `parseInt(id)` khi convert route param
- Query: `z.coerce.number()` để tự convert string → number
- Pagination mặc định: `page=1`, `limit=20`, max `limit=100`
- Search: `contains` + `mode: 'insensitive'`

## KHÔNG ĐƯỢC

- Sửa `backend/src/config/database.js`
- Thêm npm package mới mà không hỏi user trước
- Xóa route/controller/model đang có khi không có yêu cầu rõ ràng
- Viết Input và Output chung 1 file — bắt buộc tách `input/` và `output/`
- Dùng Zod `.parse()` thay vì `.safeParse()` — sẽ throw exception không kiểm soát được
- Hard-code string message trong controller — chỉ dùng `ERR.*` từ `common/response.js`
- Dùng `res.status().json()` trực tiếp — chỉ dùng `respond.*` helpers
