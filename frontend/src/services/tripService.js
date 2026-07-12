import api from './api';

export const tripService = {
  getAll: async () => {
    const res = await api.get('/trips');
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/trips/${id}`);
    return res.data;
  },
  create: async (data) => {
    const res = await api.post('/trips', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await api.put(`/trips/${id}`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/trips/${id}`);
    return res.data;
  },
};

export const TripService = tripService;
export default tripService;
