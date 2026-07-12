import api from './api';

export const reportService = {
  getAll: async () => {
    const res = await api.get('/reports');
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/reports/${id}`);
    return res.data;
  },
  create: async (data) => {
    const res = await api.post('/reports', data);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/reports/${id}`);
    return res.data;
  },
};

export const ReportService = reportService;
export default reportService;
