import api from './api';

export const activityService = {
  getAll: () => api.get('/activities').then((res) => res.data)
};
