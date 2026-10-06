import api from './axiosInstance';

// Đơn hàng — tất cả endpoint cần đăng nhập (axiosInstance tự gắn Bearer token).
//
// ⚠️ Backend CHƯA có route /orders (mới chỉ có model Order trong Prisma). Chạy /api để tạo
// controller + route trước khi "Đặt hàng" hoạt động. Contract kỳ vọng của POST /orders:
//
//   POST /orders
//   body: {
//     address:       { fullName, phone, street, ward, district, city },
//     paymentMethod: 'cod' | 'bank_transfer' | 'vnpay',
//     note:          string | null,
//     shippingFee:   number,   // client tính để hiển thị — backend TỰ tính lại (authoritative)
//     localTime:     ISO string
//   }
//
// Backend đọc giỏ server-side của user đang đăng nhập để dựng OrderItem + tính total,
// tạo Address + Order, xoá giỏ, rồi trả về đơn vừa tạo. Không nhận items/giá từ client
// (tránh sửa giá). Trả về shape chuẩn { data: <order> } như các controller khác.
export const createOrder = (payload) =>
  api.post('/orders', { ...payload, localTime: new Date().toISOString() });

// Lịch sử đơn của user hiện tại (dùng cho tab "Đơn hàng" sau này)
export const getMyOrders = (params = {}) =>
  api.get('/orders', { params });

export const getOrderById = (id) =>
  api.get(`/orders/${id}`);
