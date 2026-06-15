# Agent: /api — Backend API Agent

## Vai trò
Tạo hoặc mở rộng REST API trong backend Express. Là agent giữa trong pipeline: **db → api → ui**.

## Khi nào dùng
- Tạo CRUD endpoints cho một resource mới
- Thêm endpoint đặc biệt (search, filter, bulk action...)
- Sửa logic controller hiện có
- Thêm middleware, phân quyền cho route

---

## INPUT

Đọc **tự động** các file sau (không hỏi user):

| # | File | Mục đích |
|---|------|----------|
| 1 | `backend/prisma/schema.prisma` | Biết models, fields, relations để viết Prisma queries |
| 2 | `backend/src/index.js` | Biết routes nào đã được đăng ký |
| 3 | `backend/src/routes/` (tất cả file) | Tránh duplicate, theo đúng pattern hiện tại |
| 4 | `backend/src/controllers/` (tất cả file) | Tránh duplicate, theo đúng pattern hiện tại |
| 5 | `backend/src/middlewares/auth.js` | Import đúng tên function `authenticateToken`, `authorizeRole` |
| 6 | `thiết kế/API_LOG.md` | Xác định version tiếp theo |

**User input:** `$ARGUMENTS` — tên resource hoặc mô tả feature (vd: "orders", "cart", "categories", "tìm kiếm sản phẩm theo tên")

---

## QUY TRÌNH THỰC THI

### Bước 1 — Phân tích yêu cầu
- Đọc tất cả INPUT files
- Xác định: resource là gì, endpoints nào cần tạo, model Prisma nào liên quan
- Kiểm tra xem route/controller đã tồn tại chưa (tránh overwrite không cần thiết)

### Bước 2 — Lên kế hoạch
In ra trước khi tạo file:
```
[/api] Kế hoạch:
  Resource  : {resource}
  Controller: backend/src/controllers/{resource}Controller.js (mới / cập nhật)
  Route     : backend/src/routes/{resource}.js (mới / cập nhật)
  Endpoints :
    GET    /{resource}           — public
    GET    /{resource}/:id       — public
    POST   /{resource}           — admin
    PUT    /{resource}/:id       — admin
    DELETE /{resource}/:id       — admin
  index.js  : thêm dòng import + app.use(...)
```

### Bước 3 — Tạo Controller
Tạo (hoặc cập nhật) `backend/src/controllers/{resource}Controller.js`:

**Mẫu chuẩn:**
```js
import prisma from '../config/database.js';

const getAll = async (req, res) => {
  try {
    const items = await prisma.{model}.findMany({ include: {...} });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch {resource}' });
  }
};

const getById = async (req, res) => {
  const { id } = req.params;
  try {
    const item = await prisma.{model}.findUnique({
      where: { id: parseInt(id) },
      include: {...}
    });
    if (!item) return res.status(404).json({ error: '{Resource} not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch {resource}' });
  }
};

// create, update, delete theo pattern tương tự

export { getAll, getById, create, update, remove };
```

**Quy tắc viết controller:**
- Luôn dùng `try/catch`
- Parse `req.params.id` với `parseInt(id)`
- Return 404 khi không tìm thấy record
- Return 400 cho validation error, 500 cho server error
- Không để lộ stack trace trong response
- Dùng tên export nhất quán: `getAll`, `getById`, `create`, `update`, `remove`

### Bước 4 — Tạo Route
Tạo (hoặc cập nhật) `backend/src/routes/{resource}.js`:

**Mẫu chuẩn:**
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

**Phân quyền theo resource:**
- public: GET list, GET by id cho hầu hết resources
- customer: cart, orders (của mình), addresses
- mod + admin: approve/cancel orders, moderate forum
- admin only: CRUD products, categories, users

### Bước 5 — Đăng ký route trong index.js
Thêm vào `backend/src/index.js`:
```js
import {resource}Routes from './routes/{resource}.js';
// ...
app.use('/{resource}', {resource}Routes);
```
Thêm đúng vị trí (sau các import hiện có, trước `app.listen`).

### Bước 6 — Cập nhật log
Append vào `thiết kế/API_LOG.md`:
```markdown
## v{N} — YYYY-MM-DD HH:mm

**Resource:** {resource}
**Yêu cầu:** {$ARGUMENTS}

**Endpoints tạo mới:**
| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| ...    | ...      | ...  | ...   |

**Files thay đổi:**
- [+] backend/src/controllers/{resource}Controller.js
- [+] backend/src/routes/{resource}.js
- [~] backend/src/index.js
```

### Bước 7 — Báo cáo
```
[/api] Hoàn tất
  INPUT    : schema.prisma + existing routes
  RESOURCE : {resource}
  OUTPUT   : backend/src/controllers/{resource}Controller.js
             backend/src/routes/{resource}.js
             backend/src/index.js (updated)
  ENDPOINTS: {N} endpoints
  LOG      : thiết kế/API_LOG.md → v{N} added
  NEXT     : Nếu cần UI → /ui {tên màn hình}
```

---

## CONVENTIONS

- Luôn dùng ES Module (`import/export`, không dùng `require`)
- File naming: camelCase cho controller (`orderController.js`), lowercase cho route (`orders.js`)
- Prisma: luôn dùng `parseInt()` khi convert id từ params
- Pagination: nếu GET list, thêm support `?page=1&limit=20` (default limit 20)
- Search: nếu resource có `name` field, thêm `?search=` với `contains` + `mode: 'insensitive'`
- Không dùng `res.send()` — luôn dùng `res.json()`

## KHÔNG ĐƯỢC

- Sửa `backend/src/config/database.js` hoặc `backend/src/middlewares/auth.js`
- Thêm dependency mới vào `package.json` (hỏi user trước)
- Xóa route/controller đang có mà không có yêu cầu rõ ràng
