import api from './axiosInstance';

// Quản lý người dùng (admin). Dùng cho dashboard tổng quan + trang quản lý user sau này.
export const getAllUsers = (params = {}) =>
  api.get('/users', { params });

export const getUserById = (id) =>
  api.get(`/users/${id}`);
