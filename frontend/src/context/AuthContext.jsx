import React, { createContext, useContext, useState } from 'react';
import { authService } from '../services/authService';
import { users, saveCollection } from '../data/db';

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
    const res = await authService.signup(userData);
    return res;
  };

  const forgotPassword = async (email) => {
    return await authService.forgotPassword(email);
  };

  const resetPassword = async (token, password) => {
    return await authService.resetPassword(token, password);
  };

  const updateProfileImage = (newUrl) => {
    setCurrentUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, avatar: newUrl };
      localStorage.setItem('user', JSON.stringify(updated));
      const idx = users.findIndex(u => u.id === prev.id || u.email === prev.email);
      if (idx !== -1) {
        users[idx].avatar = newUrl;
        saveCollection('users', users);
      }
      return updated;
    });
  };

  const updateCoverImage = (newUrl) => {
    setCurrentUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, coverImage: newUrl };
      localStorage.setItem('user', JSON.stringify(updated));
      const idx = users.findIndex(u => u.id === prev.id || u.email === prev.email);
      if (idx !== -1) {
        users[idx].coverImage = newUrl;
        saveCollection('users', users);
      }
      return updated;
    });
  };

  const updateContactInfo = (phone, emergencyContact, address) => {
    setCurrentUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, phone, emergencyContact, address };
      localStorage.setItem('user', JSON.stringify(updated));
      const idx = users.findIndex(u => u.id === prev.id || u.email === prev.email);
      if (idx !== -1) {
        users[idx].phone = phone;
        users[idx].emergencyContact = emergencyContact;
        users[idx].address = address;
        saveCollection('users', users);
      }
      return updated;
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
