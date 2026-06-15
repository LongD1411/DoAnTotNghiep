import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const getToken = (key) =>
  localStorage.getItem(key) || sessionStorage.getItem(key);

const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${getToken('access_token')}` },
});

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

export const refresh = () =>
  axios.post(`${API_URL}/auth/refresh`, { refresh_token: getToken('refresh_token') });

export const getProfile = () =>
  axios.get(`${API_URL}/auth/me`, getAuthHeader());
