import api from './axiosInstance';

// Giỏ hàng server-side (user đã đăng nhập). Guest dùng localStorage — xem store/useCartStore.js
export const getCart = () => api.get('/cart');

export const addCartItem = (product_id, quantity = 1) =>
  api.post('/cart/items', { product_id, quantity, localTime: new Date().toISOString() });

export const updateCartItem = (product_id, quantity) =>
  api.put(`/cart/items/${product_id}`, { quantity, localTime: new Date().toISOString() });

export const removeCartItem = (product_id) =>
  api.delete(`/cart/items/${product_id}`);

// Merge giỏ guest vào giỏ user (gọi 1 lần ngay sau khi đăng nhập)
export const syncCart = (items) =>
  api.post('/cart/sync', { items, localTime: new Date().toISOString() });
