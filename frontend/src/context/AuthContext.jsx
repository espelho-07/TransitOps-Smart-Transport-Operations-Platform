import React, { createContext, useContext, useState } from 'react';
import { authService } from '../services/authService';

export const ROLES = {
  ADMIN: 'Admin',
  FLEET_MANAGER: 'Fleet Manager',
  DRIVER: 'Driver',
  SAFETY_OFFICER: 'Safety Officer',
  FINANCIAL_ANALYST: 'Financial Analyst'
};

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => authService.getCurrentUser());

  const login = async (email, password) => {
    const res = await authService.login(email, password);
    if (res.success) {
      setCurrentUser(res.user);
    }
    return res;
  };

  const logout = async () => {
    await authService.logout();
    setCurrentUser(null);
  };

  const signup = async (userData) => {
    return await authService.signup(userData);
  };

  const forgotPassword = async (email) => {
    return await authService.forgotPassword(email);
  };

  const resetPassword = async (token, password) => {
    return await authService.resetPassword(token, password);
  };

  // Profile update helpers — persist only to localStorage (profile page patches API separately)
  const _persistUser = (updated) => {
    localStorage.setItem('user', JSON.stringify(updated));
    return updated;
  };

  const updateProfileImage = (newUrl) => {
    setCurrentUser(prev => {
      if (!prev) return null;
      return _persistUser({ ...prev, avatar: newUrl });
    });
  };

  const updateCoverImage = (newUrl) => {
    setCurrentUser(prev => {
      if (!prev) return null;
      return _persistUser({ ...prev, coverImage: newUrl });
    });
  };

  const updateContactInfo = (phone, emergencyContact, address) => {
    setCurrentUser(prev => {
      if (!prev) return null;
      return _persistUser({ ...prev, phone, emergencyContact, address });
    });
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      login,
      logout,
      signup,
      forgotPassword,
      resetPassword,
      updateProfileImage,
      updateCoverImage,
      updateContactInfo,
      isAuthenticated: () => !!currentUser,
      hasPermission: (perm) => authService.hasPermission(perm),
      getPermissions: () => authService.getPermissions()
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
