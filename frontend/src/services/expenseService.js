import api from './api';

export const expenseService = {
  getAll: () => api.get('/expenses').then((res) => res.data),
  getById: (id) => api.get(`/expenses/${id}`).then((res) => res.data),
  create: (data) => api.post('/expenses', data).then((res) => res.data),
  update: (id, data) => api.put(`/expenses/${id}`, data).then((res) => res.data),
  delete: (id) => api.delete(`/expenses/${id}`).then((res) => res.data)
};
