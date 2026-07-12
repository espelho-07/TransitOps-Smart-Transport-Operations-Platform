const mockReportsList = [
  { id: 'R001', name: 'Monthly Fleet Utilization Report', type: 'CSV', date: '2026-06-01', size: '42 KB', category: 'Operational', status: 'Generated' },
  { id: 'R002', name: 'Quarterly Expense Breakdown & ROI', type: 'PDF', date: '2026-05-15', size: '1.2 MB', category: 'Financial', status: 'Generated' },
  { id: 'R003', name: 'Annual Safety and Compliance Audit', type: 'PDF', date: '2026-04-10', size: '3.4 MB', category: 'Compliance', status: 'Generated' },
  { id: 'R004', name: 'Monthly Fuel Efficiency Metrics', type: 'CSV', date: '2026-06-15', size: '18 KB', category: 'Operational', status: 'Pending' }
];

let reports = [...mockReportsList];

/**
 * Promise-based Mock Report Service
 * Exposes audit and utilization print controllers.
 */
export const reportService = {
  getAll: () => {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...reports]), 300);
    });
  },
  getById: (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const item = reports.find(r => r.id === id);
        if (item) resolve({ ...item });
        else reject(new Error('Report not found'));
      }, 200);
    });
  },
  create: (data) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const nextId = `R${String(reports.length + 1).padStart(3, '0')}`;
        const newReport = {
          id: nextId,
          status: 'Generated',
          size: `${Math.floor(Math.random() * 200) + 10} KB`,
          date: new Date().toISOString().split('T')[0],
          ...data
        };
        reports.push(newReport);
        resolve({ ...newReport });
      }, 400);
    });
  },
  delete: (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = reports.findIndex(r => r.id === id);
        if (index !== -1) {
          reports = reports.filter(r => r.id !== id);
          resolve({ success: true, id });
        } else {
          reject(new Error('Report not found'));
        }
      }, 250);
    });
  }
};

export default reportService;
