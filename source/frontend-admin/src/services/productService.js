import api from './axiosInstance';

export const getAllProducts = (params = {}) =>
  api.get('/products', { params });

export const getProductById = (id) =>
  api.get(`/products/${id}`);

export const createProduct = (data) =>
  api.post('/products', { ...data, localTime: new Date().toISOString() });

export const updateProduct = (id, data) =>
  api.put(`/products/${id}`, { ...data, localTime: new Date().toISOString() });

export const deleteProduct = (id) =>
  api.delete(`/products/${id}`);
