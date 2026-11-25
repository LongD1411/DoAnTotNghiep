import prisma from '../config/database.js';
import { uploadToT3 } from '../utils/t3Storage.js';
import { predictDisease } from '../utils/mlClient.js';
import {
  DiagnosisOutput,
  DiagnosisHistoryItemOutput,
} from '../models/output/diagnosis.output.js';
import { respond, ERR, SCN } from '../common/response.js';

// Ngưỡng tin cậy tối thiểu để coi là "nhận diện được" (dưới ngưỡng -> fallback)
const THRESHOLD = parseFloat(process.env.DIAGNOSIS_CONFIDENCE_THRESHOLD || '0.6');

// Lớp cây khỏe mạnh (không phải bệnh): "Healthy" (lúa) hoặc "... Khỏe mạnh" (ngô, sầu riêng)
const isHealthy = (label) => /healthy|khỏe/i.test(label || '');

// Include đầy đủ cho PestEntry + sản phẩm thuốc khuyến nghị (để dựng card mua hàng)
const DIAGNOSIS_INCLUDE = {
  images:     { orderBy: { order: 'asc' } },
  symptoms:   { orderBy: { order: 'asc' } },
  treatments: { orderBy: { order: 'asc' } },
  cropTypes:  true,
  recommendedProducts: {
    include: {
      product: {
        include: {
          category: true,
          images:   { orderBy: { order: 'asc' } },
        },
      },
    },
  },
};

// POST /diagnosis  (optionalAuth + multipart field 'file')
// Nhận ảnh -> gọi ML service -> map sang kho tri thức -> trả kết quả/fallback + lưu lịch sử.
const diagnose = async (req, res) => {
  if (!req.file) return respond.badRequest(res, ERR.VALIDATION);

  // 1) Gọi ML service nhận diện
  let prediction;
  try {
    prediction = await predictDisease(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
    );
  } catch (err) {
    if (err.code === 'ML_NOT_READY') return respond.serverError(res, ERR.AI_NOT_READY);
    return respond.serverError(res, ERR.AI_UNAVAILABLE);
  }

  const top = prediction?.top ?? null;
  const predictions = prediction?.predictions ?? [];

  // 2) Upload ảnh để lưu lịch sử (best-effort, không chặn kết quả)
  let imageUrl = null;
  try {
    const ext = (req.file.originalname?.split('.').pop() || 'jpg').toLowerCase();
    const filename = `diagnosis-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    imageUrl = await uploadToT3(req.file.buffer, filename, req.file.mimetype);
  } catch {
    /* bỏ qua: vẫn trả kết quả dù upload ảnh lỗi */
  }

  // 3) Xác định trạng thái + tra kho tri thức
  let status = 'unmatched';
  let pest = null;

  if (top && top.confidence >= THRESHOLD) {
    if (isHealthy(top.label)) {
      status = 'healthy';
    } else {
      pest = await prisma.pestEntry.findUnique({
        where:   { modelLabel: top.label },
        include: DIAGNOSIS_INCLUDE,
      }).catch(() => null);
      status = pest ? 'matched' : 'unmatched';
    }
  }

  // 4) Lưu lịch sử chẩn đoán (best-effort)
  let diagnosisId = null;
  try {
    const saved = await prisma.diagnosis.create({
      data: {
        userId:         req.user?.id ?? null,
        imageUrl:       imageUrl || '',
        predictedLabel: top?.label || 'unknown',
        displayName:    top?.display || null,
        confidence:     top?.confidence ?? 0,
        matched:        status === 'matched',
        pestId:         pest?.id ?? null,
        predictions:    JSON.stringify(predictions),
      },
    });
    diagnosisId = saved.id;
  } catch {
    /* lịch sử không bắt buộc */
  }

  respond.ok(res, SCN.OK, DiagnosisOutput({ status, top, predictions, imageUrl, pest, diagnosisId }));
};

// GET /diagnosis/history  (authenticateToken) — lịch sử chẩn đoán của chính user
const history = async (req, res) => {
  try {
    const items = await prisma.diagnosis.findMany({
      where:   { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take:    50,
      include: { pest: { select: { id: true, name: true, slug: true, severity: true } } },
    });
    respond.ok(res, SCN.OK, items.map(DiagnosisHistoryItemOutput));
  } catch {
    respond.serverError(res, ERR.SERVER);
  }
};

export { diagnose, history };
