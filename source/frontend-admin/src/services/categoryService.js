import api from './axiosInstance';

export const getAllCategories = (params = {}) =>
  api.get('/categories', { params });

export const getCategoryById = (id) =>
  api.get(`/categories/${id}`);

export const createCategory = (data) =>
  api.post('/categories', { ...data, localTime: new Date().toISOString() });

export const updateCategory = (id, data) =>
  api.put(`/categories/${id}`, { ...data, localTime: new Date().toISOString() });

export const deleteCategory = (id) =>
  api.delete(`/categories/${id}`);
