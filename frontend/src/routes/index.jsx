import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import DashboardLayout from '../layout/DashboardLayout';
import Dashboard from '../pages/Dashboard';
import Vehicles from '../pages/Vehicles';
import AddVehicle from '../pages/Vehicles/AddVehicle';
import Drivers from '../pages/Drivers';
import AddDriver from '../pages/Drivers/AddDriver';
import Trips from '../pages/Trips';
import DispatchTrip from '../pages/Trips/DispatchTrip';
import Maintenance from '../pages/Maintenance';
import FuelLogs from '../pages/FuelLogs';
import Expenses from '../pages/Expenses';
import Reports from '../pages/Reports';
import Settings from '../pages/Settings';
import Profile from '../pages/Profile';
import Users from '../pages/Users';
import AuditLogs from '../pages/AuditLogs';
import HelpCenter from '../pages/HelpCenter';
import Notifications from '../pages/Notifications';
import NotFound from '../pages/NotFound';
import ServerError from '../pages/ServerError';
import InviteUser from '../pages/InviteUser';
import Approvals from '../pages/Approvals';
import LoginPage from '../pages/auth/LoginPage';
import SignupPage from '../pages/auth/SignupPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPassword from '../pages/ResetPassword';
import EmailVerification from '../pages/EmailVerification';
import AccessDenied from '../pages/AccessDenied';
import SessionExpired from '../pages/SessionExpired';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />
  },
  {
    path: '/signup',
    element: <SignupPage />
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />
  },
  {
    path: '/reset-password',
    element: <ResetPassword />
  },
  {
    path: '/verify-email',
    element: <EmailVerification />
  },
  {
    path: '/session-expired',
    element: <SessionExpired />
  },
  {
    path: '/500',
    element: <ServerError />
  },
  {
    path: '/',
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />
      },
      {
        path: 'dashboard',
        element: <Dashboard />
      },
      {
        path: 'vehicles',
        children: [
          { index: true, element: <Vehicles /> },
          { path: 'add', element: <AddVehicle /> }
        ]
      },
      {
        path: 'drivers',
        children: [
          { index: true, element: <Drivers /> },
          { path: 'add', element: <AddDriver /> }
        ]
      },
      {
        path: 'trips',
        children: [
          { index: true, element: <Trips /> },
          { path: 'dispatch', element: <DispatchTrip /> }
        ]
      },
      {
        path: 'maintenance',
        element: <Maintenance />
      },
      {
        path: 'approvals',
        element: <Approvals />
      },
      {
        path: 'fuel',
        element: <FuelLogs />
      },
      {
        path: 'expenses',
        element: <Expenses />
      },
      {
        path: 'reports',
        element: <Reports />
      },
      {
        path: 'settings',
        element: <Settings />
      },
      {
        path: 'profile',
        element: <Profile />
      },
      {
        path: 'users',
        element: <Users />
      },
      {
        path: 'audit-logs',
        element: <AuditLogs />
      },
      {
        path: 'help',
        element: <HelpCenter />
      },
      {
        path: 'notifications',
        element: <Notifications />
      },
      {
        path: 'invite-user',
        element: <InviteUser />
      },
      {
        path: 'access-denied',
        element: <AccessDenied />
      },
      {
        path: '404',
        element: <NotFound />
      },
      {
        path: '*',
        element: <NotFound />
      }
    ]
  }
]);
