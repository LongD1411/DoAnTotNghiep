# DB Agent — Version Log

| Version | Thời gian | Yêu cầu | Files thay đổi |
|---------|-----------|---------|----------------|
| v4 | 2026-06-15 | Thêm bảng tra cứu dịch hại (encyclopedia) | schema.prisma |
| v3 | 2026-05-25 | Bổ sung fields còn thiếu đối chiếu use cases | schema.prisma |
| v2 | 2026-05-25 | Thêm tính năng diễn đàn cộng đồng theo UI design | schema.prisma |
| v1 | 2026-05-25 | Mở rộng schema đầy đủ cho e-commerce nông sản hiện đại | schema.prisma |

---

## v4 — 2026-06-15

**Yêu cầu:** Thêm bảng tra cứu dịch hại — đối chiếu với EncyclopediaFormPage và encyclopediaData.js

**Thay đổi:**

Model mới:
- [+] **PestEntry** — bản ghi dịch hại/bệnh cây (name, latinName, slug, category, severity, description, conditions, isActive, viewCount)
- [+] **PestImage** — nhiều ảnh/entry (pestId, url, order · onDelete Cascade)
- [+] **PestSymptom** — triệu chứng có thứ tự (pestId, content @db.Text, order · onDelete Cascade)
- [+] **PestTreatment** — biện pháp xử lý có thứ tự (pestId, content @db.Text, order · onDelete Cascade)
- [+] **PestCropType** — loại cây trồng bị hại (pestId, cropType · @@unique[pestId, cropType] · onDelete Cascade)
- [+] **PestProduct** — sản phẩm khuyến nghị many-to-many (@@id[pestId, productId] · onDelete Cascade cả 2 chiều)

Model sửa:
- [~] **Product**: + relation `pestProducts PestProduct[]`

**Tổng models:** User, Category, Product, Order, OrderItem, Address, Cart, CartItem, Review, Voucher, VoucherUsage, Notification, ProductImage, RefreshToken, ForumCategory, Post, PostComment, PostImage, PostReport, InventoryLog, **PestEntry, PestImage, PestSymptom, PestTreatment, PestCropType, PestProduct**

**Migration command:**
```bash
npx prisma migrate dev --name add_encyclopedia
```

---

## v3 — 2026-05-25

**Yêu cầu:** Bổ sung fields còn thiếu sau khi đối chiếu với 51 use cases

**Thay đổi:**

Fields sửa đổi:
- [~] **User**: + `deletedAt DateTime?` (soft delete)
- [~] **Product**: + `origin String?`, `weight Float?`, `expiryDays Int?`
- [~] **Order**: + `deliveredAt DateTime?`, mở rộng status thêm `delivering/delivered/completed`
- [~] **CartItem**: + `@@unique([cartId, productId])` (ngăn duplicate cart items)
- [~] **Review**: + `verifiedPurchase Boolean`
- [~] **Voucher**: + `description String?`, `maxDiscount Float?`
- [~] **Notification**: + `refId Int?`, `refType String?` (link đến entity liên quan)
- [~] **Post**: + `likeCount Int`, `isPinned Boolean`, `isEdited Boolean`
- [~] **PostComment**: + `isDeleted Boolean`, `deletedAt DateTime?` (soft delete)

Model mới:
- [+] **InventoryLog** — lịch sử cập nhật tồn kho (changeAmount, stockBefore, stockAfter, adminId)

**Tổng models:** User, Category, Product, Order, OrderItem, Address, Cart, CartItem, Review, Voucher, VoucherUsage, Notification, ProductImage, RefreshToken, ForumCategory, Post, PostComment, PostImage, PostReport, InventoryLog

**Migration command:**
```bash
docker compose exec backend npx prisma db push
```

---

## v2 — 2026-05-25

**Yêu cầu:** Thêm tính năng diễn đàn cộng đồng theo UI design (moderate_forum.html, edit_post.html, inventory_forum.html)

