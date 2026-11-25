"""
ML service: serve mô hình nhận diện bệnh cây qua HTTP (FastAPI).

Endpoints:
    GET  /health          -> trạng thái service + model đã nạp chưa
    GET  /labels          -> danh sách lớp model nhận diện (kèm tên tiếng Việt)
    POST /predict         -> nhận ảnh (multipart 'file'), trả top-k dự đoán

Backend Node gọi POST /predict (server-to-server). Chạy:
    uvicorn app:app --host 0.0.0.0 --port 8000
"""

import io
import json
import os
import sys

# Console Windows mặc định cp1252 không in được tiếng Việt -> ép UTF-8 để print/log không crash
try:
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass

import numpy as np
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image

IMG_SIZE = 224
MODEL_PATH = os.path.join("model", "plant_disease.keras")
LABELS_PATH = os.path.join("model", "labels.json")

app = FastAPI(title="Nhà Nông - ML Service", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Nạp 1 lần lúc khởi động. Để biến toàn cục để tránh nạp lại mỗi request.
_model = None
_labels = []  # [{index, label, display}]


def _load():
    """Nạp model + labels nếu đã train. Thiếu file thì để None (service vẫn chạy)."""
    global _model, _labels
    if os.path.exists(LABELS_PATH):
        with open(LABELS_PATH, encoding="utf-8") as f:
            _labels = json.load(f)
    if os.path.exists(MODEL_PATH):
        import tensorflow as tf  # import trễ: /health vẫn phản hồi khi chưa có TF model
        _model = tf.keras.models.load_model(MODEL_PATH)
        print(f">> Đã nạp model: {MODEL_PATH} ({len(_labels)} lớp)")
    else:
        print(f">> CHƯA có model tại {MODEL_PATH}. Hãy chạy train.py trước. "
              f"/predict sẽ trả 503 cho tới khi có model.")


@app.on_event("startup")
def startup():
    _load()


@app.get("/health")
def health():
    return {
        "status": "ok",
        "model_loaded": _model is not None,
        "num_classes": len(_labels),
    }


@app.get("/labels")
def labels():
    return {"labels": _labels}


def _preprocess(raw: bytes) -> np.ndarray:
    """bytes ảnh -> tensor (1, 224, 224, 3) đã chuẩn hóa cho MobileNetV2."""
    try:
        from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
        img = Image.open(io.BytesIO(raw)).convert("RGB").resize((IMG_SIZE, IMG_SIZE))
    except Exception:
        raise HTTPException(status_code=400, detail="Ảnh không hợp lệ")
    arr = np.asarray(img, dtype=np.float32)
    arr = preprocess_input(arr)
    return np.expand_dims(arr, axis=0)


@app.post("/predict")
async def predict(file: UploadFile = File(...), top_k: int = 5):
    if _model is None:
        raise HTTPException(status_code=503,
                            detail="Model chưa sẵn sàng. Hãy chạy train.py để tạo model.")

    raw = await file.read()
    if not raw:
        raise HTTPException(status_code=400, detail="File rỗng")

    x = _preprocess(raw)
    probs = _model.predict(x, verbose=0)[0]  # vector xác suất theo lớp

    k = max(1, min(top_k, len(_labels)))
    top_idx = np.argsort(probs)[::-1][:k]
    predictions = [
        {
            "label": _labels[i]["label"],
            "display": _labels[i]["display"],
            "confidence": round(float(probs[i]), 4),
        }
        for i in top_idx
    ]
    return {
        "top": predictions[0],
        "predictions": predictions,
    }
