import api from './api';

export const maintenanceService = {
  getAll: () => api.get('/maintenance').then((res) => res.data),
  getById: (id) => api.get(`/maintenance/${id}`).then((res) => res.data),
  create: (data) => api.post('/maintenance', data).then((res) => res.data),
  update: (id, data) => api.put(`/maintenance/${id}`, data).then((res) => res.data),
  delete: (id) => api.delete(`/maintenance/${id}`).then((res) => res.data)
};
