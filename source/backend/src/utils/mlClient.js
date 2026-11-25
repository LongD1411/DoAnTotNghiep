// Client gọi ML service (Python/FastAPI) để nhận diện bệnh cây qua ảnh.
// Dùng global fetch/FormData/Blob (Node 18+).

const ML_BASE = process.env.ML_SERVICE_URL || 'http://localhost:8000';
const TIMEOUT_MS = parseInt(process.env.ML_TIMEOUT_MS || '30000', 10);

// Gửi buffer ảnh sang /predict, trả về { top, predictions }.
// Throw Error có .code = 'ML_NOT_READY' (chưa train model) | 'ML_ERROR' (lỗi/kết nối).
export const predictDisease = async (buffer, filename, mimetype) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const form = new FormData();
    form.append('file', new Blob([buffer], { type: mimetype || 'image/jpeg' }), filename || 'leaf.jpg');

    const resp = await fetch(`${ML_BASE}/predict`, {
      method: 'POST',
      body:   form,
      signal: controller.signal,
    });

    if (resp.status === 503) {
      const e = new Error('Model chưa sẵn sàng'); e.code = 'ML_NOT_READY'; throw e;
    }
    if (!resp.ok) {
      const e = new Error(`ML service trả về ${resp.status}`); e.code = 'ML_ERROR'; throw e;
    }
    return await resp.json(); // { top: {...}, predictions: [...] }
  } catch (err) {
    if (err.code === 'ML_NOT_READY') throw err;
    const e = new Error(err.name === 'AbortError' ? 'ML service timeout' : 'Không gọi được ML service');
    e.code = 'ML_ERROR';
    throw e;
  } finally {
    clearTimeout(timer);
  }
};
