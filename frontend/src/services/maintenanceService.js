import { mockMaintenanceLogs } from '../data/maintenance';

let maintenanceLogs = [...mockMaintenanceLogs];

export const maintenanceService = {
  getAll: () => {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...maintenanceLogs]), 400);
    });
  },
  getById: (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const item = maintenanceLogs.find((m) => m.id === id);
        if (item) resolve({ ...item });
        else reject(new Error("Maintenance record not found"));
      }, 250);
    });
  },
  create: (data) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const nextId = `M${String(maintenanceLogs.length + 1).padStart(3, '0')}`;
        const newLog = {
          id: nextId,
          date: new Date().toISOString().split('T')[0],
          status: 'Scheduled',
          cost: Number(data.cost) || 0,
          ...data
        };
        maintenanceLogs.push(newLog);
        resolve({ ...newLog });
      }, 400);
    });
  },
  update: (id, data) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = maintenanceLogs.findIndex((m) => m.id === id);
        if (index !== -1) {
          maintenanceLogs[index] = { ...maintenanceLogs[index], ...data };
          resolve({ ...maintenanceLogs[index] });
        } else {
          reject(new Error("Maintenance record not found"));
        }
      }, 400);
    });
  },
  delete: (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = maintenanceLogs.findIndex((m) => m.id === id);
        if (index !== -1) {
          maintenanceLogs = maintenanceLogs.filter((m) => m.id !== id);
          resolve({ success: true, id });
        } else {
          reject(new Error("Maintenance record not found"));
        }
      }, 300);
    });
  }
};
