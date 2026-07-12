import api from './api';

export const fuelService = {
  getAll: () => api.get('/fuel').then((res) => res.data),
  getById: (id) => api.get(`/fuel/${id}`).then((res) => res.data),
  create: (data) => api.post('/fuel', data).then((res) => res.data),
  update: (id, data) => api.put(`/fuel/${id}`, data).then((res) => res.data),
  delete: (id) => api.delete(`/fuel/${id}`).then((res) => res.data)
};
