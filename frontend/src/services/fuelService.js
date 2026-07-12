import api from './api';

export const fuelService = {
  getAll: async () => {
    const res = await api.get('/fuel');
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/fuel/${id}`);
    return res.data;
  },
  create: async (data) => {
    const payload = {
      ...data,
      quantity: Number(data.quantity),
      cost: Number(data.cost),
      odometer: Number(data.odometer),
    };
    const res = await api.post('/fuel', payload);
    return res.data;
  },
  update: async (id, data) => {
    const res = await api.put(`/fuel/${id}`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/fuel/${id}`);
    return res.data;
  },
};

export const FuelService = fuelService;
export const FuelLogService = fuelService;
export default fuelService;
