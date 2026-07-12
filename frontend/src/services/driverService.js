import api from './api';

export const driverService = {
  getAll: () => api.get('/drivers').then((res) => res.data),
  getById: (id) => api.get(`/drivers/${id}`).then((res) => res.data),
  create: (data) => api.post('/drivers', data).then((res) => res.data),
  update: (id, data) => api.put(`/drivers/${id}`, data).then((res) => res.data),
  delete: (id) => api.delete(`/drivers/${id}`).then((res) => res.data)
};