**Thay đổi:**

Model mới:
- [+] **ForumCategory** — chuyên mục diễn đàn (Sâu bệnh & Dịch hại, Mẹo canh tác, ...)
- [+] **Post** — bài viết diễn đàn (title, slug, content @db.Text, status: published/pending/hidden, viewCount, categoryId, userId)
- [+] **PostComment** — bình luận có nested reply (parentId self-relation "CommentTree", onDelete: Cascade)
- [+] **PostImage** — nhiều ảnh/bài viết (onDelete: Cascade)
- [+] **PostReport** — báo cáo vi phạm (reason, status: pending/resolved/dismissed)

Model sửa:
- [~] **User**: + relations `posts`, `postComments`, `postReports`

**Tổng models:** User, Category, Product, Order, OrderItem, Address, Cart, CartItem, Review, Voucher, VoucherUsage, Notification, ProductImage, RefreshToken, ForumCategory, Post, PostComment, PostImage, PostReport

**Migration command:**
```bash
docker compose exec backend npx prisma db push
```

---

## v1 — 2026-05-25

**Yêu cầu:** Thêm tất cả fields và models đề xuất cho web thương mại điện tử nông sản hiện đại

**Thay đổi:**

Model hiện có:
- [~] **User**: + `phone`, `avatar`, `isActive`
- [~] **Category**: + `slug`, `imageUrl`, `description`, `parentId` (self-relation cha/con)
- [~] **Product**: + `slug`, `unit`, `isActive`, `sold`, `discountPrice`
- [~] **Order**: + `note`, `paymentMethod`, `paymentStatus`, `shippingFee`, `discount`, `cancelReason`
- [~] **Address**: + `fullName`, `phone`, `district`, `ward`
- [~] Thêm `@@index` cho tất cả FK fields

Model mới:
- [+] **Review** — đánh giá sản phẩm (rating 1-5, @@unique[productId, userId])
- [+] **Voucher** — mã giảm giá (percent/fixed, minOrderValue, maxUses, expiresAt)
- [+] **VoucherUsage** — theo dõi ai dùng voucher nào (@@unique[voucherId, userId])
- [+] **Notification** — thông báo in-app
- [+] **ProductImage** — nhiều ảnh/sản phẩm

**Tổng models:** User, Category, Product, Order, OrderItem, Address, Cart, CartItem, Review, Voucher, VoucherUsage, Notification, ProductImage, RefreshToken

**Migration command:**
```bash
docker compose exec backend npx prisma db push
```

---

## v5 — 2026-06-29

**Yêu cầu:** dọn nốt đi (gỡ ảnh khỏi danh mục — dọn phần còn sót ở schema)

**Thay đổi:**
- [-] **Category**: xóa field `imageUrl String?`

**Models hiện tại:** User, Category, Product, Order, OrderItem, Address, Cart, CartItem, Review, Voucher, VoucherUsage, Notification, ProductImage, ForumCategory, Post, PostComment, PostImage, PostReport, InventoryLog, PestEntry, PestImage, PestSymptom, PestTreatment, PestCropType, PestProduct, RefreshToken

**Migration command:**
```bash
npx prisma migrate dev --name remove_category_image
```

---

## v6 — 2026-06-29

**Yêu cầu:** dọn nốt description khỏi category (sau khi gỡ ở UI v26)

**Thay đổi:**
- [-] **Category**: xóa field `description String?`

**Models hiện tại:** User, Category, Product, Order, OrderItem, Address, Cart, CartItem, Review, Voucher, VoucherUsage, Notification, ProductImage, ForumCategory, Post, PostComment, PostImage, PostReport, InventoryLog, PestEntry, PestImage, PestSymptom, PestTreatment, PestCropType, PestProduct, RefreshToken

**Migration command:**
```bash
npx prisma migrate dev --name remove_category_description
```

---

## v7 — 2026-06-29

