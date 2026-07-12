import api from './api';

export const vehicleService = {
  getAll: () => api.get('/vehicles').then((res) => res.data),
  getById: (id) => api.get(`/vehicles/${id}`).then((res) => res.data),
  create: (data) => api.post('/vehicles', data).then((res) => res.data),
  update: (id, data) => api.put(`/vehicles/${id}`, data).then((res) => res.data),
  delete: (id) => api.delete(`/vehicles/${id}`).then((res) => res.data)
};
