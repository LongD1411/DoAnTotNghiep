# ML service (FastAPI + TensorFlow) — dùng cho Hugging Face Spaces (SDK: docker)
# HF Spaces mặc định gọi app ở cổng 7860.
FROM python:3.11-slim

# libgomp1 cần cho TensorFlow
RUN apt-get update && apt-get install -y --no-install-recommends libgomp1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV PORT=7860
EXPOSE 7860

# model/ (plant_disease.keras + labels.json) phải có trong repo Space
CMD ["sh", "-c", "uvicorn app:app --host 0.0.0.0 --port ${PORT:-7860}"]
