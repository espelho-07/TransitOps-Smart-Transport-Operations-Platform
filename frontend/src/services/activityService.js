import api from './api';

export const activityService = {
  getAll: async () => {
    const res = await api.get('/activities');
    return res.data;
  },
  create: async (action, description, user = 'System') => {
    // Best-effort: fire-and-forget. Non-blocking so UI doesn't break if this fails.
    try {
      const res = await api.post('/activities', { action, description, user });
      return res.data;
    } catch {
      // Silently fail — activity logging must never break main flows
      return { id: null, action, description, user };
    }
  },
};

export const ActivityService = activityService;
export const AuditService = activityService;
export default activityService;
