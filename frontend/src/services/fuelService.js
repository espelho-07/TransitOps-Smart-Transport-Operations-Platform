import { mockFuelLogs } from '../data/fuel';

let fuelLogs = [...mockFuelLogs];

export const fuelService = {
  getAll: () => {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...fuelLogs]), 400);
    });
  },
  getById: (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const item = fuelLogs.find((f) => f.id === id);
        if (item) resolve({ ...item });
        else reject(new Error("Fuel log not found"));
      }, 250);
    });
  },
  create: (data) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const nextId = `F${String(fuelLogs.length + 1).padStart(3, '0')}`;
        const newLog = {
          id: nextId,
          date: new Date().toISOString().split('T')[0],
          quantity: Number(data.quantity) || 0,
          cost: Number(data.cost) || 0,
          odometer: Number(data.odometer) || 0,
          ...data
        };
        fuelLogs.push(newLog);
        resolve({ ...newLog });
      }, 400);
    });
  },
  update: (id, data) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = fuelLogs.findIndex((f) => f.id === id);
        if (index !== -1) {
          fuelLogs[index] = { ...fuelLogs[index], ...data };
          resolve({ ...fuelLogs[index] });
        } else {
          reject(new Error("Fuel log not found"));
        }
      }, 400);
    });
  },
  delete: (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = fuelLogs.findIndex((f) => f.id === id);
        if (index !== -1) {
          fuelLogs = fuelLogs.filter((f) => f.id !== id);
          resolve({ success: true, id });
        } else {
          reject(new Error("Fuel log not found"));
        }
      }, 300);
    });
  }
};
