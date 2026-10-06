# API Documentation — Hệ thống Nhà nông

**Base URL:** `http://localhost:3000`
**Content-Type:** `application/json`
**Cập nhật:** 2026-05-25

---

## Xác thực (Authentication)

Các endpoint yêu cầu đăng nhập phải gửi token trong header:

```
Authorization: Bearer <token>
```

Token nhận được sau khi gọi `POST /auth/login`, hết hạn sau **7 ngày**.

**Phân quyền (role):**
| Role | Mô tả |
|------|-------|
| `customer` | Người dùng thông thường |
| `mod` | Điều phối viên |
| `admin` | Quản trị viên, truy cập toàn bộ API |

---

## Mã lỗi chung

| HTTP Status | Ý nghĩa |
|-------------|---------|
| `400` | Thiếu hoặc sai dữ liệu đầu vào |
| `401` | Chưa đăng nhập / token không hợp lệ |
| `403` | Không đủ quyền |
| `404` | Không tìm thấy resource |
| `500` | Lỗi server |

Tất cả lỗi trả về dạng:
```json
{ "error": "Mô tả lỗi" }
```

---

## Auth

### POST /auth/register

Đăng ký tài khoản mới. Role mặc định là `customer`.

**Auth:** Không yêu cầu

**Request body:**
```json
{
  "email": "user@example.com",
  "password": "matkhau123",
  "name": "Nguyen Van A"
}
```

| Field | Type | Bắt buộc | Ghi chú |
|-------|------|----------|---------|
| `email` | string | ✅ | Phải là email hợp lệ, không trùng |
| `password` | string | ✅ | |
| `name` | string | ✅ | |

**Response `201`:**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "Nguyen Van A",
    "role": "customer"
  }
}
```

**Lỗi:**
| Status | error | Nguyên nhân |
|--------|-------|-------------|
| `400` | `"email, password, name are required"` | Thiếu field |
| `400` | `"Email already exists"` | Email đã đăng ký |

---

### POST /auth/login

Đăng nhập, nhận JWT token.

**Auth:** Không yêu cầu

**Request body:**
```json
{
  "email": "user@example.com",
  "password": "matkhau123"
}
```

| Field | Type | Bắt buộc |
|-------|------|----------|
| `email` | string | ✅ |
| `password` | string | ✅ |

**Response `200`:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "Nguyen Van A",
    "role": "customer"
  }
}
```

> Lưu `token` để dùng cho các request cần xác thực. Token có hiệu lực **7 ngày**.

**Lỗi:**
| Status | error | Nguyên nhân |
|--------|-------|-------------|
| `400` | `"email and password are required"` | Thiếu field |
| `401` | `"Invalid credentials"` | Sai email hoặc mật khẩu |

---

### GET /auth/me

Xem thông tin tài khoản đang đăng nhập.

**Auth:** Bắt buộc (mọi role)

**Request:** Không có body

