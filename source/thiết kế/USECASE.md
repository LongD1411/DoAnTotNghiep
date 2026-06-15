# Use Cases — Hệ thống Nhà nông

> Tổng hợp từ phân tích nghiệp vụ. 3 actor · 51 use case · 10 nhóm tính năng.

---

## Actor

| Actor | Mô tả | Kế thừa |
|-------|-------|---------|
| **Guest** | Chưa đăng nhập | — |
| **Customer** | Đã đăng nhập, role `customer` | Guest |
| **Mod** | Kiểm duyệt, role `mod` | Customer |
| **Admin** | Quản trị toàn hệ thống, role `admin` | Mod |

---

## GUEST

| ID | Use case | API gợi ý |
|----|----------|-----------|
| G1 | Xem danh sách sản phẩm (lọc danh mục, tìm kiếm, phân trang) | `GET /products` |
| G2 | Xem chi tiết sản phẩm (ảnh, giá, đánh giá, tồn kho) | `GET /products/:id` |
| G3 | Xem danh sách bài viết diễn đàn | `GET /posts` |
| G4 | Xem chi tiết bài viết + bình luận | `GET /posts/:id` |
| G5 | Đăng ký tài khoản (email/password) | `POST /auth/register` |
| G6 | Đăng nhập (email/password, Google, Facebook) | `POST /auth/login` |

---

## CUSTOMER

### Tài khoản

| ID | Use case | API gợi ý |
|----|----------|-----------|
| C1 | Xem thông tin cá nhân | `GET /auth/me` |
| C2 | Cập nhật avatar, tên, số điện thoại | `PUT /users/me` |
| C3 | Đổi mật khẩu | `PUT /users/me/password` |
| C4 | Đăng xuất / thu hồi refresh token | `POST /auth/logout` |

### Địa chỉ

| ID | Use case | API gợi ý |
|----|----------|-----------|
| C5 | Thêm địa chỉ giao hàng | `POST /addresses` |
| C6 | Sửa / xóa địa chỉ | `PUT /addresses/:id` · `DELETE /addresses/:id` |
| C7 | Đặt địa chỉ mặc định | `PUT /addresses/:id/default` |

### Giỏ hàng

| ID | Use case | API gợi ý |
|----|----------|-----------|
| C8 | Thêm sản phẩm vào giỏ | `POST /cart/items` |
| C9 | Cập nhật số lượng sản phẩm trong giỏ | `PUT /cart/items/:productId` |
| C10 | Xóa sản phẩm khỏi giỏ | `DELETE /cart/items/:productId` |
| C11 | Xem giỏ hàng hiện tại | `GET /cart` |

### Đơn hàng

| ID | Use case | API gợi ý |
|----|----------|-----------|
| C12 | Đặt hàng (chọn địa chỉ, phương thức thanh toán, áp voucher) | `POST /orders` |
| C13 | Xem danh sách đơn hàng của mình | `GET /orders/me` |
| C14 | Xem chi tiết đơn hàng | `GET /orders/:id` |
| C15 | Hủy đơn hàng (khi còn `pending`) | `PUT /orders/:id/cancel` |

### Voucher

| ID | Use case | API gợi ý |
|----|----------|-----------|
| C16 | Kiểm tra / áp mã giảm giá | `POST /vouchers/validate` |

### Đánh giá sản phẩm

| ID | Use case | API gợi ý |
|----|----------|-----------|
| C17 | Viết đánh giá sản phẩm đã mua (rating 1-5, comment) | `POST /reviews` |
| C18 | Sửa đánh giá của mình | `PUT /reviews/:id` |

### Diễn đàn

| ID | Use case | API gợi ý |
|----|----------|-----------|
| C19 | Tạo bài viết (title, chuyên mục, nội dung, ảnh) | `POST /posts` |
| C20 | Sửa / xóa bài viết của mình | `PUT /posts/:id` · `DELETE /posts/:id` |
| C21 | Bình luận bài viết | `POST /posts/:id/comments` |
| C22 | Reply bình luận (nested comment) | `POST /posts/:id/comments` (parentId) |
| C23 | Sửa / xóa bình luận của mình | `PUT /comments/:id` · `DELETE /comments/:id` |
| C24 | Báo cáo bài viết vi phạm | `POST /posts/:id/reports` |

### Thông báo

| ID | Use case | API gợi ý |
|----|----------|-----------|
| C25 | Xem danh sách thông báo | `GET /notifications` |
| C26 | Đánh dấu đã đọc | `PUT /notifications/:id/read` · `PUT /notifications/read-all` |

