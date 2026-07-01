import api from './axiosInstance';

export const uploadImage = async (file) => {
  const fd = new FormData();
  fd.append('file', file);
  // Không set Content-Type thủ công — axios tự thêm boundary cho FormData
  const res = await api.post('/upload', fd);
  return res.data.data.url;
};

// Nhận mảng string | File, upload các File và trả về mảng URL thuần
export const resolveImages = async (items) =>
  Promise.all(
    items.map(item => (typeof item === 'string' ? item : uploadImage(item)))
  );