**Response `200`:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "Nguyen Van A",
  "phone": "0901234567",
  "role": "customer",
  "createdAt": "2026-05-25T14:24:43.362Z"
}
```

**Lỗi:**
| Status | error | Nguyên nhân |
|--------|-------|-------------|
| `401` | `"Access token required"` | Không gửi token |
| `403` | `"Invalid token"` | Token hết hạn hoặc sai |

---

### PUT /auth/me

Cập nhật hồ sơ cá nhân của chính mình (chỉ họ tên + số điện thoại — email/role không đổi qua endpoint này).

**Auth:** Bắt buộc (mọi role)

**Request body:**
| Field | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| `full_name` | string | — | 1–30 ký tự |
| `phone` | string \| null | — | Tối đa 15 ký tự; `null` để xoá |
| `localTime` | string | ✔ | ISO datetime từ client |

**Response `200`:** profile mới (cùng shape `GET /auth/me`)

**Lỗi:**
| Status | code | Nguyên nhân |
|--------|------|-------------|
| `400` | `ER001` | Body sai định dạng |
| `400` | `ER004` | Không có field nào để cập nhật |

---

### PUT /auth/me/password

Đổi mật khẩu — phải nhập đúng mật khẩu hiện tại.

**Auth:** Bắt buộc (mọi role)

**Request body:**
| Field | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| `current_password` | string | ✔ | Mật khẩu hiện tại |
| `new_password` | string | ✔ | Tối thiểu 6 ký tự |
| `localTime` | string | ✔ | ISO datetime từ client |

**Response `200`:** `data: null`

**Lỗi:**
| Status | code | Nguyên nhân |
|--------|------|-------------|
| `400` | `ER001` | Body sai định dạng (mật khẩu mới < 6 ký tự...) |
| `400` | `ER205` | Mật khẩu hiện tại không đúng |

---

## Products

### GET /products

Lấy danh sách sản phẩm. Hỗ trợ tìm kiếm và phân trang.

**Auth:** Không yêu cầu

**Query params:**
| Param | Type | Mặc định | Mô tả |
|-------|------|----------|-------|
| `search` | string | — | Tìm theo tên sản phẩm (không phân biệt hoa thường) |
| `page` | number | `1` | Trang hiện tại |
| `limit` | number | `20` | Số item mỗi trang |

**Ví dụ:**
```
GET /products?search=phân&page=1&limit=10
```

**Response `200`:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Phân bón NPK",
      "description": "Phân bón tổng hợp cho cây trồng",
      "price": 150000,
      "stock": 100,
      "imageUrl": "https://example.com/nkp.jpg",
      "categoryId": 2,
      "createdAt": "2026-05-25T10:00:00.000Z",
      "updatedAt": "2026-05-25T10:00:00.000Z",
      "category": {
        "id": 2,
        "name": "Phân bón"
      }
    }
  ],
  "total": 45,
  "page": 1,
  "limit": 10
}
```

---

### GET /products/:id

Lấy chi tiết một sản phẩm.

**Auth:** Không yêu cầu

**Path param:** `id` — ID sản phẩm (số nguyên)

**Response `200`:**
```json
{
  "id": 1,
  "name": "Phân bón NPK",
  "description": "Phân bón tổng hợp cho cây trồng",
  "price": 150000,
  "stock": 100,
  "imageUrl": "https://example.com/nkp.jpg",
  "categoryId": 2,
  "createdAt": "2026-05-25T10:00:00.000Z",
  "updatedAt": "2026-05-25T10:00:00.000Z",
  "category": {
    "id": 2,
    "name": "Phân bón"
  }
}
```

**Lỗi:**
| Status | error | Nguyên nhân |
|--------|-------|-------------|
| `404` | `"Product not found"` | Không tìm thấy sản phẩm |

---

### POST /products

Tạo sản phẩm mới.

**Auth:** Bắt buộc — chỉ `admin`

**Request body:**
```json
{
  "name": "Thuốc trừ sâu BT",
  "price": 85000,
  "categoryId": 3,
  "description": "Thuốc trừ sâu sinh học",
  "stock": 200,
  "imageUrl": "https://example.com/bt.jpg"
}
```

| Field | Type | Bắt buộc | Ghi chú |
|-------|------|----------|---------|
| `name` | string | ✅ | |
| `price` | number | ✅ | Số không âm |
| `categoryId` | number | ✅ | Phải tồn tại trong bảng Category |
| `description` | string | — | |
| `stock` | number | — | Mặc định `0`, số không âm |
| `imageUrl` | string | — | URL ảnh sản phẩm |

**Response `201`:**
```json
{
  "id": 5,
  "name": "Thuốc trừ sâu BT",
  "description": "Thuốc trừ sâu sinh học",
  "price": 85000,
  "stock": 200,
  "imageUrl": "https://example.com/bt.jpg",
  "categoryId": 3,
  "createdAt": "2026-05-25T15:00:00.000Z",
  "updatedAt": "2026-05-25T15:00:00.000Z",
  "category": {
    "id": 3,
    "name": "Thuốc bảo vệ thực vật"
  }
}
```

**Lỗi:**
| Status | error | Nguyên nhân |
|--------|-------|-------------|
| `400` | `"name, price, categoryId are required"` | Thiếu field bắt buộc |
| `400` | `"price must be a non-negative number"` | Price âm hoặc sai kiểu |
| `400` | `"stock must be a non-negative integer"` | Stock âm hoặc sai kiểu |
| `400` | `"categoryId does not exist"` | Category không tồn tại |

---

### PUT /products/:id

Cập nhật thông tin sản phẩm. Chỉ gửi các field cần thay đổi.

