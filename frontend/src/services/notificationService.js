import api from './api';

export const notificationService = {
  getAll: async () => {
    const res = await api.get('/notifications');
    return res.data;
  },
  create: async (title, description, priority = 'Info', category = 'Fleet') => {
    const res = await api.post('/notifications', { title, description, priority, category });
    return res.data;
  },
  markAsRead: async (id) => {
    const res = await api.patch(`/notifications/${id}/read`);
    return res.data;
  },
  markAllAsRead: async () => {
    const res = await api.patch('/notifications/read-all');
    return res.data;
  },
  archive: async (id) => {
    const res = await api.delete(`/notifications/${id}`);
    return res.data;
  },
  clearAll: async () => {
    const res = await api.delete('/notifications');
    return res.data;
  },
};

export const NotificationService = notificationService;
export default notificationService;
