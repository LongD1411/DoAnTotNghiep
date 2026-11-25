"""
Nhãn lớp cho mô hình ĐA CÂY (Lúa + Ngô + Sầu riêng) — 30 lớp.

- KEY của CROP_LABELS = tên thư mục lớp NGUYÊN VĂN (cũng là `modelLabel` bên backend).
  Mọi lớp đều có tiền tố cây: "Lúa - ", "Ngô - ", "Sầu riêng - ".
- value.display: tên hiển thị tiếng Việt gọn; value.healthy: lớp cây khỏe.
- Nguồn chân lý lúc suy luận vẫn là `model/labels.json` sinh khi train.
"""

CROP_LABELS = {
    # ── LÚA (21) ──────────────────────────────────────────────────────────────
    "Lúa - Bệnh Bạc lá (Bacterial leaf blight)":                 {"display": "Lúa - Bệnh bạc lá (vi khuẩn)",        "healthy": False},
    "Lúa - Bệnh Cháy lá ( Leaf scald )":                         {"display": "Lúa - Bệnh cháy lá (leaf scald)",     "healthy": False},
    "Lúa - Bệnh Gạch Nâu ( Narrow Brown Spot )":                 {"display": "Lúa - Bệnh gạch nâu (đốm nâu hẹp)",   "healthy": False},
    "Lúa - Bệnh Than Vàng ( False Smut )":                       {"display": "Lúa - Bệnh than vàng (false smut)",   "healthy": False},
    "Lúa - Bệnh lúa von (lúa đực) (Rice bakanae disease)":       {"display": "Lúa - Bệnh lúa von (mạ đực, bakanae)","healthy": False},
    "Lúa - Bệnh Đạo ôn lá và cổ bông (Rice leaf and neck blast)":{"display": "Lúa - Bệnh đạo ôn (lá & cổ bông)",    "healthy": False},
    "Lúa - Bệnh Đốm Nâu ( Brown spot )":                         {"display": "Lúa - Bệnh đốm nâu",                  "healthy": False},
    "Lúa - Bệnh Đốm Vằn ( Khô vằn ) ( Sheath Blight )":          {"display": "Lúa - Bệnh đốm vằn (khô vằn)",        "healthy": False},
    "Lúa - Bọ trĩ ( Thrips )":                                   {"display": "Lúa - Bọ trĩ",                        "healthy": False},
    "Lúa - Khỏe mạnh":                                           {"display": "Lúa - Khỏe mạnh",                     "healthy": True},
    "Lúa - K":                                                   {"display": "Lúa - Thiếu Kali (K)",                "healthy": False},
    "Lúa - N":                                                   {"display": "Lúa - Thiếu đạm (N)",                 "healthy": False},
    "Lúa - P":                                                   {"display": "Lúa - Thiếu lân (P)",                 "healthy": False},
    "Lúa - Rầy Nâu (Brown Plant Hopper)":                        {"display": "Lúa - Rầy nâu",                       "healthy": False},
    "Lúa - Sâu cuốn lá lớn ( Rice skipper)":                     {"display": "Lúa - Sâu cuốn lá lớn",               "healthy": False},
    "Lúa - Sâu cuốn lá nhỏ ( Rice leaf folder)":                 {"display": "Lúa - Sâu cuốn lá nhỏ",               "healthy": False},
    "Lúa - Sâu gai ( Hispa )":                                   {"display": "Lúa - Sâu gai (hispa)",               "healthy": False},
    "Lúa - Sâu năn ( Muỗi hành )(Rice Gall Midge)":              {"display": "Lúa - Sâu năn (muỗi hành)",           "healthy": False},
    "Lúa - Sâu đục thân (Rice yellow stem borer)":               {"display": "Lúa - Sâu đục thân (bướm 2 chấm)",    "healthy": False},
    "Lúa - Sâu đục thân (Sọc nâu )( Chilo suppressalis )":       {"display": "Lúa - Sâu đục thân sọc nâu",          "healthy": False},
    "Lúa - Tungro virus":                                        {"display": "Lúa - Bệnh vàng lùn Tungro (virus)",  "healthy": False},

    # ── NGÔ (4) ───────────────────────────────────────────────────────────────
    "Ngô - Bệnh cháy lá (Blight)":          {"display": "Ngô - Bệnh cháy lá (Northern Leaf Blight)", "healthy": False},
    "Ngô - Bệnh gỉ sắt (Common Rust)":      {"display": "Ngô - Bệnh gỉ sắt",                         "healthy": False},
    "Ngô - Bệnh đốm lá xám (Gray Leaf Spot)":{"display": "Ngô - Bệnh đốm lá xám",                    "healthy": False},
    "Ngô - Khỏe mạnh":                      {"display": "Ngô - Khỏe mạnh",                           "healthy": True},

    # ── SẦU RIÊNG (5) ───────────────────────────────────────────────────────────
    "Sầu riêng - Bệnh tảo (Algal)":       {"display": "Sầu riêng - Bệnh đốm tảo",            "healthy": False},
    "Sầu riêng - Bệnh cháy lá (Blight)":  {"display": "Sầu riêng - Bệnh cháy lá",            "healthy": False},
    "Sầu riêng - Khỏe mạnh":              {"display": "Sầu riêng - Khỏe mạnh",               "healthy": True},
    "Sầu riêng - Bệnh Phomopsis":         {"display": "Sầu riêng - Bệnh đốm lá Phomopsis",   "healthy": False},
    "Sầu riêng - Bệnh Rhizoctonia":       {"display": "Sầu riêng - Bệnh cháy lá Rhizoctonia","healthy": False},
}

# Tên cũ RICE_LABELS vẫn trỏ tới đây để không vỡ import.
RICE_LABELS = CROP_LABELS
CLASS_NAMES = list(CROP_LABELS.keys())


def _clean(label: str) -> str:
    import re
    s = re.sub(r"\s+", " ", label).strip()
    return s.replace("( ", "(").replace(" )", ")")


def display_name(label: str) -> str:
    info = CROP_LABELS.get(label)
    return info["display"] if info else _clean(label)
