import { makeThenable } from './thenable';
import { dashboardMetrics } from '../data/dashboard';

export const dashboardService = {
  getKPIs: () => {
    return makeThenable({ ...dashboardMetrics });
  },
  getChartsData: () => {
    return makeThenable({
      monthlySpend: [120000, 150000, 110000, 180000, 140000, 210000]
    });
  },
  getInsights: () => {
    return makeThenable([
      'Fleet utilization has improved by 4.2% since last week.',
      'Average fuel efficiency is holding steady at 8.2 km/L.',
      '3 maintenance approvals are currently pending analyst review.'
    ]);
  }
};

export const DashboardService = dashboardService;
export default dashboardService;
