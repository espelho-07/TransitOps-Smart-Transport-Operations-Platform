import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, Sun, Moon, Bell, Search, User, Settings, LogOut, Command } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useUI } from '../context/UIContext';
import Dropdown from '../components/Dropdown';
import Avatar from '../components/Avatar';
import NotificationItem from '../components/NotificationItem';
import CommandPalette from '../components/CommandPalette';
import { showToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import { DriverAvatar } from '../components/ui/FallbackImage';

const Topbar = () => {
  const { isDark, toggleTheme } = useTheme();
  const { toggleMobileDrawer } = useUI();
  const { currentUser, switchRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Vehicle V003 scheduled for service', time: '10m ago', unread: true, type: 'maintenance' },
    { id: 2, title: 'Trip TRIP-2026-002 has started', time: '1h ago', unread: true, type: 'trip' },
    { id: 3, title: 'Fuel log added for V004', time: '3h ago', unread: false, type: 'fuel' },
    { id: 4, title: 'Driver Alex Pierce license expires soon', time: '1d ago', unread: true, type: 'license' },
    { id: 5, title: 'Driver Sarah Jenkins assigned to V002', time: '2d ago', unread: false, type: 'vehicle' }
  ]);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Listen to CTRL + K / CMD + K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleMarkAllRead = (e) => {
    e.stopPropagation();
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    showToast.success('All notifications marked as read');
  };

  const formattedDate = currentTime.toLocaleDateString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const formattedTime = currentTime.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  return (
    <header className="sticky top-0 z-30 h-16 w-full bg-card border-b border-border flex items-center justify-between px-6 shadow-sm select-none">
      {/* Mobile toggle & Search */}
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={toggleMobileDrawer}
          className="md:hidden p-1.5 rounded-lg text-text-secondary hover:text-text-main hover:bg-hover transition-colors"
          aria-label="Toggle Navigation Drawer"
        >
          <Menu size={20} />
        </button>

        {/* Global Search trigger bar */}
        <div
          onClick={() => setIsSearchOpen(true)}
          className="hidden sm:flex items-center w-full max-w-xs relative bg-hover/50 hover:bg-hover border border-border hover:border-text-secondary/35 rounded-lg pl-9 pr-3 py-1.5 cursor-pointer text-text-secondary transition-all"
        >
          <Search size={15} className="absolute left-3 text-text-secondary/50" />
          <span className="text-xs font-semibold text-left w-full select-none flex items-center justify-between">
            <span>Search assets, trips...</span>
            <span className="flex items-center gap-0.5 text-[9px] font-bold bg-card border border-border rounded px-1 scale-95 opacity-80">
              <Command size={8} />K
            </span>
          </span>
        </div>
      </div>

      {/* Date/Time */}
      <div className="hidden lg:flex items-center gap-4 text-xs font-semibold text-text-secondary border-r border-border pr-5 mr-2">
        <span className="normal-case text-[11px] text-text-secondary/80">{formattedDate}</span>
        <span className="tabular-nums text-text-main font-bold text-[11px]">{formattedTime}</span>
      </div>

      {/* Action panel */}
      <div className="flex items-center gap-3">
        {/* Global Role Switcher */}
        <div className="flex items-center gap-1.5 bg-hover border border-border rounded-lg p-1 mr-1">
          <span className="hidden md:inline text-[9.5px] text-text-secondary uppercase tracking-widest font-black px-1.5 select-none">
            Workspace:
          </span>
          <select
            value={currentUser.role}
            onChange={(e) => {
              switchRole(e.target.value);
              showToast.success(`Switched to ${e.target.value} Workspace`);
              navigate('/dashboard');
            }}
            className="bg-card border-none text-[10px] font-bold text-info focus:outline-none focus:ring-0 p-0 pr-6 pl-1.5 cursor-pointer uppercase tracking-wider h-6 rounded border-border"
          >
            <option value="Admin">Admin</option>
            <option value="Fleet Manager">Fleet Manager</option>
            <option value="Driver">Driver</option>
            <option value="Safety Officer">Safety Officer</option>
            <option value="Financial Analyst">Analyst</option>
          </select>
        </div>

        {/* Theme switch button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-text-secondary hover:text-text-main hover:bg-hover transition-colors focus:outline-none"
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          aria-label="Toggle Theme Color Scheme"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Alerts bell dropdown */}
        <Dropdown
          align="right"
          trigger={
            <button
              className="p-2 rounded-lg text-text-secondary hover:text-text-main hover:bg-hover transition-colors focus:outline-none relative"
              aria-label={`View Notifications. You have ${unreadCount} unread items.`}
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 h-4 w-4 bg-danger text-[9px] font-bold text-white flex items-center justify-center rounded-full ring-2 ring-card" style={{ fontSize: '8px' }}>
                  {unreadCount}
                </span>
              )}
            </button>
          }
        >
          <div className="w-80 max-w-xs">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
              <span className="text-xs font-bold text-text-main">Notifications</span>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-[10px] text-info hover:underline font-bold"
                >
                  Mark all read
                </button>
              )}
            </div>
            <div className="divide-y divide-border max-h-72 overflow-y-auto">
              {notifications.map((n) => (
                <NotificationItem
                  key={n.id}
                  title={n.title}
                  time={n.time}
                  unread={n.unread}
                  type={n.type}
                  onClick={() => {
                    setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, unread: false } : item));
                    showToast.info(`Notification: ${n.title}`);
                  }}
                />
              ))}
            </div>
          </div>
        </Dropdown>

        <div className="h-6 w-px bg-border" />

        {/* Profile avatar link dropdown */}
        <Dropdown
          align="right"
          trigger={
            <button
              className="flex items-center gap-2 focus:outline-none hover:opacity-85 transition-opacity"
              aria-label="User Account Settings Menu"
            >
              <DriverAvatar name={currentUser.name} avatarUrl={currentUser.avatar} size={32} />
              <div className="hidden lg:block text-left select-none">
                <p className="text-xs font-bold text-text-main leading-tight">{currentUser.name}</p>
                <p className="text-[10px] text-text-secondary font-semibold uppercase tracking-wider mt-0.5">{currentUser.role}</p>
              </div>
            </button>
          }
        >
          <div className="py-1">
            <div className="px-4 py-2 border-b border-border text-left">
              <p className="text-xs font-bold text-text-main">{currentUser.name}</p>
              <p className="text-[10px] text-text-secondary font-medium">{currentUser.email}</p>
            </div>
            
            <button
              onClick={() => {
                navigate('/profile');
                showToast.info('Opening Operator Profile');
              }}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-text-secondary hover:text-text-main hover:bg-hover transition-colors text-left"
            >
              <User size={14} />
              <span>Operator Profile</span>
            </button>

            <button
              onClick={() => {
                navigate('/settings');
                showToast.info('Opening System Settings');
              }}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-text-secondary hover:text-text-main hover:bg-hover transition-colors text-left"
            >
              <Settings size={14} />
              <span>System Settings</span>
            </button>

            <div className="border-t border-border mt-1" />

            <button
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/login');
                showToast.success('Sign out successful');
              }}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-danger hover:bg-danger/10 transition-colors text-left"
            >
              <LogOut size={14} />
              <span>Sign out</span>
            </button>
          </div>
        </Dropdown>
      </div>

      {/* Command Palette Keyboard Shortcut Modal */}
      <CommandPalette isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </header>
  );
};

export default Topbar;
