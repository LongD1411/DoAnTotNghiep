import { uploadToT3, deleteFromT3 } from '../utils/t3Storage.js';
import { respond, ERR, SCN } from '../common/response.js';

const upload = async (req, res) => {
  if (!req.file) return respond.badRequest(res, ERR.VALIDATION);

  const ext      = req.file.originalname.split('.').pop().toLowerCase();
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  try {
    const url = await uploadToT3(req.file.buffer, filename, req.file.mimetype);
    respond.ok(res, SCN.OK, { url });
  } catch {
    respond.serverError(res, ERR.SERVER);
  }
};

// Xóa ảnh khỏi storage — dùng để rollback ảnh vừa upload khi form lưu thất bại
const remove = async (req, res) => {
  const { url } = req.body;
  if (!url || typeof url !== 'string') return respond.badRequest(res, ERR.VALIDATION);

  try {
    await deleteFromT3(url);
    respond.ok(res, SCN.DELETED, null);
  } catch {
    respond.serverError(res, ERR.SERVER);
  }
};

export { upload, remove };
