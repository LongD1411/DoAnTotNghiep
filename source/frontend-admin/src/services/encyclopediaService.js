import api from './axiosInstance';

export const getAllEntries = (params = {}) =>
  api.get('/pest-entries', { params });

export const getEntryById = (id) =>
  api.get(`/pest-entries/${id}`);

export const createEntry = (data) =>
  api.post('/pest-entries', data);

export const updateEntry = (id, data) =>
  api.put(`/pest-entries/${id}`, data);

export const deleteEntry = (id) =>
  api.delete(`/pest-entries/${id}`);
