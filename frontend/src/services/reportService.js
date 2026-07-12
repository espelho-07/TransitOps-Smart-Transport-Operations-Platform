import { reports, saveCollection } from '../data/db';
import { makeThenable } from './thenable';

export const reportService = {
  getAll: () => {
    return makeThenable([...reports]);
  },
  getById: (id) => {
    const item = reports.find((r) => r.id === id);
    if (!item) throw new Error("Report not found");
    return makeThenable({ ...item });
  },
  create: (data) => {
    const nextId = `R${String(reports.length + 1).padStart(3, '0')}`;
    const newReport = {
      id: nextId,
      status: 'Generated',
      fileSize: `${Math.floor(Math.random() * 200) + 10} KB`,
      date: new Date().toISOString().split('T')[0],
      ...data
    };
    reports.push(newReport);
    saveCollection('reports', reports);
    return makeThenable({ ...newReport });
  },
  delete: (id) => {
    const index = reports.findIndex((r) => r.id === id);
    if (index !== -1) {
      reports.splice(index, 1);
      saveCollection('reports', reports);
      return makeThenable({ success: true, id });
    }
    throw new Error("Report not found");
  }
};

export const ReportService = reportService;
export default reportService;
