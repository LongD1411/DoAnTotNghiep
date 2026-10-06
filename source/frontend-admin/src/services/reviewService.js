import api from './axiosInstance';

// Danh sách review theo sản phẩm + summary { average, total, distribution[5★..1★] }
export const getReviews = (productId, params = {}) =>
  api.get('/reviews', { params: { product_id: productId, ...params } });

// Gửi đánh giá theo lần mua — cần order_item_id (từ đơn đã nhận). localTime bắt buộc.
export const createReview = (data) =>
  api.post('/reviews', { ...data, localTime: new Date().toISOString() });
