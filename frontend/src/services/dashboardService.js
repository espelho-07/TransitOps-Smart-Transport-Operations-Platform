import api from './api';

export const dashboardService = {
  getKPIs: () => api.get('/dashboard/kpis').then((res) => res.data),
  getChartsData: () => api.get('/dashboard/charts').then((res) => res.data),
  getInsights: () => api.get('/dashboard/insights').then((res) => res.data)
};

export default dashboardService;
