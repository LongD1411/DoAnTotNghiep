# Skill: /design — Tạo thiết kế chi tiết từ database

## Mục đích
Tự động sinh tài liệu thiết kế chi tiết cho hệ thống, với **đầu vào duy nhất là Prisma schema** (`backend/prisma/schema.prisma`). Mỗi lần chạy tạo ra một phiên bản mới có đánh số, log đầy đủ.

---

## Quy trình thực thi

### Bước 1 — Đọc đầu vào

Đọc **duy nhất** từ hai nguồn (không hỏi user thêm gì):
1. `backend/prisma/schema.prisma` — source of truth cho database
2. `thiết kế/DESIGN_LOG.md` — để xác định version tiếp theo (nếu chưa có → version 1)

### Bước 2 — Xác định version

- Đọc `thiết kế/DESIGN_LOG.md`
- Tìm dòng `## v{N}` lớn nhất hiện có
- Version mới = N + 1 (nếu chưa có file log → version = 1)
- Ghi lại timestamp: `YYYY-MM-DD HH:mm`

### Bước 3 — Phân tích schema

Từ Prisma schema, trích xuất:
- Danh sách models và fields (tên, kiểu, constraint)
- Quan hệ giữa các models (1-1, 1-N, N-N)
- Enums / default values / unique constraints
- Tính toán số lượng: models, fields, relations

### Bước 4 — Sinh tài liệu thiết kế

Tạo file `thiết kế/design_v{N}.md` với cấu trúc bên dưới.

### Bước 5 — Cập nhật log

Append entry mới vào `thiết kế/DESIGN_LOG.md`.

### Bước 6 — Báo cáo

In ra terminal:
```
[/design] Hoàn tất
  INPUT  : backend/prisma/schema.prisma (N models, M fields, K relations)
  OUTPUT : thiết kế/design_v{N}.md
  LOG    : thiết kế/DESIGN_LOG.md → v{N} added
```

---

## Cấu trúc file output: `thiết kế/design_v{N}.md`

```markdown
# Thiết kế Chi tiết — v{N}

## Metadata
| Trường        | Giá trị                          |
|---------------|----------------------------------|
| Version       | v{N}                             |
| Sinh lúc      | YYYY-MM-DD HH:mm                 |
| Schema source | backend/prisma/schema.prisma     |
| Models        | {số lượng}                       |
| Fields tổng   | {số lượng}                       |
| Relations     | {số lượng}                       |

---

## INPUT

### Source: `backend/prisma/schema.prisma`
> Toàn bộ nội dung schema được đọc tại thời điểm sinh

```prisma
{nội dung schema.prisma nguyên văn}
```

---

## OUTPUT

### 1. Danh sách Models

Cho mỗi model, liệt kê:

#### Model: {TênModel}
| Field      | Type    | Constraint       | Mô tả              |
|------------|---------|------------------|--------------------|
| id         | Int     | PK, autoincrement| ...                |
| ...        | ...     | ...              | ...                |

**Quan hệ:**
- `{field}` → `{Model}` ({kiểu quan hệ: 1-1 / 1-N / N-1})

---

### 2. Sơ đồ quan hệ (ERD dạng text)

Vẽ ERD dạng Mermaid `erDiagram`.

---

### 3. Thiết kế API Endpoints

Dựa trên models, đề xuất endpoints RESTful:

| Method | Endpoint               | Auth       | Mô tả                        |
|--------|------------------------|------------|------------------------------|
| GET    | /products              | public     | Danh sách sản phẩm           |
| ...    | ...                    | ...        | ...                          |

Nhóm theo resource (auth, products, categories, orders, cart, addresses).

---

### 4. Phân tích nghiệp vụ theo Role

| Role     | Quyền hạn                                                  |
|----------|------------------------------------------------------------|
| customer | ...                                                        |
| mod      | ...                                                        |
| admin    | ...                                                        |

---

### 5. Ràng buộc & Business Rules

Liệt kê các ràng buộc quan trọng rút ra từ schema (unique, default, nullable, cascade).

---

### 6. Điểm cần chú ý / TODO

Những điểm schema hiện tại còn thiếu hoặc cần xem xét.
```

---

## Cấu trúc file log: `thiết kế/DESIGN_LOG.md`

```markdown
# Design Version Log

| Version | Thời gian        | Models | Fields | Relations | File output           |
|---------|------------------|--------|--------|-----------|----------------------|
| v1      | YYYY-MM-DD HH:mm | N      | M      | K         | design_v1.md         |
| v2      | ...              | ...    | ...    | ...       | design_v2.md         |

---

## v{N} — YYYY-MM-DD HH:mm

**Thay đổi so với v{N-1}:**
- (So sánh số models/fields nếu có phiên bản trước; nếu là v1 ghi "Khởi tạo lần đầu")

**Input hash (schema fingerprint):**
- Models: {danh sách tên model cách nhau dấu phẩy}
```

---

## Lưu ý quan trọng

- **Không hỏi user** — toàn bộ thông tin lấy từ schema
- **Không sửa schema** — chỉ đọc, không ghi vào `backend/`
- **Luôn tạo file mới** — không overwrite file version cũ
- **Log phải được append** — không xóa lịch sử cũ trong `DESIGN_LOG.md`
- Nếu `$ARGUMENTS` được cung cấp, dùng làm tiêu đề ghi chú trong log (ví dụ: `/design "thêm forum phase 2"`)
