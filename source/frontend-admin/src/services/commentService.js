import api from './axiosInstance';

// Gửi multipart: data (JSON) + images (File mới theo thứ tự __IMG_i__), giống bài viết.
const buildFormData = (data, images = []) => {
  const fd = new FormData();
  fd.append('data', JSON.stringify({ ...data, localTime: new Date().toISOString() }));
  images.forEach(f => fd.append('images', f));
  return fd;
};

export const getComments   = (postId, params = {}) => api.get('/comments', { params: { post_id: postId, ...params } });
export const createComment  = (data, images)        => api.post('/comments', buildFormData(data, images));
export const updateComment  = (id, data, images)    => api.put(`/comments/${id}`, buildFormData(data, images));
export const deleteComment  = (id)                  => api.delete(`/comments/${id}`);
