import { mockTrips } from '../data/trips';

let trips = [...mockTrips];

export const tripService = {
  getAll: () => {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...trips]), 400);
    });
  },
  getById: (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const item = trips.find((t) => t.id === id);
        if (item) resolve({ ...item });
        else reject(new Error("Trip not found"));
      }, 250);
    });
  },
  create: (data) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const nextId = `T${String(trips.length + 1).padStart(3, '0')}`;
        const newTrip = {
          id: nextId,
          tripNumber: `TRIP-2026-${String(trips.length + 1).padStart(3, '0')}`,
          startDate: new Date().toISOString(),
          status: 'Scheduled',
          ...data
        };
        trips.push(newTrip);
        resolve({ ...newTrip });
      }, 400);
    });
  },
  update: (id, data) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = trips.findIndex((t) => t.id === id);
        if (index !== -1) {
          trips[index] = { ...trips[index], ...data };
          resolve({ ...trips[index] });
        } else {
          reject(new Error("Trip not found"));
        }
      }, 400);
    });
  },
  delete: (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = trips.findIndex((t) => t.id === id);
        if (index !== -1) {
          trips = trips.filter((t) => t.id !== id);
          resolve({ success: true, id });
        } else {
          reject(new Error("Trip not found"));
        }
      }, 300);
    });
  }
};