---

## MOD

> Kế thừa toàn bộ quyền Customer.

### Quản lý đơn hàng

| ID | Use case | API gợi ý |
|----|----------|-----------|
| M1 | Xem danh sách đơn hàng toàn hệ thống | `GET /orders` |
| M2 | Duyệt đơn hàng (`pending` → `approved`) | `PUT /orders/:id/approve` |
| M3 | Cập nhật trạng thái giao hàng (`delivering` → `delivered`) | `PUT /orders/:id/status` |
| M4 | Hủy đơn hàng (nhập lý do `cancelReason`) | `PUT /orders/:id/cancel` |

### Kiểm duyệt diễn đàn

| ID | Use case | API gợi ý |
|----|----------|-----------|
| M5 | Xem danh sách bài viết chờ duyệt | `GET /posts?status=pending` |
| M6 | Duyệt bài viết (`pending` → `published`) | `PUT /posts/:id/approve` |
| M7 | Ẩn bài viết vi phạm (`published` → `hidden`) | `PUT /posts/:id/hide` |
| M8 | Xóa bình luận vi phạm (soft delete) | `DELETE /comments/:id` |
| M9 | Xử lý báo cáo vi phạm (`resolved` / `dismissed`) | `PUT /posts/:postId/reports/:id` |
| M10 | Sửa nội dung bài viết | `PUT /posts/:id` |

---

## ADMIN

> Kế thừa toàn bộ quyền Mod.

### Sản phẩm & Danh mục

| ID | Use case | API gợi ý |
|----|----------|-----------|
| A1 | CRUD danh mục sản phẩm (hỗ trợ cha/con) | `GET/POST/PUT/DELETE /categories` |
| A2 | CRUD sản phẩm (ảnh, giá, tồn kho, active/inactive) | `GET/POST/PUT/DELETE /products` |
| A3 | Cập nhật tồn kho + ghi InventoryLog | `PUT /products/:id/stock` |

### Người dùng

| ID | Use case | API gợi ý |
|----|----------|-----------|
| A4 | Xem danh sách người dùng | `GET /users` |
| A5 | Đổi role user (`customer` / `mod` / `admin`) | `PUT /users/:id/role` |
| A6 | Kích hoạt / vô hiệu hóa tài khoản (`isActive`) | `PUT /users/:id/status` |
| A7 | Xóa tài khoản (soft delete `deletedAt`) | `DELETE /users/:id` |

### Voucher

| ID | Use case | API gợi ý |
|----|----------|-----------|
| A8 | Tạo mã giảm giá | `POST /vouchers` |
| A9 | Bật / tắt mã giảm giá (`isActive`) | `PUT /vouchers/:id` |
| A10 | Xem danh sách + lịch sử sử dụng voucher | `GET /vouchers` · `GET /vouchers/:id/usages` |

### Diễn đàn

| ID | Use case | API gợi ý |
|----|----------|-----------|
| A11 | CRUD chuyên mục diễn đàn (ForumCategory) | `GET/POST/PUT/DELETE /forum-categories` |
| A12 | Ghim / bỏ ghim bài viết (`isPinned`) | `PUT /posts/:id/pin` |

### Dashboard / Thống kê

| ID | Use case | Dữ liệu từ |
|----|----------|------------|
| A13 | Doanh thu theo ngày / tháng | Aggregate `Order.total` theo `createdAt` |
| A14 | Sản phẩm bán chạy | `Product.sold` hoặc sum `OrderItem.quantity` |
| A15 | Tổng đơn hàng theo trạng thái | Group by `Order.status` |
| A16 | Thành viên mới theo tháng | Group by `User.createdAt` |

---

## Luồng trạng thái chính

### Order status
```
pending → approved → delivering → delivered → completed
        ↘                                   ↗
          ──────────── cancelled ───────────
```

### Post status
```
pending → published
        ↘
          hidden
```

### PostReport status
```
pending → resolved
        ↘
          dismissed
```

---

## Mapping Use case ↔ Schema

| Use case | Models liên quan |
|----------|-----------------|
| G1, G2 | Product, Category, ProductImage, Review |
| G3, G4 | Post, PostComment, ForumCategory, PostImage |
| C8–C11 | Cart, CartItem, Product |
| C12 | Order, OrderItem, Address, Voucher, VoucherUsage |
| C17–C18 | Review (verifiedPurchase) |
| C19–C24 | Post, PostComment, PostImage, PostReport |
| C25–C26 | Notification (refId, refType) |
| A3 | InventoryLog |
| A13–A16 | Order, Product, User (aggregation) |
