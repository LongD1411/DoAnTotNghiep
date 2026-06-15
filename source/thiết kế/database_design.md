# Thiết kế Database cho Hệ thống Bán hàng Nhà nông (Phase 1)

## Tổng quan
Dựa trên nghiệp vụ Phase 1 từ file Tổng quan.txt, thiết kế database sử dụng MySQL với Prisma ORM. Tập trung vào:
- Khách hàng: Xem/tìm kiếm sản phẩm, thêm vào giỏ hàng (client-side), đặt hàng.
- Mod: Duyệt/hủy đơn hàng.
- Admin: Chỉnh sửa sản phẩm và danh mục.
- Đăng nhập: JWT + OAuth (Google/Facebook) với phân quyền theo role.

## Sơ đồ ER (Entity-Relationship) - Cập nhật
```mermaid
erDiagram
    User ||--o{ Order : places
    User ||--o{ Address : has
    User ||--|| Cart : owns
    User {
        int id PK
        string email UK
        string password
        string name
        string role "customer/mod/admin"
        string googleId UK
        string facebookId UK
        datetime createdAt
        datetime updatedAt
    }
    Category ||--o{ Product : contains
    Category {
        int id PK
        string name UK
    }
    Product ||--o{ OrderItem : in_orders
    Product ||--o{ CartItem : in_cart
    Product {
        int id PK
        string name
        string description
        float price
        int stock
        string imageUrl
        int categoryId FK
        datetime createdAt
        datetime updatedAt
    }
    Order ||--o{ OrderItem : has
    Order ||--|| Address : ships_to
    Order {
        int id PK
        int userId FK
        int addressId FK
        string status "pending/approved/cancelled"
        float total
        datetime createdAt
        datetime updatedAt
    }
    OrderItem {
        int id PK
        int orderId FK
        int productId FK
        int quantity
        float price
    }
    Address {
        int id PK
        int userId FK
        string street
        string city
        string zip
        boolean isDefault
    }
    Cart ||--o{ CartItem : contains
    Cart {
        int id PK
        int userId FK UK
        datetime createdAt
        datetime updatedAt
    }
    CartItem {
        int id PK
        int cartId FK
        int productId FK
        int quantity
    }
```

## Giải thích chi tiết các bảng và quan hệ
1. **User** (Người dùng):
   - Lưu thông tin đăng nhập: email, password (hash), name.
   - Role: "customer" (đặt hàng), "mod" (duyệt order), "admin" (quản lý).
   - OAuth: googleId, facebookId (cho đăng nhập xã hội).
   - Quan hệ: 1 User có nhiều Order, Address; 1 User có 1 Cart.

2. **Category** (Danh mục):
   - Phân loại sản phẩm (ví dụ: Phân bón, Thuốc trừ sâu).
   - Quan hệ: 1 Category chứa nhiều Product.

3. **Product** (Sản phẩm):
   - Thông tin: name, description, price, stock, imageUrl.
   - Liên kết với Category.
   - Quan hệ: 1 Product trong nhiều OrderItem và CartItem.

4. **Order** (Đơn hàng):
   - Lưu đơn: userId, addressId, status ("pending" -> "approved"/"cancelled" bởi mod), total.
   - Quan hệ: 1 Order thuộc 1 User, 1 Address; chứa nhiều OrderItem.

5. **OrderItem** (Chi tiết đơn hàng):
   - Lưu sản phẩm trong đơn: orderId, productId, quantity, price.
   - Quan hệ: Liên kết Order và Product.

6. **Address** (Địa chỉ):
   - Lưu địa chỉ giao hàng: street, city, zip, isDefault.
   - Quan hệ: 1 User có nhiều Address; 1 Address dùng cho nhiều Order.

7. **Cart** (Giỏ hàng):
   - Lưu giỏ persist: userId (unique).
   - Quan hệ: 1 User có 1 Cart; chứa nhiều CartItem.

8. **CartItem** (Chi tiết giỏ hàng):
   - Lưu sản phẩm trong giỏ: cartId, productId, quantity.
   - Quan hệ: Liên kết Cart và Product.

## Lưu ý thiết kế
- **Giỏ hàng**: Bây giờ persist với Cart/CartItem, hỗ trợ thêm/xóa sản phẩm và chuyển sang Order khi đặt hàng.
- **Địa chỉ**: Address cho giao hàng, với isDefault để chọn mặc định.
- **Hình ảnh**: imageUrl trong Product để hiển thị.
- **Tìm kiếm**: Thêm index trên Product.name và Product.description nếu cần.
- **Bảo mật**: Password hash với bcrypt, JWT cho auth, role-based access.
- **Mở rộng**: Cho Phase 2 (forum), thêm Post/Comment. Phase 3 (AI), thêm Disease/Solution.
- **Constraints**: Unique trên email, googleId, facebookId, userId trong Cart. FK đảm bảo integrity.

## Schema Prisma
Đã implement trong `backend/prisma/schema.prisma`.