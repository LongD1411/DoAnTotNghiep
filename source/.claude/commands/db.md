# Agent: /db — Database Schema Agent

## Vai trò
Sửa đổi Prisma schema (`backend/prisma/schema.prisma`) dựa trên yêu cầu của user. Là agent đầu tiên trong pipeline: **db → api → ui**.

## Khi nào dùng
- Thêm / xóa / sửa model hoặc field
- Thêm relation mới
- Thêm index, constraint, enum
- Bất kỳ thay đổi nào liên quan đến cấu trúc database

---

## INPUT

Đọc **tự động** các file sau (không hỏi user):

| # | File | Mục đích |
|---|------|----------|
| 1 | `backend/prisma/schema.prisma` | Schema hiện tại — nguồn sự thật |
| 2 | `thiết kế/DESIGN_LOG.md` | Xác định version tiếp theo |
| 3 | `thiết kế/DB_LOG.md` | Lịch sử thay đổi schema (nếu tồn tại) |

**User input:** `$ARGUMENTS` — mô tả thay đổi cần thực hiện (vd: "thêm model Post cho diễn đàn", "thêm field phone vào User")

---

## QUY TRÌNH THỰC THI

### Bước 1 — Phân tích yêu cầu
- Đọc `backend/prisma/schema.prisma`
- Hiểu rõ `$ARGUMENTS`: thêm/sửa/xóa gì, model nào, field nào
- Xác định impact: model nào bị ảnh hưởng, relation nào thay đổi

### Bước 2 — Lên kế hoạch thay đổi
Trước khi sửa file, in ra plan:
```
[/db] Kế hoạch thay đổi:
  + Thêm model X với fields: a (String), b (Int)...
  ~ Sửa model Y: thêm field z, thêm relation đến X
  - Xóa field w khỏi model Z (nếu có)
```

### Bước 3 — Sửa schema
- Sửa `backend/prisma/schema.prisma` theo plan
- Giữ nguyên format và style hiện tại (indentation, ordering)
- Thêm comment `// [version] mô tả ngắn` trên mỗi block thay đổi
- Đảm bảo tất cả relation đều có `@relation` tường minh

### Bước 4 — Cập nhật log
Append vào `thiết kế/DB_LOG.md`:
```markdown
## v{N} — YYYY-MM-DD HH:mm

**Yêu cầu:** {$ARGUMENTS}

**Thay đổi:**
- [+] Model/field được thêm
- [~] Model/field được sửa  
- [-] Model/field bị xóa

**Models hiện tại:** {danh sách tất cả model sau khi thay đổi}

**Migration command:**
\`\`\`bash
npx prisma migrate dev --name {tên_migration_gợi_ý}
\`\`\`
```

### Bước 5 — Kích hoạt `/design`
Sau khi sửa schema xong, **tự động chạy logic của `/design`** để sinh `design_v{N}.md` mới phản ánh schema hiện tại.

### Bước 6 — Báo cáo
```
[/db] Hoàn tất
  INPUT    : backend/prisma/schema.prisma
  CHANGES  : +{N} models, +{M} fields, +{K} relations
  OUTPUT   : backend/prisma/schema.prisma (đã cập nhật)
             thiết kế/design_v{N}.md (regenerated)
  LOG      : thiết kế/DB_LOG.md → v{N} added
  NEXT     : Chạy `npx prisma migrate dev --name {tên}` để apply migration
             Nếu cần API mới → /api {resource}
```

---

## CONVENTIONS

- Luôn dùng `Int @id @default(autoincrement())` cho PK
- DateTime fields: `createdAt DateTime @default(now())`, `updatedAt DateTime @updatedAt`
- Nullable dùng `?` suffix (vd: `String?`)
- Soft delete: thêm `deletedAt DateTime?` nếu được yêu cầu
- Enum: nếu field chỉ có vài giá trị cố định, đề xuất dùng `@db.Enum` hoặc comment rõ giá trị
- Index: thêm `@@index([fieldName])` cho tất cả FK field để tối ưu query
- Unique composite: dùng `@@unique([field1, field2])` khi cần

## KHÔNG ĐƯỢC

- Xóa model/field mà không có `$ARGUMENTS` rõ ràng yêu cầu
- Sửa `generator` hoặc `datasource` block
- Chạy `prisma migrate` — chỉ in lệnh để user tự chạy
