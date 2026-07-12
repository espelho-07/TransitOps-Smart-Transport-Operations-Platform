import { notifications } from '../data/db';

export const notificationService = {
  getAll: () => {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...notifications]), 200);
    });
  }
};
