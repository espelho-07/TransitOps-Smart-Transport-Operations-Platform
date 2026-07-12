import api from './api';

export const vehicleService = {
  getAll: async () => {
    const res = await api.get('/vehicles');
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/vehicles/${id}`);
    return res.data;
  },
  create: async (data) => {
    const res = await api.post('/vehicles', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await api.put(`/vehicles/${id}`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/vehicles/${id}`);
    return res.data;
  },
  duplicate: async (id) => {
    const res = await api.post(`/vehicles/${id}/duplicate`);
    return res.data;
  },
  archive: async (id) => {
    const res = await api.patch(`/vehicles/${id}/archive`);
    return res.data;
  },
};

export const VehicleService = vehicleService;
export default vehicleService;
