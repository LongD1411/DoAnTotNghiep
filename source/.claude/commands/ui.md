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
├── router/
│   └── index.jsx    ← ⚠️ DUY NHẤT — toàn bộ route khai báo ở đây
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
- **Scan `frontend-admin/src/components/` để tìm component dùng lại** — nếu có Button, Input, Modal, Table tương tự thì import và dùng lại, không tạo mới

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
  axios.post(`${API_URL}/{resource}`, { ...data, localTime: new Date().toISOString() }, getAuthHeader());

export const update{Resource} = (id, data) =>
  axios.put(`${API_URL}/{resource}/${id}`, { ...data, localTime: new Date().toISOString() }, getAuthHeader());

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
- **Tái sử dụng component:** Ưu tiên dùng component đã có trong `components/common/` và `components/admin/` / `components/customer/` trước khi tạo mới

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

**Mẫu Form component (onChange validation + localTime):**
```jsx
const {Resource}Form = ({ onSubmit }) => {
  const [form, setForm] = useState({ name: '', ... });
  const [errors, setErrors] = useState({});

  const validate = (field, value) => {
    const newErrors = { ...errors };
    if (field === 'name') {
      if (!value.trim()) newErrors.name = 'Không được để trống';
      else delete newErrors.name;
    }
    // ... validate các field khác
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    validate(name, value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validate all fields trước khi submit
    const allValid = Object.keys(form).every(k => validate(k, form[k]));
    if (!allValid) return;
    onSubmit({ ...form, localTime: new Date().toISOString() });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" value={form.name} onChange={handleChange} />
      {errors.name && <span className="text-red-500">{errors.name}</span>}
      <button type="submit" disabled={Object.keys(errors).length > 0}>Lưu</button>
    </form>
  );
};
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

### Bước 6 — Đăng ký route (bắt buộc nếu tạo page mới)
Mở `frontend-admin/src/router/index.jsx`:
1. Thêm import page vừa tạo (bỏ comment nếu đã có, hoặc thêm dòng mới)
2. Thêm `<Route path="..." element={...} />` tương ứng (trong PrivateRoute nếu cần đăng nhập)

```jsx
// 1. Thêm import
import {ComponentName} from '../pages/{path}/{ComponentName}';

// 2. Thêm Route trong <Routes>
<Route path="/{path}" element={<PrivateRoute><{ComponentName} /></PrivateRoute>} />
```

### Bước 7 — Cập nhật log
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
- **Validation dùng `onChange`:** Validate từng field ngay khi user nhập (onChange), không đợi đến submit. Mỗi field có state lỗi riêng (vd: `errors.email`). Submit chỉ block nếu còn lỗi chưa giải quyết
- **`localTime` bắt buộc khi submit form tạo/cập nhật:** Mọi POST và PUT request phải đính kèm `localTime: new Date().toISOString()` trong body để backend kiểm tra exclusive access
- **Container width chuẩn customer page:** Dùng `px-4 md:px-10 lg:px-20 xl:px-40` trên container chính — không thêm `max-w-*` hay `mx-auto` trên chính container đó. Đồng nhất với `HomePage` và `CustomerLayout`. Không tự thay đổi padding này.
- **Font size chuẩn customer page (đồng nhất với HomePage):** Hero subtitle `text-lg md:text-xl font-medium`; quick-filter chip label `text-sm font-semibold`; card/section action link ("Xem chi tiết", "Xem tất cả") `text-base font-bold`; card title `text-lg font-bold`; card description `text-sm`; badge/category label `text-xs font-semibold uppercase`.
- **Font size chuẩn cho auth/form page:** label dùng `text-base font-semibold`, lỗi validation dùng `text-sm`, error server dùng `text-base`, link phụ dùng `text-base`, footer link dùng `text-base` — không dùng `text-sm` cho các element này
- **Loading overlay bắt buộc khi call API:** Mọi page có async API call phải dùng `<LoadingOverlay visible={loading} />` (import từ `components/common/LoadingOverlay`). Component này hiển thị màn hình mờ + spinner xoay ở giữa trong suốt thời gian chờ response. Wrap toàn bộ JSX trong `<>...</>` fragment để đặt LoadingOverlay ngoài cùng.
- **Màu primary hệ thống:** `--color-primary: #4bee2b` (xanh lá sáng, trong `frontend-admin/src/index.css`). Dùng cho: hero badge (`bg-primary/90`), accent text (`text-primary`), hero CTA button (`bg-primary`), active chip (`bg-[#2E7D32]`). Màu đậm là `#2E7D32` (brand dark) — dùng cho text xanh, active state, hover trên button phụ.
- **Button action phụ ("Thêm", secondary CTA):** Luôn dùng class sau, KHÔNG thay đổi theo context hay discount: `bg-[#e9f3e7] dark:bg-white/10 text-[#2E7D32] dark:text-primary hover:bg-[#2E7D32] hover:text-white dark:hover:bg-[#2E7D32] transition-colors`. Hero CTA dùng `bg-primary hover:bg-[#3ed622] text-[#101b0d]` (khác biệt). Khai báo hằng `const BTN_ADD = '...'` ở đầu file để tái sử dụng.
- **Scroll khi đổi trang (pagination):** Mọi page có phân trang phải scroll lên đầu khối nội dung khi người dùng chuyển trang. Dùng `useRef` gắn vào container chứa grid/list, hàm `goToPage` tính offset 80px để tránh bị sticky header che: `const y = ref.current.getBoundingClientRect().top + window.scrollY - 80; window.scrollTo({ top: y, behavior: 'smooth' });`
- **CustomerLayout — layout chung phía customer:** Mọi page customer PHẢI wrap trong `<CustomerLayout>` thay vì tự viết header/footer. File: `components/customer/CustomerLayout.jsx`. Hai chế độ: (1) **Controlled** — page truyền `searchValue` + `onSearchChange` để điều khiển thanh tìm kiếm header (ví dụ: HomePage lọc product list); (2) **Uncontrolled** — không truyền prop, header search dùng state nội bộ, Enter → `navigate('/catalog?q=...')`. Nav links tập trung ở hằng `NAV_LINKS` trong file layout — muốn thêm/đổi link chỉ sửa một chỗ.
- **Dropdown / Select mặc định:** KHÔNG dùng native `<select>/<option>` — luôn dùng `components/common/Select.jsx`. Usage: `<Select value={val} options={[{ value, label }]} onChange={(val) => ...} />`. Prop `className` để override width nếu cần (mặc định co theo nội dung). Component tự xử lý: đóng khi click ngoài, chevron xoay 180°, item active highlight xanh + checkmark. Import: `import Select from '../../components/common/Select';`

## KHÔNG ĐƯỢC

- Sửa `frontend-admin/src/main.jsx` (entry point)
- Thêm npm package mà không thông báo cho user
- Bỏ qua HTML prototype — phải đọc nó trước khi viết UI
- Tự sáng tác layout hoàn toàn nếu có prototype tương ứng
- Dùng `onBlur` hay `onSubmit` làm trigger validation chính — phải dùng `onChange`
- Gửi POST/PUT mà không có `localTime` trong body
- Tạo component mới khi đã có component tương tự trong `components/` — phải tái sử dụng
- Tạo page mới mà không đăng ký route trong `frontend-admin/src/router/index.jsx`
