import api from './api';

export const notificationService = {
  getAll: () => api.get('/notifications').then((res) => res.data)
};
