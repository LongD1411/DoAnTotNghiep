# Hướng dẫn Deploy — Hệ thống Nhà Nông

Kiến trúc: **1 VPS** chạy toàn bộ qua Docker — frontend + backend + MySQL + **ml-service (TensorFlow)** + Caddy (HTTPS). CI/CD: merge `main` → GitHub Actions SSH vào VPS build & up lại container.

```
        Người dùng
            │ HTTPS
            ▼
   ┌─────────────────────── VPS (2–4GB RAM) ────────────────────────┐
   │  Caddy ──/──►  frontend (nginx, React build)                   │
   │        ──/api─► backend (Node) ──► MySQL                        │
   │                      └─ http://ml:7860 ─► ml (FastAPI + TF)     │
   └────────────────────────────────────────────────────────────────┘
```

> TensorFlow cần ~1.5–2GB RAM → dùng VPS **≥2GB** (Oracle Free 24GB, hoặc DO 2GB qua student credit). ML chạy nội bộ, backend gọi `http://ml:7860` — không cần dịch vụ ngoài.

---

## 0. ⚠️ BẢO MẬT — làm NGAY

`backend/.env.docker` đã bị commit lên repo public → **lộ** Cloudinary key, JWT secret, mật khẩu DB.

```bash
# Gỡ khỏi git (vẫn giữ file ở máy)
git rm --cached backend/.env.docker
git commit -m "chore: stop tracking .env.docker (secrets)"
```
Sau đó **đổi (rotate) các khóa đã lộ**:
- Cloudinary: tạo API key mới trong dashboard, xoá key cũ.
- JWT_SECRET: đổi chuỗi mới (user sẽ phải đăng nhập lại — chấp nhận được).
- Mật khẩu DB: đặt mới trong file `.env` production.

> `.gitignore` gốc (mới thêm) đã chặn `.env`, `.env.docker`, `model/`, `node_modules/`… cho tương lai.

---

## A. File model cho ml-service

`ml-service/model/plant_disease.keras` (~35MB) + `labels.json` **bị .gitignore** nên `git clone`
trên VPS sẽ KHÔNG có. Đưa model lên server **1 lần** (file nằm ngoài git nên sống qua các lần deploy):

```bash
# chạy ở MÁY bạn, SAU khi đã clone repo vào /opt/nhanong trên VPS (bước B)
scp ml-service/model/plant_disease.keras ml-service/model/labels.json \
    <user>@<VPS_IP>:/opt/nhanong/ml-service/model/
```
Docker sẽ build file model này vào image `ml`. (Train model mới → scp đè lại rồi deploy.)

---

## B. Chuẩn bị VPS (Ubuntu 22.04)

Lấy 1 VPS **≥2GB RAM** (Oracle Cloud Free 24GB / DigitalOcean 2GB qua GitHub Student Pack / Hetzner). SSH vào rồi:

```bash
# 1) Cài Docker + compose plugin
curl -fsSL https://get.docker.com | sh

# 2) Swap 2GB (giúp build trên máy RAM nhỏ khỏi OOM)
sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile
sudo mkswap /swapfile && sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# 3) Mở tường lửa
sudo ufw allow OpenSSH && sudo ufw allow 80 && sudo ufw allow 443 && sudo ufw --force enable

# 4) Lấy code
sudo mkdir -p /opt/nhanong && sudo chown $USER /opt/nhanong
git clone https://github.com/LongD1411/DoAnTotNghiep.git /opt/nhanong
cd /opt/nhanong

# 5) Đưa file model lên (xem Phần A) — scp từ máy bạn vào ml-service/model/

# 6) Tạo file .env production (điền giá trị thật)
cp .env.production.example .env
nano .env        # DOMAIN, PUBLIC_URL, DB_*, JWT_SECRET, CLOUDINARY_* (ML_SERVICE_URL để trống)
```

**Domain + HTTPS**: trỏ 1 domain về IP VPS (miễn phí: [duckdns.org](https://www.duckdns.org) → tạo `nhanong.duckdns.org` trỏ IP VPS). Đặt `DOMAIN=nhanong.duckdns.org` và `PUBLIC_URL=https://nhanong.duckdns.org` trong `.env` → Caddy tự xin cert.
Chưa có domain: đặt `DOMAIN=:80` (chỉ HTTP, camera trên mobile sẽ không chạy).

**Chạy thử lần đầu (thủ công) để chắc chắn:**
```bash
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml logs -f backend   # xem log
```
Mở `https://<domain>` → trang chủ. `https://<domain>/api/` → backend.

**Nạp dữ liệu cẩm nang (DB mới trống):**
```bash
docker compose -f docker-compose.prod.yml exec backend node prisma/seedForum.js
docker compose -f docker-compose.prod.yml exec backend node prisma/seedDiagnosisRice.js
docker compose -f docker-compose.prod.yml exec backend node prisma/updateRiceModelLabel.js
docker compose -f docker-compose.prod.yml exec backend node prisma/seedDiagnosisCornDurian.js
```
(Sản phẩm, danh mục… tạo qua trang admin hoặc seed riêng của bạn.)

---

## C. GitHub Secrets (cho CI/CD)

Repo → **Settings → Secrets and variables → Actions → New repository secret**:

| Secret | Giá trị |
|--------|---------|
| `VPS_HOST` | IP VPS |
| `VPS_USER` | user SSH (vd `root` hoặc user bạn tạo) |
| `VPS_SSH_KEY` | **private key** SSH (toàn bộ nội dung file) |
| `VPS_PORT` | `22` |
| `DEPLOY_PATH` | `/opt/nhanong` |

Tạo khóa SSH cho CI (trên máy bạn):
```bash
ssh-keygen -t ed25519 -C "github-deploy" -f deploy_key -N ""
# copy nội dung deploy_key.pub vào ~/.ssh/authorized_keys trên VPS
# copy toàn bộ nội dung deploy_key (private) vào secret VPS_SSH_KEY
```

---

## D. CI/CD tự động

File `.github/workflows/deploy.yml` đã cấu hình: **mỗi lần push/merge vào `main`** →
GitHub Actions SSH vào VPS, `git reset --hard origin/main`, rồi
`docker compose up -d --build`. Tự động, không cần làm tay.

Xem tiến trình: repo → tab **Actions**.

**Train model mới**: `scp` đè `plant_disease.keras` + `labels.json` mới vào `ml-service/model/`
trên VPS, rồi `docker compose -f docker-compose.prod.yml up -d --build ml` (hoặc push main để deploy lại).

---

## Tóm tắt luồng làm việc hằng ngày
1. Code trên nhánh phụ → PR → **merge vào `main`** → web tự cập nhật sau ~1–3 phút (Actions build xong).
2. Đổi biến môi trường: sửa `.env` trên VPS rồi `docker compose -f docker-compose.prod.yml up -d`.
3. Model mới: `scp` đè vào `ml-service/model/` trên VPS rồi `docker compose ... up -d --build ml`.

## Lỗi thường gặp
- **Build OOM trên VPS 1GB**: đã có swap 2GB ở phần B bước 2. Nếu vẫn lỗi, nâng VPS 2GB.
- **Caddy không ra HTTPS**: kiểm tra domain đã trỏ đúng IP, cổng 80/443 mở, `DOMAIN` trong `.env` đúng.
- **AI báo "chưa sẵn sàng"**: container `ml` chưa chạy hoặc thiếu file model. Kiểm tra `docker compose -f docker-compose.prod.yml ps` và `ls ml-service/model/` (phải có `plant_disease.keras`).
- **Camera không chạy**: cần HTTPS (domain thật), không dùng được khi `DOMAIN=:80`.
