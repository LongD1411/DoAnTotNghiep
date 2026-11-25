import api from './axiosInstance';

// Gửi ảnh lá cây lên backend để AI chẩn đoán bệnh (multipart/form-data).
// KHÔNG set Content-Type thủ công — axios tự thêm boundary cho FormData (giống uploadService).
export const diagnose = (file) => {
  const form = new FormData();
  form.append('file', file);
  return api.post('/diagnosis', form);
};

// Lịch sử chẩn đoán của người dùng hiện tại (cần đăng nhập).
export const getDiagnosisHistory = () => api.get('/diagnosis/history');
