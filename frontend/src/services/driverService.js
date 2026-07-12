import { mockDrivers } from '../data/drivers';

let drivers = [...mockDrivers];

export const driverService = {
  getAll: () => {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...drivers]), 400);
    });
  },
  getById: (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const item = drivers.find((d) => d.id === id);
        if (item) resolve({ ...item });
        else reject(new Error("Driver not found"));
      }, 250);
    });
  },
  create: (data) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const nextId = `D${String(drivers.length + 1).padStart(3, '0')}`;
        const newDriver = {
          id: nextId,
          ratings: 5.0,
          hireDate: new Date().toISOString().split('T')[0],
          avatar: data.name ? data.name.split(' ').map(n => n[0]).join('').toUpperCase() : "DR",
          ...data
        };
        drivers.push(newDriver);
        resolve({ ...newDriver });
      }, 400);
    });
  },
  update: (id, data) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = drivers.findIndex((d) => d.id === id);
        if (index !== -1) {
          drivers[index] = { ...drivers[index], ...data };
          resolve({ ...drivers[index] });
        } else {
          reject(new Error("Driver not found"));
        }
      }, 400);
    });
  },
  delete: (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = drivers.findIndex((d) => d.id === id);
        if (index !== -1) {
          drivers = drivers.filter((d) => d.id !== id);
          resolve({ success: true, id });
        } else {
          reject(new Error("Driver not found"));
        }
      }, 300);
    });
  }
};
