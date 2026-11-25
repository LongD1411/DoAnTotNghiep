# ML Service — Nhận diện bệnh/sâu hại lúa (Nhà Nông)

Service Python (FastAPI) phục vụ mô hình CNN nhận diện **bệnh và sâu hại trên cây lúa**
qua ảnh. Backend Node gọi sang endpoint `POST /predict`.

- **Engine:** transfer learning MobileNetV2.
- **Dataset:** bộ ảnh lúa Việt Nam — **21 lớp**, ~38.000 ảnh, chia sẵn `train/ validation/ test/`.
  Gồm bệnh nấm/vi khuẩn/virus (đạo ôn, bạc lá, đốm vằn, cháy lá, Tungro…), sâu/rầy
  (rầy nâu, sâu cuốn lá, sâu đục thân, bọ trĩ…), thiếu dinh dưỡng (K/N/P) và lúa khỏe.
- **Vai trò:** chỉ lo ML (ảnh → lớp + độ tin cậy). Map sang kho tri thức (PestEntry)
  và hiển thị do backend/frontend đảm nhiệm, qua `PestEntry.modelLabel`.

## 1. Cài đặt

```bash
cd ml-service
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
```

> Khuyến nghị Python 3.10–3.12. TensorFlow chạy được trên CPU (train chậm hơn GPU).

## 2. Dataset

Bộ dữ liệu đặt ở: `C:\Users\pc\Documents\Data\rice_images` với cấu trúc:

```
rice_images/
├── train/        (26.584 ảnh — 21 lớp)
│   ├── Bệnh Bạc lá (Bacterial leaf blight)/
│   ├── Bệnh Đạo ôn lá và cổ bông (Rice leaf and neck blast)/
│   ├── Healthy/
│   └── ...
├── validation/   (5.697 ảnh)
└── test/         (5.697 ảnh)
```

> ⚠️ 2 lớp ít ảnh — *Bệnh Than Vàng (False Smut)* và *Bệnh lúa von (bakanae)* chỉ ~70 ảnh/lớp,
> sẽ nhận diện yếu hơn. Script đã bật data augmentation + `class_weight` để bù phần nào.

## 3. Train model

Trỏ `--data` vào thư mục gốc (script tự dùng `train/` + `validation/`):

```bash
python train.py --data "C:\Users\pc\Documents\Data\rice_images" --epochs 8 --fine-tune-epochs 4 --batch 32
```

Kết quả:

```
model/plant_disease.keras   # mô hình
model/labels.json           # 21 lớp theo đúng thứ tự output + tên tiếng Việt
```

> Máy yếu? Giảm `--epochs`, giảm `--batch` (vd 16).

## 4. Chạy service

```bash
uvicorn app:app --host 0.0.0.0 --port 8000
```

- Tài liệu API: http://localhost:8000/docs · Kiểm tra: http://localhost:8000/health

## 5. API

| Method | Path       | Mô tả |
|--------|------------|-------|
| GET    | `/health`  | Trạng thái + đã nạp model chưa |
| GET    | `/labels`  | Danh sách 21 lớp model nhận diện |
| POST   | `/predict` | Nhận ảnh (`multipart/form-data`, field `file`), trả top-k |

Ví dụ phản hồi `/predict`:

```json
{
  "top": { "label": "Bệnh Đạo ôn lá và cổ bông (Rice leaf and neck blast)", "display": "Bệnh đạo ôn (lá & cổ bông)", "confidence": 0.93 },
  "predictions": [ ... ]
}
```

> Khi chưa train model, `/predict` trả **503** — backend sẽ báo "AI chưa sẵn sàng".

## 6. Liên kết với backend

Backend đọc `ML_SERVICE_URL` (mặc định `http://localhost:8000`). **Backend chạy trong Docker**
thì đặt `ML_SERVICE_URL=http://host.docker.internal:8000` (uvicorn chạy trên máy host).
Map `label` ↔ bệnh qua `PestEntry.modelLabel` (seed: `backend/prisma/seedDiagnosisRice.js`).
