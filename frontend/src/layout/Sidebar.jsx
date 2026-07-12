import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Truck,
  Users,
  Route,
  Wrench,
  Fuel,
  DollarSign,
  BarChart3,
  Settings,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ShieldCheck
} from 'lucide-react';
import { useUI } from '../context/UIContext';
import ConfirmationDialog from '../components/ConfirmationDialog';
import Avatar from '../components/Avatar';
import { showToast } from '../components/Toast';

const Sidebar = () => {
  const { isSidebarCollapsed, toggleSidebarCollapse, isMobileDrawerOpen, setIsMobileDrawerOpen } = useUI();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Accordion state for submenus
  const [openSubmenu, setOpenSubmenu] = useState({
    vehicles: false,
    drivers: false,
    trips: false
  });

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    {
      name: 'Vehicles',
      path: '/vehicles',
      icon: Truck,
      submenuKey: 'vehicles',
      children: [
        { name: 'Fleet Inventory', path: '/vehicles' },
        { name: 'Add Vehicle', path: '/vehicles/add' }
      ]
    },
    {
      name: 'Drivers',
      path: '/drivers',
      icon: Users,
      submenuKey: 'drivers',
      children: [
        { name: 'Active Registry', path: '/drivers' },
        { name: 'Add Driver', path: '/drivers/add' }
      ]
    },
    {
      name: 'Trips',
      path: '/trips',
      icon: Route,
      submenuKey: 'trips',
      children: [
        { name: 'Trip Board', path: '/trips' },
        { name: 'Dispatch Form', path: '/trips/dispatch' }
      ]
    },
    { name: 'Maintenance', path: '/maintenance', icon: Wrench },
    { name: 'Fuel Logs', path: '/fuel', icon: Fuel },
    { name: 'Expenses', path: '/expenses', icon: DollarSign },
    { name: 'Reports', path: '/reports', icon: BarChart3 },
    { name: 'Settings', path: '/settings', icon: Settings },
    { name: 'Profile', path: '/profile', icon: User }
  ];

  // Auto-expand parent accordion if a child link is currently active
  useEffect(() => {
    const activePath = location.pathname;
    const nextSubmenuState = { vehicles: false, drivers: false, trips: false };
    
    menuItems.forEach(item => {
      if (item.children) {
        const hasActiveChild = item.children.some(child => child.path === activePath);
        if (hasActiveChild) {
          nextSubmenuState[item.submenuKey] = true;
        }
      }
    });

    setOpenSubmenu(prev => ({ ...prev, ...nextSubmenuState }));
  }, [location.pathname]);

  const handleSubmenuToggle = (key, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSidebarCollapsed) {
      // If collapsed, expand the sidebar first before opening accordion
      toggleSidebarCollapse();
    }
    setOpenSubmenu(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    showToast.success('Logged out successfully');
    navigate('/dashboard');
  };

  const sidebarVariants = {
    expanded: { width: 256 },
    collapsed: { width: 80 }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-sidebar border-r border-border select-none">
      {/* Brand Header */}
      <div className={`flex items-center h-16 border-b border-border px-5 ${isSidebarCollapsed ? 'justify-center' : 'justify-start'}`}>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-info/10 text-info">
            <ShieldCheck size={20} strokeWidth={2} />
          </div>
          {!isSidebarCollapsed && (
            <span className="text-sm font-bold tracking-tight text-text-main animate-fadeIn">
              Transit<span className="text-info">Ops</span>
            </span>
          )}
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const hasChildren = !!item.children;
          const isSubmenuOpen = item.submenuKey ? openSubmenu[item.submenuKey] : false;
          
          // Check if parent has active child
          const isParentActive = hasChildren 
            ? item.children.some(child => child.path === location.pathname)
            : location.pathname === item.path;

          if (hasChildren) {
            return (
              <div key={item.name} className="space-y-0.5">
                <button
                  onClick={(e) => handleSubmenuToggle(item.submenuKey, e)}
                  className={`
                    w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold transition-all group relative
                    ${isParentActive
                      ? 'bg-hover/75 text-text-main'
                      : 'text-text-secondary hover:text-text-main hover:bg-hover'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={18} className="flex-shrink-0" />
                    {!isSidebarCollapsed && <span className="animate-fadeIn">{item.name}</span>}
                  </div>
                  
                  {!isSidebarCollapsed && (
                    <ChevronDown
                      size={14}
                      className={`text-text-secondary transition-transform duration-250 ${isSubmenuOpen ? 'rotate-180' : ''}`}
                    />
                  )}

                  {isSidebarCollapsed && (
                    <div className="absolute left-full ml-4 px-2 py-1 bg-card border border-border text-text-main text-xs font-semibold rounded shadow-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                      {item.name}
                    </div>
                  )}
                </button>

                {/* Submenu Children Accordion */}
                <AnimatePresence initial={false}>
                  {isSubmenuOpen && !isSidebarCollapsed && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.18, ease: 'easeInOut' }}
                      className="overflow-hidden pl-10 pr-2 space-y-0.5"
                    >
                      {item.children.map((child) => (
                        <NavLink
                          key={child.name}
                          to={child.path}
                          end
                          className={({ isActive }) => `
                            block py-2 text-xs font-semibold rounded-md transition-colors
                            ${isActive
                              ? 'text-info'
                              : 'text-text-secondary hover:text-text-main'
                            }
                          `}
                        >
                          {child.name}
                        </NavLink>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          }

          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all group relative
                ${isActive
                  ? 'bg-info/10 text-info'
                  : 'text-text-secondary hover:text-text-main hover:bg-hover'
                }
              `}
            >
              <item.icon size={18} className="flex-shrink-0" />
              {!isSidebarCollapsed && (
                <span className="animate-fadeIn">{item.name}</span>
              )}
              
              {isSidebarCollapsed && (
                <div className="absolute left-full ml-4 px-2 py-1 bg-card border border-border text-text-main text-xs font-semibold rounded shadow-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                  {item.name}
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Operator User Card & Version info */}
      <div className="p-3 border-t border-border bg-hover/10 space-y-2">
        {/* User Card */}
        <div className={`flex items-center gap-3 p-2 rounded-lg ${isSidebarCollapsed ? 'justify-center' : ''}`}>
          <Avatar initials="AJ" status="active" size={isSidebarCollapsed ? 'sm' : 'md'} />
          {!isSidebarCollapsed && (
            <div className="min-w-0 flex-1 select-none animate-fadeIn">
              <p className="text-xs font-bold text-text-main truncate">Alex Johnson</p>
              <p className="text-[10px] text-text-secondary font-medium truncate">alex.johnson@transitops.com</p>
            </div>
          )}
        </div>

        <div className="h-px bg-border/50" />

        <div className="space-y-1.5">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className={`
              w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold text-danger hover:bg-danger/10 transition-colors group relative
              ${isSidebarCollapsed ? 'justify-center' : 'justify-start'}
            `}
            aria-label="Logout button"
          >
            <LogOut size={16} className="flex-shrink-0" />
            {!isSidebarCollapsed && <span>Logout</span>}
            {isSidebarCollapsed && (
              <div className="absolute left-full ml-4 px-2 py-1 bg-card border border-border text-danger text-xs font-semibold rounded shadow-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                Logout
              </div>
            )}
          </button>

          {/* Desktop side panel collapse switch */}
          <button
            onClick={toggleSidebarCollapse}
            className="hidden md:flex w-full items-center gap-3 px-3 py-2 rounded-lg text-[10px] font-bold text-text-secondary hover:text-text-main hover:bg-hover transition-colors uppercase tracking-widest"
            aria-label={isSidebarCollapsed ? "Expand Sidebar Menu" : "Collapse Sidebar Menu"}
          >
            {isSidebarCollapsed ? (
              <ChevronRight size={14} className="mx-auto" />
            ) : (
              <>
                <ChevronLeft size={14} />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>

        {/* System build metadata */}
        {!isSidebarCollapsed && (
          <div className="text-center pt-1.5 animate-fadeIn">
            <span className="text-[9px] font-bold text-text-secondary/50 uppercase tracking-widest block">
              Version v1.0.0-hackathon
            </span>
          </div>
        )}
      </div>

      <ConfirmationDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Confirm Logout"
        message="Are you sure you want to log out of the TransitOps platform?"
        confirmText="Logout"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );

  return (
    <>
      {/* Desktop view sidebar */}
      <motion.aside
        animate={isSidebarCollapsed ? 'collapsed' : 'expanded'}
        variants={sidebarVariants}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="hidden md:block h-screen sticky top-0 flex-shrink-0 overflow-hidden"
      >
        <SidebarContent />
      </motion.aside>

      {/* Mobile view swipeable drawer overlay */}
      <AnimatePresence>
        {isMobileDrawerOpen && (
          <div className="fixed inset-0 z-40 md:hidden flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileDrawerOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-[1px]"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.2 }}
              className="relative w-64 h-full z-10 flex-shrink-0"
            >
              <SidebarContent />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
