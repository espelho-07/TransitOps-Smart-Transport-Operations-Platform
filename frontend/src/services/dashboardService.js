import api from './api';

export const dashboardService = {
  getKPIs: async () => {
    const res = await api.get('/dashboard/kpis');
    return res.data;
  },
  getChartsData: async () => {
    const res = await api.get('/dashboard/charts');
    return res.data;
  },
  getInsights: async () => {
    const res = await api.get('/dashboard/insights');
    return res.data;
  },
};

export const DashboardService = dashboardService;
export default dashboardService;
