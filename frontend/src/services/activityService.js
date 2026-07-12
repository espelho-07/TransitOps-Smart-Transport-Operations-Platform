import { activities, saveCollection } from '../data/db';
import { makeThenable } from './thenable';

export const activityService = {
  getAll: () => {
    return makeThenable([...activities]);
  },
  create: (action, description, user = 'System') => {
    let author = user;
    if (author === 'System' && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('user');
        if (stored) {
          author = JSON.parse(stored).name || 'System';
        }
      } catch (err) {
        console.error(err);
      }
    }
    const nextId = `A${String(activities.length + 1).padStart(3, '0')}`;
    const newActivity = {
      id: nextId,
      user: author,
      action,
      description,
      date: new Date().toLocaleString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }),
      status: 'success'
    };
    activities.unshift(newActivity);
    saveCollection('activities', activities);
    return makeThenable({ ...newActivity });
  }
};

export const ActivityService = activityService;
export const AuditService = activityService;
export default activityService;
