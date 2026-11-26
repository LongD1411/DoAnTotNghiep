# TODO — Tính năng đã đặc tả nhưng CHƯA code

> Đối chiếu giữa `thiết kế/DacTa_UseCase.docx` (bản đặc tả) và code thực tế (backend/src).
> File đặc tả giữ nguyên làm **mục tiêu**; danh sách dưới là phần cần hiện thực hóa để khớp.
> Cập nhật: 26/11/2026.

---

## 1. Đăng nhập Google / Facebook (OAuth) — UC1
- **Hiện trạng:** `User` đã có cột `googleId`, `facebookId` nhưng `authController.js` chỉ đăng nhập email + mật khẩu.
- **Cần làm:**
  - [ ] Endpoint `POST /auth/google`, `POST /auth/facebook`: verify token từ provider → tìm/tạo user theo `googleId`/`facebookId` → cấp JWT.
  - [ ] Frontend: nút đăng nhập Google/FB.

## 2. Quên mật khẩu / Đặt lại mật khẩu — UC1
- **Hiện trạng:** Chưa có endpoint.
- **Cần làm:**
  - [ ] `POST /auth/forgot-password` (sinh token reset, gửi email).
  - [ ] `POST /auth/reset-password` (xác thực token → đặt mật khẩu mới).
  - [ ] Cơ chế lưu token reset (bảng riêng hoặc JWT ngắn hạn) + dịch vụ gửi email.

## 3. Voucher / Mã giảm giá — UC4
- **Hiện trạng:** Schema đã có `Voucher`, `VoucherUsage`; nhưng `orderController.create` để `discount: 0` cứng, không có route.
- **Cần làm:**
  - [ ] Route `/vouchers`: CRUD (admin) + API kiểm tra mã hợp lệ.
  - [ ] Khi tạo đơn: kiểm tra điều kiện/hạn dùng/lượt dùng → trừ `discount`, ghi `VoucherUsage`.
  - [ ] Frontend checkout: ô nhập mã giảm giá.

## 4. Sửa / Xóa đánh giá — UC5
- **Hiện trạng:** `reviewController.js` chỉ có `getAll` + `create`.
- **Cần làm:**
  - [ ] `PUT /reviews/:id`, `DELETE /reviews/:id` (chủ review) + tính lại điểm trung bình.

## 5. Ảnh kèm đánh giá — UC5
- **Hiện trạng:** `create` review không nhận ảnh.
- **Cần làm:**
  - [ ] Thêm bảng `ReviewImage` (hoặc field ảnh) + nhận upload ảnh khi tạo review.

## 6. Sổ địa chỉ giao hàng (thêm/sửa/xóa) — UC8
- **Hiện trạng:** `Address` chỉ được tạo mới **lúc đặt hàng**; không có route quản lý.
- **Cần làm:**
  - [ ] Route `/addresses`: list / thêm / sửa / xóa / đặt mặc định cho user.
  - [ ] Checkout: cho chọn địa chỉ từ sổ thay vì nhập lại.

## 7. Khóa / Mở khóa tài khoản (isActive) — UC11
- **Hiện trạng:** `User` có cột `isActive` nhưng `usersController.js` chỉ có `updateRole` (phân quyền) + `remove` (xóa). Chưa toggle `isActive`.
- **Cần làm:**
  - [ ] Endpoint khóa/mở khóa (vd `PUT /users/:id/status`) cập nhật `isActive`.
  - [ ] Middleware đăng nhập: chặn tài khoản `isActive = false`.

## 8. Thống kê nâng cao + Xuất báo cáo — UC13
- **Hiện trạng:** `OverviewPage.jsx` tính **client-side** từ `getMyOrders`/`getAllUsers`/`getPosts`: doanh thu theo tháng, số đơn, số thành viên. Chưa có stats API, chưa có "sản phẩm bán chạy", chưa có xuất file.
- **Cần làm:**
  - [ ] (Tùy chọn) Endpoint `/stats` tổng hợp server-side cho chính xác & nhẹ client.
  - [ ] Thống kê **sản phẩm bán chạy** (tận dụng `Product.sold`).
  - [ ] Nút **xuất báo cáo Excel/PDF**.

---

## Ghi chú lệch nhỏ (chỉ chỉnh chữ, không phải thiếu tính năng)
- UC4: đơn mới tạo ở trạng thái `pending` ("Chờ xử lý"), không phải "Chờ xác nhận". Phí ship 30.000đ, miễn phí khi tổng ≥ 500.000đ (server tự tính).
- UC5: đánh giá gắn theo **order-item** của đơn `delivered`/`completed` (verifiedPurchase = true), mỗi lần mua đánh giá 1 lần.
- UC7 (Chẩn đoán AI): dùng `optionalAuth` — khách chưa đăng nhập vẫn chẩn đoán được; có lưu lịch sử nếu đã đăng nhập.