**Auth:** Bắt buộc — chỉ `admin`

**Path param:** `id` — ID sản phẩm

**Request body** _(tất cả field đều tùy chọn, gửi ít nhất 1)_:
```json
{
  "price": 90000,
  "stock": 150
}
```

| Field | Type | Ghi chú |
|-------|------|---------|
| `name` | string | |
| `price` | number | Số không âm |
| `categoryId` | number | Phải tồn tại |
| `description` | string | |
| `stock` | number | Số không âm |
| `imageUrl` | string | |

**Response `200`:** Trả về object product đầy đủ (giống `GET /products/:id`)

**Lỗi:**
| Status | error | Nguyên nhân |
|--------|-------|-------------|
| `400` | `"No fields to update"` | Body rỗng |
| `400` | `"price must be a non-negative number"` | Price sai |
| `400` | `"categoryId does not exist"` | Category không tồn tại |
| `404` | `"Product not found"` | Không tìm thấy sản phẩm |

---

### DELETE /products/:id

Xoá sản phẩm.

**Auth:** Bắt buộc — chỉ `admin`

**Path param:** `id` — ID sản phẩm

**Response `200`:**
```json
{ "message": "Product deleted" }
```

**Lỗi:**
| Status | error | Nguyên nhân |
|--------|-------|-------------|
| `404` | `"Product not found"` | Không tìm thấy sản phẩm |

---

## Users _(Admin only)_

> Tất cả endpoint `/users` đều yêu cầu token của **admin**.

### GET /users

Lấy danh sách tất cả users. Hỗ trợ tìm kiếm và phân trang.

**Auth:** `admin`

**Query params:**
| Param | Type | Mặc định | Mô tả |
|-------|------|----------|-------|
| `search` | string | — | Tìm theo tên hoặc email |
| `page` | number | `1` | |
| `limit` | number | `20` | |

**Response `200`:**
```json
{
  "data": [
    {
      "id": 1,
      "email": "user@example.com",
      "name": "Nguyen Van A",
      "role": "customer",
      "createdAt": "2026-05-25T14:24:43.362Z"
    }
  ],
  "total": 12,
  "page": 1,
  "limit": 20
}
```

---

### GET /users/:id

Xem chi tiết một user.

**Auth:** `admin`

