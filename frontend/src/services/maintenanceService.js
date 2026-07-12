import api from './api';

export const maintenanceService = {
  getAll: async () => {
    const res = await api.get('/maintenance');
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/maintenance/${id}`);
    return res.data;
  },
  create: async (data) => {
    const payload = { ...data, cost: Number(data.cost) };
    const res = await api.post('/maintenance', payload);
    return res.data;
  },
  update: async (id, data) => {
    const res = await api.put(`/maintenance/${id}`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/maintenance/${id}`);
    return res.data;
  },
};

export const MaintenanceService = maintenanceService;
export default maintenanceService;
