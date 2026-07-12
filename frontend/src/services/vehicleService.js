import { mockVehicles } from '../data/vehicles';

let vehicles = [...mockVehicles];

export const vehicleService = {
  getAll: () => {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...vehicles]), 400);
    });
  },
  getById: (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const item = vehicles.find((v) => v.id === id);
        if (item) resolve({ ...item });
        else reject(new Error("Vehicle not found"));
      }, 250);
    });
  },
  create: (data) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const nextId = `V${String(vehicles.length + 1).padStart(3, '0')}`;
        const newVehicle = {
          id: nextId,
          ...data,
          odometer: Number(data.odometer) || 0
        };
        vehicles.push(newVehicle);
        resolve({ ...newVehicle });
      }, 400);
    });
  },
  update: (id, data) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = vehicles.findIndex((v) => v.id === id);
        if (index !== -1) {
          vehicles[index] = { ...vehicles[index], ...data };
          resolve({ ...vehicles[index] });
        } else {
          reject(new Error("Vehicle not found"));
        }
      }, 400);
    });
  },
  delete: (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = vehicles.findIndex((v) => v.id === id);
        if (index !== -1) {
          vehicles = vehicles.filter((v) => v.id !== id);
          resolve({ success: true, id });
        } else {
          reject(new Error("Vehicle not found"));
        }
      }, 300);
    });
  }
};
