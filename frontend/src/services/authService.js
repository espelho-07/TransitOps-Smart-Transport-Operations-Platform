import { users, saveCollection } from '../data/db';

const MOCK_PROFILES = {
  'admin@transitops.com': {
    id: 'U001',
    name: 'Alex Johnson',
    email: 'admin@transitops.com',
    role: 'Admin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80',
    coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'
  },
  'manager@transitops.com': {
    id: 'U002',
    name: 'Marcus Brody',
    email: 'manager@transitops.com',
    role: 'Fleet Manager',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&h=150&q=80',
    coverImage: 'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=800&q=80'
  },
  'driver@transitops.com': {
    id: 'U003',
    name: 'Sarah Jenkins',
    email: 'driver@transitops.com',
    role: 'Driver',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
    coverImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80',
    phone: '+1 (555) 234-5678',
    emergencyContact: 'John Jenkins (+1 555-987-6543)',
    assignedVehicleId: 'V002'
  },
  'safety@transitops.com': {
    id: 'U004',
    name: 'Officer David Vance',
    email: 'safety@transitops.com',
    role: 'Safety Officer',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&h=150&q=80',
    coverImage: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=800&q=80'
  },
  'analyst@transitops.com': {
    id: 'U005',
    name: 'Fiona Gallagher',
    email: 'analyst@transitops.com',
    role: 'Financial Analyst',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&h=150&q=80',
    coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80'
  }
};

// Aliases matching user-generated lists in db.js
const ALIASES = {
  'alex.johnson@transitops.com': 'admin@transitops.com',
  'marcus.brody@transitops.com': 'manager@transitops.com',
  'sarah.jenkins@transitops.com': 'driver@transitops.com',
  'david.vance@transitops.com': 'safety@transitops.com',
  'fiona.gallagher@transitops.com': 'analyst@transitops.com'
};

export const authService = {
  login: (email, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const cleanEmail = email.toLowerCase().trim();
        const targetEmail = ALIASES[cleanEmail] || cleanEmail;

        // Try standard profile mapping
        let profile = MOCK_PROFILES[targetEmail];
        
        // If not found in default profiles, check custom signed up users in db
        if (!profile) {
          profile = users.find(u => u.email?.toLowerCase().trim() === cleanEmail);
        }

        if (profile && (password === 'password' || profile.password === password || !profile.password)) {
          const mockToken = `mock-jwt-token-${profile.role.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}`;
          localStorage.setItem('token', mockToken);
          localStorage.setItem('user', JSON.stringify(profile));
          resolve({ success: true, user: profile, token: mockToken });
        } else {
          reject(new Error("Invalid email or password. Use 'password' for demo accounts."));
        }
      }, 400);
    });
  },

  logout: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        resolve({ success: true });
      }, 200);
    });
  },

  signup: (userData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const cleanEmail = userData.email?.toLowerCase().trim();
        
        // Check duplicate email
        const exists = users.some(u => u.email?.toLowerCase().trim() === cleanEmail) || MOCK_PROFILES[cleanEmail];
        if (exists) {
          return reject(new Error("A user with this email address already exists."));
        }

        const nextId = `U${String(users.length + 1).padStart(3, '0')}`;
        const newUser = {
          id: nextId,
          name: `${userData.firstName} ${userData.lastName}`,
          email: cleanEmail,
          phone: userData.phone,
          password: userData.password,
          role: userData.role,
          company: userData.company || 'TransitOps Logistics',
          status: 'Active',
          avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80`,
          coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'
        };

        users.push(newUser);
        saveCollection('users', users);
        resolve({ success: true, user: newUser });
      }, 500);
    });
  },

  forgotPassword: (email) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!email) return reject(new Error("Email target is required."));
        resolve({ success: true });
      }, 400);
    });
  },

  resetPassword: (token, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!password) return reject(new Error("Password is required."));
        resolve({ success: true });
      }, 400);
    });
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
    
    switch (user.role) {
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
