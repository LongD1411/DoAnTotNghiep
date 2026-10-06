import api from './axiosInstance';

export const getAllProducts = (params = {}) =>
  api.get('/products', { params });

export const getProductById = (id) =>
  api.get(`/products/${id}`);

// Gửi multipart: field `data` (JSON các trường + existing_images + localTime) + field `images` (File mới).
// Backend validate `data` TRƯỚC rồi mới upload file → không có ảnh mồ côi khi lưu lỗi.
const buildFormData = (data, images = []) => {
  const fd = new FormData();
  const existing = images.filter(i => typeof i === 'string');
  const files    = images.filter(i => i instanceof File);
  fd.append('data', JSON.stringify({ ...data, existing_images: existing, localTime: new Date().toISOString() }));
  files.forEach(f => fd.append('images', f));
  return fd;
};

export const createProduct = (data, images) =>
  api.post('/products', buildFormData(data, images));

export const updateProduct = (id, data, images) =>
  api.put(`/products/${id}`, buildFormData(data, images));

export const deleteProduct = (id) =>
  api.delete(`/products/${id}`);
