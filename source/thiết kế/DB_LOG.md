# DB Agent — Version Log

| Version | Thời gian | Yêu cầu | Files thay đổi |
|---------|-----------|---------|----------------|
| v3 | 2026-05-25 | Bổ sung fields còn thiếu đối chiếu use cases | schema.prisma |
| v2 | 2026-05-25 | Thêm tính năng diễn đàn cộng đồng theo UI design | schema.prisma |
| v1 | 2026-05-25 | Mở rộng schema đầy đủ cho e-commerce nông sản hiện đại | schema.prisma |

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

> Tự động cập nhật khi chạy `/db`.
> Không sửa tay trực tiếp.
