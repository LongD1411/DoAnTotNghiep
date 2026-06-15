import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const getAuthHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('access_token') || sessionStorage.getItem('access_token')}`,
  },
});

export const getAllCategories = (params = {}) =>
  axios.get(`${API_URL}/categories`, { params });

export const getCategoryById = (id) =>
  axios.get(`${API_URL}/categories/${id}`);

export const createCategory = (data) =>
  axios.post(`${API_URL}/categories`, { ...data, localTime: new Date().toISOString() }, getAuthHeader());

export const updateCategory = (id, data) =>
  axios.put(`${API_URL}/categories/${id}`, { ...data, localTime: new Date().toISOString() }, getAuthHeader());

export const deleteCategory = (id) =>
  axios.delete(`${API_URL}/categories/${id}`, getAuthHeader());
