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

export const router = createBrowserRouter([
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
        path: '*',
        element: <Navigate to="/dashboard" replace />
      }
    ]
  }
]);
