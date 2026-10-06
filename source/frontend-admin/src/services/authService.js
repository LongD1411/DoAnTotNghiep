import axios from 'axios';
import api from './axiosInstance';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const getToken = (key) =>
  localStorage.getItem(key) || sessionStorage.getItem(key);

export const clearTokens = () => {
  ['access_token', 'refresh_token'].forEach((k) => {
    localStorage.removeItem(k);
    sessionStorage.removeItem(k);
  });
};

export const login = (email, password) =>
  axios.post(`${API_URL}/auth/login`, { email, password });

export const register = (data) =>
  axios.post(`${API_URL}/auth/register`, data);

export const logout = () => {
  const refresh_token = getToken('refresh_token');
  clearTokens();
  return axios.post(`${API_URL}/auth/logout`, { refresh_token });
};

// Dùng plain axios để tránh interceptor loop (axiosInstance tự gọi refresh)
export const refresh = () =>
  axios.post(`${API_URL}/auth/refresh`, { refresh_token: getToken('refresh_token') });

export const getProfile = () =>
  api.get('/auth/me');

export const updateProfile = (data) =>
  api.put('/auth/me', { ...data, localTime: new Date().toISOString() });

export const changePassword = (data) =>
  api.put('/auth/me/password', { ...data, localTime: new Date().toISOString() });

// Giải mã payload JWT access_token (không verify chữ ký — chỉ để đọc { id, role } phía client).
// Dùng để ẩn/hiện UI theo quyền; backend vẫn kiểm tra quyền thật ở mỗi request.
export const getCurrentUser = () => {
  const token = getToken('access_token');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return { id: payload.id, role: payload.role };
  } catch {
    return null;
  }
};

export const isStaff = () => {
  const role = getCurrentUser()?.role;
  return role === 'mod' || role === 'admin';
};
