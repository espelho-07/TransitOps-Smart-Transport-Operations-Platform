import { notifications, saveCollection } from '../data/db';
import { makeThenable } from './thenable';

export const notificationService = {
  getAll: () => {
    return makeThenable([...notifications]);
  },
  create: (title, description, priority = 'Info', category = 'Fleet') => {
    const nextId = `N${String(notifications.length + 1).padStart(3, '0')}`;
    const newNotif = {
      id: nextId,
      title,
      description,
      priority,
      category,
      time: 'Just now',
      unread: true
    };
    notifications.unshift(newNotif);
    saveCollection('notifications', notifications);
    return makeThenable({ ...newNotif });
  },
  markAsRead: (id) => {
    const item = notifications.find((n) => n.id === id);
    if (item) {
      item.unread = false;
      saveCollection('notifications', notifications);
      return makeThenable({ ...item });
    }
    throw new Error("Notification not found");
  },
  markAllAsRead: () => {
    notifications.forEach((n) => {
      n.unread = false;
    });
    saveCollection('notifications', notifications);
    return makeThenable([...notifications]);
  },
  archive: (id) => {
    const index = notifications.findIndex((n) => n.id === id);
    if (index !== -1) {
      notifications.splice(index, 1);
      saveCollection('notifications', notifications);
      return makeThenable({ success: true, id });
    }
    throw new Error("Notification not found");
  }
};

export const NotificationService = notificationService;
export default notificationService;
