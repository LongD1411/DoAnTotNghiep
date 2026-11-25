"""
Huấn luyện mô hình nhận diện BỆNH/SÂU HẠI LÚA bằng transfer learning (MobileNetV2).

Dataset mong đợi (đã chia sẵn train/validation/test, mỗi lớp 1 thư mục con):

    <data>/
    ├── train/
    │   ├── Bệnh Bạc lá (Bacterial leaf blight)/ ...
    │   └── ...
    ├── validation/
    └── test/            (tùy chọn, dùng để đánh giá cuối)

Cách chạy (trỏ --data vào thư mục gốc rice_images):
    python train.py --data "C:\\Users\\pc\\Documents\\Data\\rice_images" --epochs 8

Nếu --data KHÔNG có thư mục con train/validation, script tự chia validation theo tỉ lệ.

Kết quả:
    model/plant_disease.keras   (mô hình)
    model/labels.json           (thứ tự lớp + tên tiếng Việt)
"""

import argparse
import json
import os
import sys

# Console Windows mặc định cp1252 không in được tiếng Việt -> ép UTF-8 để print không crash
try:
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass

import numpy as np
import tensorflow as tf
from tensorflow.keras import layers, models
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input

from labels import display_name

IMG_SIZE = 224
AUTOTUNE = tf.data.AUTOTUNE
MODEL_DIR = "model"
MODEL_PATH = os.path.join(MODEL_DIR, "plant_disease.keras")
LABELS_PATH = os.path.join(MODEL_DIR, "labels.json")

augment = tf.keras.Sequential([
    layers.RandomFlip("horizontal"),
    layers.RandomRotation(0.1),
    layers.RandomZoom(0.1),
])


def _prep(ds, training):
    if training:
        ds = ds.map(lambda x, y: (augment(x, training=True), y), num_parallel_calls=AUTOTUNE)
    ds = ds.map(lambda x, y: (preprocess_input(x), y), num_parallel_calls=AUTOTUNE)
    return ds.prefetch(AUTOTUNE)


def build_datasets(data_dir, batch_size, val_split):
    """Ưu tiên dùng thư mục train/ + validation/ có sẵn; nếu không có thì tự chia."""
    train_sub = os.path.join(data_dir, "train")
    val_sub   = os.path.join(data_dir, "validation")

    if os.path.isdir(train_sub) and os.path.isdir(val_sub):
        print(f">> Dùng split có sẵn: {train_sub} | {val_sub}")
        train_raw = tf.keras.utils.image_dataset_from_directory(
            train_sub, image_size=(IMG_SIZE, IMG_SIZE), batch_size=batch_size, label_mode="int")
        val_raw = tf.keras.utils.image_dataset_from_directory(
            val_sub, image_size=(IMG_SIZE, IMG_SIZE), batch_size=batch_size, label_mode="int")
        class_names = train_raw.class_names
        train_dir_for_weights = train_sub
    else:
        print(f">> Không thấy train/ + validation/ — tự chia {val_split:.0%} từ {data_dir}")
        train_raw = tf.keras.utils.image_dataset_from_directory(
            data_dir, validation_split=val_split, subset="training", seed=42,
            image_size=(IMG_SIZE, IMG_SIZE), batch_size=batch_size, label_mode="int")
        val_raw = tf.keras.utils.image_dataset_from_directory(
            data_dir, validation_split=val_split, subset="validation", seed=42,
            image_size=(IMG_SIZE, IMG_SIZE), batch_size=batch_size, label_mode="int")
        class_names = train_raw.class_names
        train_dir_for_weights = data_dir

    return _prep(train_raw, True), _prep(val_raw, False), class_names, train_dir_for_weights


def compute_class_weights(train_dir, class_names):
    """class_weight = tổng/(n_lớp * số_ảnh_lớp) — bù cho lớp ít ảnh (vd False Smut, bakanae)."""
    counts = []
    for name in class_names:
        folder = os.path.join(train_dir, name)
        n = sum(1 for f in os.listdir(folder)
                if f.lower().endswith((".jpg", ".jpeg", ".png", ".webp"))) if os.path.isdir(folder) else 0
        counts.append(max(n, 1))
    total = sum(counts)
    k = len(class_names)
    weights = {i: total / (k * c) for i, c in enumerate(counts)}
    print(">> Số ảnh/lớp:", dict(zip(class_names, counts)))
    return weights


def build_model(num_classes):
    base = MobileNetV2(input_shape=(IMG_SIZE, IMG_SIZE, 3), include_top=False, weights="imagenet")
    base.trainable = False
    model = models.Sequential([
        base,
        layers.GlobalAveragePooling2D(),
        layers.Dropout(0.3),
        layers.Dense(num_classes, activation="softmax"),
    ])
    model.compile(optimizer=tf.keras.optimizers.Adam(1e-3),
                  loss="sparse_categorical_crossentropy", metrics=["accuracy"])
    return model, base


def main():
    p = argparse.ArgumentParser(description="Train rice disease/pest classifier")
    p.add_argument("--data", default="dataset", help="Thư mục gốc dataset (chứa train/ validation/)")
    p.add_argument("--epochs", type=int, default=8)
    p.add_argument("--fine-tune-epochs", type=int, default=4)
    p.add_argument("--batch", type=int, default=32)
    p.add_argument("--val-split", type=float, default=0.2, help="Chỉ dùng khi KHÔNG có train/validation")
    args = p.parse_args()

    if not os.path.isdir(args.data):
        raise SystemExit(f"[LỖI] Không thấy dataset: {args.data} (xem README.md)")

    train_ds, val_ds, class_names, train_dir = build_datasets(args.data, args.batch, args.val_split)
    print(f">> Số lớp: {len(class_names)}")

    class_weight = compute_class_weights(train_dir, class_names)
    model, base = build_model(len(class_names))

    print(">> Giai đoạn 1: train đầu phân loại (base đóng băng)")
    model.fit(train_ds, validation_data=val_ds, epochs=args.epochs, class_weight=class_weight)

    if args.fine_tune_epochs > 0:
        print(">> Giai đoạn 2: fine-tune 30 lớp cuối MobileNetV2")
        base.trainable = True
        for layer in base.layers[:-30]:
            layer.trainable = False
        model.compile(optimizer=tf.keras.optimizers.Adam(1e-5),
                      loss="sparse_categorical_crossentropy", metrics=["accuracy"])
        model.fit(train_ds, validation_data=val_ds, epochs=args.fine_tune_epochs, class_weight=class_weight)

    os.makedirs(MODEL_DIR, exist_ok=True)
    model.save(MODEL_PATH)
    labels_meta = [{"index": i, "label": n, "display": display_name(n)} for i, n in enumerate(class_names)]
    with open(LABELS_PATH, "w", encoding="utf-8") as f:
        json.dump(labels_meta, f, ensure_ascii=False, indent=2)

    print(f"\n>> ĐÃ LƯU: {MODEL_PATH}  +  {LABELS_PATH}")
    print(">> Khởi động service: uvicorn app:app --reload --port 8000")


if __name__ == "__main__":
    main()
