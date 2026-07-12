import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const ROLES = {
  ADMIN: 'Admin',
  FLEET_MANAGER: 'Fleet Manager',
  DRIVER: 'Driver',
  SAFETY_OFFICER: 'Safety Officer',
  FINANCIAL_ANALYST: 'Financial Analyst'
};

const MOCK_PROFILES = {
  [ROLES.ADMIN]: {
    name: 'Alex Johnson',
    email: 'alex.johnson@transitops.com',
    role: ROLES.ADMIN,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80',
    coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'
  },
  [ROLES.FLEET_MANAGER]: {
    name: 'Marcus Brody',
    email: 'marcus.brody@transitops.com',
    role: ROLES.FLEET_MANAGER,
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&h=150&q=80',
    coverImage: 'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=800&q=80'
  },
  [ROLES.DRIVER]: {
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@transitops.com',
    role: ROLES.DRIVER,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
    coverImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80',
    phone: '+1 (555) 234-5678',
    emergencyContact: 'John Jenkins (+1 555-987-6543)',
    assignedVehicleId: 'V002' // Sarah Jenkins is D002 -> assigned to V002!
  },
  [ROLES.SAFETY_OFFICER]: {
    name: 'Officer David Vance',
    email: 'david.vance@transitops.com',
    role: ROLES.SAFETY_OFFICER,
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&h=150&q=80',
    coverImage: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=800&q=80'
  },
  [ROLES.FINANCIAL_ANALYST]: {
    name: 'Fiona Gallagher',
    email: 'fiona.gallagher@transitops.com',
    role: ROLES.FINANCIAL_ANALYST,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&h=150&q=80',
    coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80'
  }
};

export const AuthProvider = ({ children }) => {
  // Default user is Admin
  const [currentUser, setCurrentUser] = useState(MOCK_PROFILES[ROLES.ADMIN]);

  const switchRole = (roleName) => {
    if (MOCK_PROFILES[roleName]) {
      setCurrentUser(MOCK_PROFILES[roleName]);
    }
  };

  const updateProfileImage = (newUrl) => {
    setCurrentUser(prev => ({
      ...prev,
      avatar: newUrl
    }));
  };

  const updateCoverImage = (newUrl) => {
    setCurrentUser(prev => ({
      ...prev,
      coverImage: newUrl
    }));
  };

  const updateContactInfo = (phone, emergencyContact) => {
    setCurrentUser(prev => ({
      ...prev,
      phone,
      emergencyContact
    }));
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      switchRole,
      updateProfileImage,
      updateCoverImage,
      updateContactInfo,
      profiles: MOCK_PROFILES
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
