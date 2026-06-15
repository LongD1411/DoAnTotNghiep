import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const getAuthHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('access_token') || sessionStorage.getItem('access_token')}`,
  },
});

export const getAllProducts = (params = {}) =>
  axios.get(`${API_URL}/products`, { params });

export const getProductById = (id) =>
  axios.get(`${API_URL}/products/${id}`);

export const createProduct = (data) =>
  axios.post(`${API_URL}/products`, { ...data, localTime: new Date().toISOString() }, getAuthHeader());

export const updateProduct = (id, data) =>
  axios.put(`${API_URL}/products/${id}`, { ...data, localTime: new Date().toISOString() }, getAuthHeader());

export const deleteProduct = (id) =>
  axios.delete(`${API_URL}/products/${id}`, getAuthHeader());
