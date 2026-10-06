import api from './axiosInstance';

// Chủ đề diễn đàn (cho dropdown) — trả mảng
export const getForumCategories = () => api.get('/forum-categories');

export const getPosts    = (params = {}) => api.get('/posts', { params });
export const getPostById = (id)          => api.get(`/posts/${id}`);

// Gửi multipart: data (JSON: title, category_id, content + localTime) + images (File mới theo thứ tự __IMG_i__).
// Backend validate TRƯỚC rồi mới upload ảnh → không có ảnh mồ côi khi lưu lỗi.
const buildFormData = (data, images = []) => {
  const fd = new FormData();
  fd.append('data', JSON.stringify({ ...data, localTime: new Date().toISOString() }));
  images.forEach(f => fd.append('images', f));
  return fd;
};

export const createPost = (data, images)     => api.post('/posts', buildFormData(data, images));
export const updatePost = (id, data, images)  => api.put(`/posts/${id}`, buildFormData(data, images)); // sửa bài của mình

// ── Kiểm duyệt (mod/admin) ──────────────────────────────────────────────────────
export const getPendingPosts = (params = {}) => api.get('/posts/pending', { params });
export const moderatePost    = (id, status)  => api.patch(`/posts/${id}/status`, { status, localTime: new Date().toISOString() });
export const deletePost      = (id)          => api.delete(`/posts/${id}`); // không duyệt → xoá hẳn
