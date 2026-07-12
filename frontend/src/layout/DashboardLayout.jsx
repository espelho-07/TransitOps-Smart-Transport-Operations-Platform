import React, { useEffect } from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import Footer from './Footer';
import Breadcrumb from '../components/Breadcrumb';
import PageHeader from '../components/PageHeader';
import PageContainer from '../components/PageContainer';
import { useUI } from '../context/UIContext';

const DashboardLayout = () => {
  const location = useLocation();
  const { setIsMobileDrawerOpen } = useUI();

  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Close mobile drawer whenever route changes
  useEffect(() => {
    setIsMobileDrawerOpen(false);
  }, [location.pathname, setIsMobileDrawerOpen]);


  const getPageMeta = () => {
    const segments = location.pathname.split('/').filter(Boolean);
    if (segments.length === 0) {
      return {
        title: 'Dashboard Overview',
        subtitle: 'Welcome to TransitOps. Live monitoring of logistics, assets, dispatches, and diagnostics.'
      };
    }

    const last = segments[segments.length - 1];
    const title = last.charAt(0).toUpperCase() + last.slice(1).replace(/-/g, ' ');

    switch (last) {
      case 'dashboard':
        return {
          title: 'Dashboard Overview',
          subtitle: 'Welcome to TransitOps. Live monitoring of logistics, assets, dispatches, and diagnostics.'
        };
      case 'vehicles':
        return {
          title: 'Vehicles Fleet',
          subtitle: 'Manage commercial trucks, box vans, diagnostic registers, and carrier compliance.'
        };
      case 'vehicles/add':
      case 'add':
        if (location.pathname.includes('vehicles')) {
          return {
            title: 'Add New Vehicle',
            subtitle: 'Register a new commercial carrier asset into TransitOps inventory.'
          };
        }
        break;
      case 'drivers':
        return {
          title: 'Drivers Directory',
          subtitle: 'Track active drivers, commercial licensing, training compliance, and work shifts.'
        };
      case 'drivers/add':
        return {
          title: 'Add New Driver',
          subtitle: 'Register a commercial operator profile with licensing checks.'
        };
      case 'trips':
        return {
          title: 'Dispatch Board',
          subtitle: 'Dispatch cargo, monitor active routing schedules, and check route completions.'
        };
      case 'dispatch':
        return {
          title: 'Dispatch Live Cargo',
          subtitle: 'Assign carriers, routes, operators, and cargo details.'
        };
      case 'maintenance':
        return {
          title: 'Maintenance Logbook',
          subtitle: 'Preventive service scheduling, diagnostics reports, and breakdown details.'
        };
      case 'fuel':
        return {
          title: 'Fuel Ledgers',
          subtitle: 'Track fuel card refills, fuel consumption metrics, and fill stations.'
        };
      case 'expenses':
        return {
          title: 'Expenses Ledgers',
          subtitle: 'Monitor tolls, salaries, vehicle insurance premiums, and operational fees.'
        };
      case 'reports':
        return {
          title: 'Reports & Analytics',
          subtitle: 'Generate commercial audits, fuel efficiency reports, and cost declarations.'
        };
      case 'settings':
        return {
          title: 'System Settings',
          subtitle: 'Configure local formats, alert boundaries, and operational permissions.'
        };
      case 'profile':
        return {
          title: 'Operator Profile',
          subtitle: 'Manage your platform details, credentials, and settings logs.'
        };
      default:
        break;
    }

    return {
      title: title,
      subtitle: 'TransitOps Platform smart operator dashboard.'
    };
  };

  const { title, subtitle } = getPageMeta();

  return (
    <div className="flex h-screen overflow-hidden bg-background text-text-main">
      {/* Collapsible Sidebar */}
      <Sidebar />

      {/* Main content container */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Sticky Header Topbar */}
        <Topbar />

        {/* Scrollable content view */}
        <main className="flex-1 overflow-y-auto flex flex-col justify-between custom-scrollbar bg-background">
          <PageContainer maxWidth="7xl" className="flex-1 flex flex-col justify-between">
            <div className="flex-1 py-4 space-y-4">
              {/* Dynamic breadcrumb navigation trail */}
              <Breadcrumb />

              {/* Page header block */}
              <PageHeader title={title} subtitle={subtitle} />

              {/* Sub-view outlet */}
              <div className="w-full">
                <Outlet />
              </div>
            </div>

            {/* Layout footer */}
            <Footer />
          </PageContainer>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
