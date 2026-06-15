# Agent: /ui — Frontend React Component Agent

## Vai trò
Tạo React components và logic cho `frontend-admin`. Là agent cuối trong pipeline: **db → api → ui**.

## Khi nào dùng
- Tạo trang mới (page-level component)
- Tạo component tái sử dụng
- Tạo custom hook
- Tạo service layer gọi API

---

## INPUT

Đọc **tự động** các file sau (không hỏi user):

| # | File | Mục đích |
|---|------|----------|
| 1 | `stitch_product_catalog_crop_protection/admin/{screen}.html` | Tham chiếu thiết kế UI |
| 2 | `stitch_product_catalog_crop_protection/customer/{screen}.html` | Tham chiếu thiết kế UI |
| 3 | `backend/src/routes/` (tất cả) | Biết đúng endpoint URL và HTTP method |
| 4 | `frontend-admin/src/` (toàn bộ) | Tránh duplicate, theo convention hiện có |
| 5 | `thiết kế/UI_LOG.md` | Xác định version tiếp theo |

**User input:** `$ARGUMENTS` — tên màn hình hoặc component (vd: "products page", "login form", "order table", "product card")

**Map màn hình → HTML prototype:**
```
admin/overview      → stitch.../admin/overview.html
admin/products      → stitch.../admin/products.html
admin/orders        → stitch.../admin/orders.html
admin/add-product   → stitch.../admin/add_product_form.html
admin/edit-order    → stitch.../admin/edit_order.html
admin/moderate      → stitch.../admin/moderate_forum.html
customer/login      → stitch.../customer/login.html
customer/register   → stitch.../customer/register.html
customer/catalog    → stitch.../customer/catalog.html
customer/product    → stitch.../customer/product_detail.html
customer/checkout   → stitch.../customer/checkout.html
customer/dashboard  → stitch.../customer/dashboard.html
customer/forum      → stitch.../customer/forum.html
```

---

## CẤU TRÚC THƯ MỤC OUTPUT

```
frontend-admin/src/
├── pages/           ← Page-level components (route targets)
│   ├── admin/
│   └── customer/
├── components/      ← Reusable UI components
│   ├── common/      ← Button, Input, Modal, Table, Pagination...
│   ├── admin/       ← AdminLayout, Sidebar, AdminHeader...
│   └── customer/    ← ProductCard, CartItem, OrderRow...
├── hooks/           ← Custom React hooks
│   └── use{Resource}.js
├── services/        ← API call functions (axios)
│   └── {resource}Service.js
└── store/           ← Zustand state stores
    └── use{Resource}Store.js
```

---

## QUY TRÌNH THỰC THI

### Bước 1 — Phân tích yêu cầu
- Đọc tất cả INPUT files
- Xác định: loại component (page / component / hook / service)
- Tìm HTML prototype tương ứng (theo map trên) và đọc nó
- Xác định API endpoints cần gọi (từ routes files)
- Kiểm tra component đã tồn tại chưa

### Bước 2 — Lên kế hoạch
In ra trước khi tạo file:
```
[/ui] Kế hoạch:
  Màn hình  : {$ARGUMENTS}
  Prototype : stitch_product_catalog_crop_protection/.../{screen}.html
  Files tạo :
    - frontend-admin/src/pages/{path}/{ComponentName}.jsx (page)
    - frontend-admin/src/services/{resource}Service.js (nếu cần)
    - frontend-admin/src/hooks/use{Resource}.js (nếu cần)
  API calls :
    - {METHOD} /{endpoint} — {mô tả}
```

### Bước 3 — Tạo Service Layer (nếu chưa có)
Tạo `frontend-admin/src/services/{resource}Service.js`:

```js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

export const getAll{Resources} = () =>
  axios.get(`${API_URL}/{resource}`);

export const get{Resource}ById = (id) =>
  axios.get(`${API_URL}/{resource}/${id}`);

export const create{Resource} = (data) =>
  axios.post(`${API_URL}/{resource}`, data, getAuthHeader());

export const update{Resource} = (id, data) =>
  axios.put(`${API_URL}/{resource}/${id}`, data, getAuthHeader());

export const delete{Resource} = (id) =>
  axios.delete(`${API_URL}/{resource}/${id}`, getAuthHeader());
```

### Bước 4 — Tạo Custom Hook (nếu cần)
Tạo `frontend-admin/src/hooks/use{Resource}.js`:

```js
import { useState, useEffect } from 'react';
import { getAll{Resources} } from '../services/{resource}Service';

export const use{Resources} = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getAll{Resources}()
      .then(res => setData(res.data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
};
```

### Bước 5 — Tạo Component/Page
**Quy tắc quan trọng:**
- Đọc HTML prototype → lấy cấu trúc layout, tên section, màu sắc, các phần tử UI
- Convert HTML → JSX: đổi `class` → `className`, `for` → `htmlFor`
- Giữ nguyên ý định thiết kế từ prototype, không sáng tác lại UI
- Dùng Tailwind CSS class (hoặc CSS module nếu prototype dùng custom class)
- State management: `useState` cho local state, Zustand cho global

**Mẫu Page component:**
```jsx
import { useState } from 'react';
import { use{Resources} } from '../../hooks/use{Resource}';

const {Screen}Page = () => {
  const { data, loading, error } = use{Resources}();

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div>Lỗi: {error}</div>;

  return (
    <div className="...">
      {/* Layout theo HTML prototype */}
    </div>
  );
};

export default {Screen}Page;
```

**Mẫu Reusable component:**
```jsx
const {Component} = ({ prop1, prop2, onAction }) => {
  return (
    <div className="...">
      {/* ... */}
    </div>
  );
};

export default {Component};
```

### Bước 6 — Cập nhật log
Append vào `thiết kế/UI_LOG.md`:
```markdown
## v{N} — YYYY-MM-DD HH:mm

**Yêu cầu:** {$ARGUMENTS}
**Prototype tham chiếu:** {path}/...html

**Files tạo/cập nhật:**
- [+] frontend-admin/src/pages/.../ComponentName.jsx
- [+] frontend-admin/src/services/...Service.js
- [+] frontend-admin/src/hooks/use....js

**API endpoints sử dụng:**
- {METHOD} /{endpoint}
```

### Bước 7 — Báo cáo
```
[/ui] Hoàn tất
  INPUT    : prototype HTML + API routes
  SCREEN   : {$ARGUMENTS}
  OUTPUT   : {danh sách file tạo ra}
  LOG      : thiết kế/UI_LOG.md → v{N} added
  NEXT     : Cài axios nếu chưa có: `npm install axios` trong frontend-admin/
             Khởi động: `npm run dev` trong frontend-admin/
```

---

## CONVENTIONS

- File naming: PascalCase cho component (`ProductsPage.jsx`), camelCase cho hook/service (`useProducts.js`)
- Luôn dùng arrow function component, không dùng class component
- Export default cho component, named export cho hooks/services
- Không hardcode API URL — dùng `import.meta.env.VITE_API_URL`
- Token auth lưu ở `localStorage` key `'token'`
- Luôn handle 3 states: `loading`, `error`, `data`
- Không dùng `any` hay prop drilling sâu quá 2 cấp — dùng context hoặc Zustand
- Tên tiếng Việt trong UI text là bình thường (vd: "Danh sách sản phẩm")

## KHÔNG ĐƯỢC

- Sửa `frontend-admin/src/main.jsx` (entry point)
- Thêm npm package mà không thông báo cho user
- Bỏ qua HTML prototype — phải đọc nó trước khi viết UI
- Tự sáng tác layout hoàn toàn nếu có prototype tương ứng
