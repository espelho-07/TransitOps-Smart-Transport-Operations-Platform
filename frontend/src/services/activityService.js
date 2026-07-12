import { activities } from '../data/db';

export const activityService = {
  getAll: () => {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...activities]), 200);
    });
  }
};