**Yêu cầu:** thêm trường mô tả sản phẩm cho khớp frontend customer (form tạo sản phẩm)

**Thay đổi:**
- [+] **Product**: + `ingredient String?` (hoạt chất), + `safetyNote String? @db.Text` (lưu ý an toàn), + `badge String? @db.VarChar(50)` (nhãn nổi bật)

**Models hiện tại:** User, Category, Product, Order, OrderItem, Address, Cart, CartItem, Review, Voucher, VoucherUsage, Notification, ProductImage, ForumCategory, Post, PostComment, PostImage, PostReport, InventoryLog, PestEntry, PestImage, PestSymptom, PestTreatment, PestCropType, PestProduct, RefreshToken

**Migration command:**
```bash
npx prisma migrate dev --name add_product_ingredient_safety_badge
```

---

## v8 — 2026-06-29

**Yêu cầu:** 3 mục nội dung sản phẩm soạn rich-text (Mô tả / Thông số kỹ thuật / An toàn sử dụng)

**Thay đổi:**
- [+] **Product**: + `specifications String? @db.Text` (thông số kỹ thuật, HTML)
- [~] **Product**: `description` → `@db.Text` (chứa HTML rich-text, tránh giới hạn VARCHAR 191)

**Models hiện tại:** User, Category, Product, Order, OrderItem, Address, Cart, CartItem, Review, Voucher, VoucherUsage, Notification, ProductImage, ForumCategory, Post, PostComment, PostImage, PostReport, InventoryLog, PestEntry, PestImage, PestSymptom, PestTreatment, PestCropType, PestProduct, RefreshToken

**Migration command:**
```bash
npx prisma migrate dev --name product_specifications_richtext
```

---

## v9 — 2026-06-29

**Yêu cầu:** sản phẩm nguy hiểm hiển thị hộp cảnh báo màu đỏ (mức độ nguy hiểm)

**Thay đổi:**
- [+] **Product**: + `hazardLevel String @default("NONE")` — NONE | TRUNG_BINH | NANG | NGUY_HIEM (đồng bộ severity của PestEntry); client ánh xạ mức → màu hộp an toàn (vàng/cam/đỏ), NONE = ẩn hộp

**Models hiện tại:** User, Category, Product, Order, OrderItem, Address, Cart, CartItem, Review, Voucher, VoucherUsage, Notification, ProductImage, ForumCategory, Post, PostComment, PostImage, PostReport, InventoryLog, PestEntry, PestImage, PestSymptom, PestTreatment, PestCropType, PestProduct, RefreshToken

**Migration command:**
```bash
npx prisma migrate dev --name product_hazard_level
```

---

## v10 — 2026-06-29

**Yêu cầu:** chỉnh trường sản phẩm (bỏ hoạt chất/xuất xứ/hạn dùng; thêm lưu ý nguy hiểm, link video, đơn vị trọng lượng)

**Thay đổi:**
- [-] **Product**: xóa `origin`, `expiryDays`, `ingredient`
- [+] **Product**: + `weightUnit String? @default("kg")` (kg|lít|ml), + `hazardNote String? @db.Text` (lưu ý cho mức nguy hiểm), + `videoUrl String?` (link nhúng video)
- [~] **Product**: `unit` default `kg` → `bao` (đơn vị tính/bán; kg/lít/ml chuyển sang weightUnit)

**Models hiện tại:** User, Category, Product, Order, OrderItem, Address, Cart, CartItem, Review, Voucher, VoucherUsage, Notification, ProductImage, ForumCategory, Post, PostComment, PostImage, PostReport, InventoryLog, PestEntry, PestImage, PestSymptom, PestTreatment, PestCropType, PestProduct, RefreshToken

**Migration command:**
```bash
npx prisma migrate dev --name product_fields_revamp
```

---

> Tự động cập nhật khi chạy `/db`.
> Không sửa tay trực tiếp.