**Response `200`:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "Nguyen Van A",
  "role": "customer",
  "createdAt": "2026-05-25T14:24:43.362Z"
}
```

**Lỗi:**
| Status | error | Nguyên nhân |
|--------|-------|-------------|
| `404` | `"User not found"` | |

---

### PUT /users/:id/role

Thay đổi role của một user.

**Auth:** `admin`

**Request body:**
```json
{ "role": "mod" }
```

| Field | Type | Bắt buộc | Giá trị hợp lệ |
|-------|------|----------|----------------|
| `role` | string | ✅ | `"customer"` · `"mod"` · `"admin"` |

**Response `200`:**
```json
{
  "id": 2,
  "email": "user2@example.com",
  "name": "Tran Thi B",
  "role": "mod"
}
```

**Lỗi:**
| Status | error | Nguyên nhân |
|--------|-------|-------------|
| `400` | `"role must be one of: customer, mod, admin"` | Role không hợp lệ |
| `400` | `"Cannot change your own role"` | Admin tự đổi role mình |
| `404` | `"User not found"` | |

---

### DELETE /users/:id

Xoá user.

**Auth:** `admin`

**Response `200`:**
```json
{ "message": "User deleted" }
```

**Lỗi:**
| Status | error | Nguyên nhân |
|--------|-------|-------------|
| `400` | `"Cannot delete your own account"` | Admin tự xoá mình |
| `404` | `"User not found"` | |

---

## Cart _(Token required)_

> Giỏ hàng server-side của **user đã đăng nhập** — mọi endpoint đều cần token (mọi role).
> Guest dùng giỏ localStorage phía client (`store/useCartStore.js`); ngay sau đăng nhập frontend gọi `POST /cart/sync` để merge giỏ guest vào giỏ user.
> Mọi mutation đều trả về **giỏ đầy đủ** (cùng shape với `GET /cart`) để frontend set state một lần.

### GET /cart

Lấy giỏ hàng của user hiện tại (tự tạo giỏ rỗng nếu chưa có).

**Auth:** token (mọi role)

**Response `200`:**
```json
{
  "id": 3,
  "items": [
    {
      "product_id": 12,
      "quantity": 2,
      "product": {
        "id": 12,
        "name": "Thuốc trừ sâu sinh học BT",
        "slug": "thuoc-tru-sau-sinh-hoc-bt",
        "price": 150000,
        "discount_price": 120000,
        "unit": "chai",
        "stock": 25,
        "image_url": "https://res.cloudinary.com/..."
      }
    }
  ]
}
```

---

### POST /cart/items

Thêm sản phẩm vào giỏ. Nếu sản phẩm đã có trong giỏ thì **cộng dồn** số lượng; luôn chặn trần theo `stock`.

**Auth:** token (mọi role)

**Request body:**
| Field | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| `product_id` | number | ✔ | ID sản phẩm |
| `quantity` | number | — | Mặc định `1`, nguyên dương |
| `localTime` | string | ✔ | ISO datetime từ client |

**Response `200`:** giỏ đầy đủ (như `GET /cart`)

**Lỗi:**
| Status | code | Nguyên nhân |
|--------|------|-------------|
| `400` | `ER001` | Body sai định dạng |
| `400` | `ER501` | Sản phẩm hết hàng / ngừng kinh doanh / đã xoá |

---

### PUT /cart/items/:productId

Đặt lại số lượng một sản phẩm trong giỏ (không cộng dồn). Chặn trần theo `stock`.

**Auth:** token (mọi role)

**Request body:**
| Field | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| `quantity` | number | ✔ | Nguyên dương |
| `localTime` | string | ✔ | ISO datetime từ client |

**Response `200`:** giỏ đầy đủ

**Lỗi:**
| Status | code | Nguyên nhân |
|--------|------|-------------|
| `404` | `ER002` | Sản phẩm không tồn tại hoặc không có trong giỏ |

---

### DELETE /cart/items/:productId

Bỏ một sản phẩm khỏi giỏ (idempotent — xoá item không tồn tại vẫn trả 200).

**Auth:** token (mọi role)

**Response `200`:** giỏ đầy đủ

---

### POST /cart/sync

Merge giỏ guest (localStorage) vào giỏ user — gọi **một lần ngay sau đăng nhập**. Cộng dồn số lượng theo từng sản phẩm, chặn trần `stock`. Sản phẩm không hợp lệ/hết hàng bị **bỏ qua** (không làm fail cả batch).

**Auth:** token (mọi role)

**Request body:**
| Field | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| `items` | array | ✔ | Tối đa 100 phần tử `{ product_id, quantity }` |
| `localTime` | string | ✔ | ISO datetime từ client |

```json
{ "items": [ { "product_id": 12, "quantity": 2 }, { "product_id": 5, "quantity": 1 } ] }
```

**Response `200`:** giỏ đầy đủ sau khi merge

---

## Tóm tắt tất cả endpoints

| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| POST | `/auth/register` | — | Đăng ký |
| POST | `/auth/login` | — | Đăng nhập |
| GET | `/auth/me` | token | Xem profile |
| PUT | `/auth/me` | token | Sửa hồ sơ (tên, sđt) |
| PUT | `/auth/me/password` | token | Đổi mật khẩu |
| GET | `/products` | — | Danh sách sản phẩm |
| GET | `/products/:id` | — | Chi tiết sản phẩm |
| POST | `/products` | admin | Tạo sản phẩm |
| PUT | `/products/:id` | admin | Cập nhật sản phẩm |
| DELETE | `/products/:id` | admin | Xoá sản phẩm |
| GET | `/users` | admin | Danh sách users |
| GET | `/users/:id` | admin | Chi tiết user |
| PUT | `/users/:id/role` | admin | Đổi role user |
| DELETE | `/users/:id` | admin | Xoá user |
| GET | `/cart` | token | Giỏ hàng của user |
| POST | `/cart/items` | token | Thêm sản phẩm vào giỏ (cộng dồn) |
| PUT | `/cart/items/:productId` | token | Đặt lại số lượng |
| DELETE | `/cart/items/:productId` | token | Bỏ sản phẩm khỏi giỏ |
| POST | `/cart/sync` | token | Merge giỏ guest sau đăng nhập |
