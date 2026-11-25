import api from './axiosInstance';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const token = () => localStorage.getItem('access_token') || sessionStorage.getItem('access_token');

export const getNotifications = (params = {}) => api.get('/notifications', { params });
export const markNotificationRead = (id) => api.put(`/notifications/${id}/read`);
export const markAllNotificationsRead = () => api.put('/notifications/read-all');

// SSE realtime. EventSource không gửi được header → token qua query.
export const openNotificationStream = () => {
  const t = token();
  if (!t) return null;
  return new EventSource(`${API_URL}/notifications/stream?token=${encodeURIComponent(t)}`);
};
