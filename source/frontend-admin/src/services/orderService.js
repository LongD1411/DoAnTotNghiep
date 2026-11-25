import api from './axiosInstance';

// Đơn hàng — tất cả endpoint cần đăng nhập (axiosInstance tự gắn Bearer token).
//
//   POST /orders  (xem thiết kế/API_DOCS.md — Orders)
//   body: {
//     address:        { full_name, phone, street, ward?, district, city, zip? },
//     payment_method: 'cod' | 'bank_transfer',
//     note?:          string,
//     localTime:      ISO string   // backend bỏ qua; đính kèm theo convention
//   }
//
// Backend đọc giỏ server-side của user để dựng OrderItem + tính total/phí ship theo GIÁ DB
// (không nhận items/giá/phí từ client), tạo Address + Order, xoá giỏ, trả về đơn vừa tạo
// trong { data: <order> } (gồm id, code `DH######`, total, payment_status...).
export const createOrder = (payload) =>
  api.post('/orders', { ...payload, localTime: new Date().toISOString() });

// Lịch sử đơn của user hiện tại (dùng cho tab "Đơn hàng" sau này)
export const getMyOrders = (params = {}) =>
  api.get('/orders', { params });

export const getOrderById = (id) =>
  api.get(`/orders/${id}`);

// Admin cập nhật trạng thái đơn / thanh toán (PUT /orders/:id). data: { status?, payment_status?, cancel_reason? }
export const updateOrder = (id, data) =>
  api.put(`/orders/${id}`, { ...data, localTime: new Date().toISOString() });

// Chủ đơn tự huỷ đơn — backend chỉ cho huỷ khi đơn còn 'pending' (và hoàn lại tồn kho)
export const cancelOrder = (id, cancel_reason) =>
  api.put(`/orders/${id}/cancel`, { cancel_reason, localTime: new Date().toISOString() });
