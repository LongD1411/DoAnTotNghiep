import { ProductOutput } from './product.output.js';
import { PestEntryOutput } from './pestEntry.output.js';

// Kết quả chẩn đoán trả về cho frontend.
// status: 'matched'   -> khớp bệnh trong kho tri thức (có pest + thuốc)
//         'healthy'    -> cây khỏe mạnh
//         'unmatched'  -> không khớp / độ tin cậy thấp (fallback: hiện top-k)
export const DiagnosisOutput = ({ status, top, predictions, imageUrl, pest, diagnosisId }) => ({
  diagnosis_id:    diagnosisId ?? null,
  status,
  confidence:      top?.confidence ?? null,
  predicted_label: top?.label ?? null,
  display_name:    top?.display ?? null,
  image_url:       imageUrl ?? null,
  predictions: (predictions ?? []).map(p => ({
    label:      p.label,
    display:    p.display,
    confidence: p.confidence,
  })),
  pest: pest ? PestEntryOutput(pest) : null,
  recommended_products: pest?.recommendedProducts
    ? pest.recommendedProducts
        .map(rp => rp.product)
        .filter(p => p && p.isActive && !p.deletedAt)
        .map(ProductOutput)
    : [],
});

// Một dòng trong lịch sử chẩn đoán của người dùng.
export const DiagnosisHistoryItemOutput = (d) => ({
  id:              d.id,
  image_url:       d.imageUrl,
  predicted_label: d.predictedLabel,
  display_name:    d.displayName ?? null,
  confidence:      d.confidence,
  matched:         d.matched,
  pest: d.pest ? { id: d.pest.id, name: d.pest.name, slug: d.pest.slug, severity: d.pest.severity } : null,
  created_at:      d.createdAt,
});
