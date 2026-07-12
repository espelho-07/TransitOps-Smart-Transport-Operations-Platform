import api from './api';

export const tripService = {
  getAll: () => api.get('/trips').then((res) => res.data),
  getById: (id) => api.get(`/trips/${id}`).then((res) => res.data),
  create: (data) => api.post('/trips', data).then((res) => res.data),
  update: (id, data) => api.put(`/trips/${id}`, data).then((res) => res.data),
  delete: (id) => api.delete(`/trips/${id}`).then((res) => res.data)
};
