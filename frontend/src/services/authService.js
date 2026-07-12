import api from './api';

export const authService = {
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token, user } = res.data;
    // Normalize: ensure single `role` field from roles array
    const userData = {
      ...user,
      role: user.role || (user.roles && user.roles[0]) || 'Fleet Manager',
    };
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    return { success: true, user: userData, token };
  },

  logout: async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return { success: true };
  },

  signup: async (userData) => {
    const name = `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || userData.name;
    const res = await api.post('/auth/register', {
      email: userData.email,
      password: userData.password,
      name,
      role: userData.role || 'Fleet Manager',
      phone: userData.phone,
      company: userData.company,
    });
    return { success: true, user: res.data.user };
  },

  forgotPassword: async (email) => {
    if (!email) throw new Error('Email target is required.');
    // Not yet implemented on backend — return success optimistically
    return { success: true };
  },

  resetPassword: async (token, password) => {
    if (!password) throw new Error('Password is required.');
    return { success: true };
  },

  getCurrentUser: () => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  getPermissions: () => {
    const user = authService.getCurrentUser();
    if (!user) return [];
    const role = user.role || (user.roles && user.roles[0]) || '';
    switch (role) {
      case 'Admin':
        return ['all'];
      case 'Fleet Manager':
        return ['fleet_view', 'fleet_edit', 'trips_view', 'trips_edit', 'drivers_view', 'drivers_edit', 'maint_view', 'maint_edit', 'fuel_view', 'fuel_edit', 'expense_view', 'expense_edit', 'reports_view'];
      case 'Driver':
        return ['driver_dashboard', 'own_data_view', 'own_profile_edit', 'own_trip_update', 'own_fuel_add'];
      case 'Safety Officer':
        return ['safety_dashboard', 'drivers_view', 'compliance_view', 'compliance_edit', 'license_tracking', 'safety_reports', 'incident_reports'];
      case 'Financial Analyst':
        return ['financial_dashboard', 'expenses_view', 'expenses_edit', 'fuel_view', 'reports_view', 'fleet_read_only'];
      default:
        return [];
    }
  },

  hasPermission: (perm) => {
    const perms = authService.getPermissions();
    if (perms.includes('all')) return true;
    return perms.includes(perm);
  }
};

export default authService;
