import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, Sun, Moon, Bell, Search, User, Settings, LogOut, Command, CheckSquare, Trash2, X, AlertTriangle, Info } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useUI } from '../context/UIContext';
import Dropdown from '../components/Dropdown';
import Drawer from '../components/ui/Drawer';
import CommandPalette from '../components/CommandPalette';
import { showToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import { DriverAvatar } from '../components/ui/FallbackImage';
import { notificationService } from '../services/notificationService';

const Topbar = () => {
  const { isDark, toggleTheme } = useTheme();
  const { toggleMobileDrawer } = useUI();
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

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

  // Fetch notifications
  const fetchNotifications = async () => {
    setLoadingNotifs(true);
    try {
      const data = await notificationService.getAll();
      setNotifications(data);
    } catch {
      console.error('Failed to load notifications');
    } finally {
      setLoadingNotifs(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [isNotifDrawerOpen]);

  const unreadCount = useMemo(() => {
    return notifications.filter(n => n.unread).length;
  }, [notifications]);

  // Group notifications
  const groupedNotifications = useMemo(() => {
    const groups = {
      unread: [],
      today: [],
      yesterday: [],
      earlier: []
    };

    notifications.forEach(n => {
      if (n.unread) {
        groups.unread.push(n);
      } else {
        const timeStr = n.time || '';
        if (timeStr.includes('m ago') || timeStr.includes('h ago') || timeStr.includes('minutes') || timeStr.includes('hours')) {
          groups.today.push(n);
        } else if (timeStr.includes('1d ago') || timeStr.includes('1 day')) {
          groups.yesterday.push(n);
        } else {
          groups.earlier.push(n);
        }
      }
    });

    return groups;
  }, [notifications]);

  const handleMarkRead = async (id, e) => {
    e?.stopPropagation();
    try {
      await notificationService.markAsRead(id);
      fetchNotifications();
    } catch {
      showToast.error('Failed to update status');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      showToast.success('All notifications marked as read');
      fetchNotifications();
    } catch {
      showToast.error('Failed to mark all as read');
    }
  };

  const handleClearRead = async () => {
    try {
      const readNotifs = notifications.filter(n => !n.unread);
      await Promise.all(readNotifs.map(n => notificationService.archive(n.id)));
      showToast.success('Cleared read notifications');
      fetchNotifications();
    } catch {
      showToast.error('Failed to clear read alerts');
    }
  };

  const handleNotificationClick = async (n) => {
    if (n.unread) {
      await notificationService.markAsRead(n.id);
    }
    setIsNotifDrawerOpen(false);

    // Route dynamically based on type
    if (n.type === 'vehicle') {
      navigate('/vehicles');
    } else if (n.type === 'trip') {
      navigate('/trips');
    } else if (n.type === 'maintenance') {
      navigate('/maintenance');
    } else if (n.type === 'expense') {
      navigate('/expenses');
    } else {
      navigate('/dashboard');
    }
    showToast.info(`Inspecting alert details`);
  };

  const handleLogoutClick = async () => {
    await logout();
    navigate('/login');
    showToast.success('Logged out successfully');
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
        
        {/* Theme switch button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-text-secondary hover:text-text-main hover:bg-hover transition-colors focus:outline-none"
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          aria-label="Toggle Theme Color Scheme"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Alerts bell button */}
        <button
          onClick={() => setIsNotifDrawerOpen(true)}
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

        <div className="h-6 w-px bg-border" />

        {/* Profile avatar link dropdown */}
        <Dropdown
          align="right"
          trigger={
            <button
              className="flex items-center gap-2 focus:outline-none hover:opacity-85 transition-opacity"
              aria-label="User Account Settings Menu"
            >
              <DriverAvatar name={currentUser?.name} avatarUrl={currentUser?.avatar} size={32} />
              <div className="hidden lg:block text-left select-none">
                <p className="text-xs font-bold text-text-main leading-tight">{currentUser?.name}</p>
                <p className="text-[10px] text-text-secondary font-semibold uppercase tracking-wider mt-0.5">{currentUser?.role}</p>
              </div>
            </button>
          }
        >
          <div className="py-1">
            <div className="px-4 py-2 border-b border-border text-left">
              <p className="text-xs font-bold text-text-main">{currentUser?.name}</p>
              <p className="text-[10px] text-text-secondary font-medium">{currentUser?.email}</p>
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

            {currentUser?.role === 'Admin' && (
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
            )}

            <div className="border-t border-border mt-1" />

            <button
              onClick={handleLogoutClick}
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

      {/* Notifications Right Side Slide-over Panel */}
      <Drawer
        isOpen={isNotifDrawerOpen}
        onClose={() => setIsNotifDrawerOpen(false)}
        title="Notification Center"
        className="w-full sm:w-[380px]"
      >
        <div className="space-y-5 text-left text-xs font-semibold text-text-secondary h-full flex flex-col justify-between">
          
          {/* Header Action Controls */}
          <div className="flex justify-between items-center gap-2 border-b border-border/60 pb-3">
            <span className="text-[10px] font-black text-text-secondary uppercase">Unread Count: {unreadCount}</span>
            <div className="flex gap-2">
              <button
                onClick={handleMarkAllRead}
                disabled={unreadCount === 0}
                className="text-[10px] font-bold text-info hover:underline disabled:opacity-50 disabled:no-underline"
              >
                Mark all read
              </button>
              <span className="text-border">|</span>
              <button
                onClick={handleClearRead}
                className="text-[10px] font-bold text-text-secondary hover:text-text-main hover:underline"
              >
                Clear read
              </button>
            </div>
          </div>

          {/* Grouped Notifications List */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
            {loadingNotifs ? (
              <div className="py-20 flex flex-col items-center justify-center space-y-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-info" />
                <span className="text-[10px] text-text-secondary uppercase">Loading alerts...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-20 text-center text-text-secondary text-[11px]">
                No notifications in your inbox.
              </div>
            ) : (
              <>
                {/* 1. Unread */}
                {groupedNotifications.unread.length > 0 && (
                  <div className="space-y-2">
                    <span className="block text-[9px] uppercase font-bold text-info">Unread Alerts</span>
                    <div className="space-y-1.5">
                      {groupedNotifications.unread.map(n => (
                        <div
                          key={n.id}
                          onClick={() => handleNotificationClick(n)}
                          className="p-3 border border-info/20 rounded-xl bg-info/5 hover:bg-info/10 transition-colors cursor-pointer flex gap-3 relative"
                        >
                          <div className="h-2 w-2 bg-info rounded-full absolute top-3 right-3" />
                          <div className="flex-shrink-0 pt-0.5">
                            <AlertTriangle size={14} className="text-info" />
                          </div>
                          <div>
                            <p className="font-bold text-text-main">{n.title}</p>
                            <p className="text-[10px] text-text-secondary mt-1">{n.time} | Category: {n.type}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Today */}
                {groupedNotifications.today.length > 0 && (
                  <div className="space-y-2">
                    <span className="block text-[9px] uppercase font-bold">Today</span>
                    <div className="space-y-1.5">
                      {groupedNotifications.today.map(n => (
                        <div
                          key={n.id}
                          onClick={() => handleNotificationClick(n)}
                          className="p-3 border border-border/50 rounded-xl bg-card hover:bg-hover/30 transition-colors cursor-pointer flex gap-3"
                        >
                          <div className="flex-shrink-0 pt-0.5">
                            <Info size={14} className="text-text-secondary" />
                          </div>
                          <div>
                            <p className="font-semibold text-text-main">{n.title}</p>
                            <p className="text-[10px] text-text-secondary mt-1">{n.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Yesterday */}
                {groupedNotifications.yesterday.length > 0 && (
                  <div className="space-y-2">
                    <span className="block text-[9px] uppercase font-bold">Yesterday</span>
                    <div className="space-y-1.5">
                      {groupedNotifications.yesterday.map(n => (
                        <div
                          key={n.id}
                          onClick={() => handleNotificationClick(n)}
                          className="p-3 border border-border/50 rounded-xl bg-card hover:bg-hover/30 transition-colors cursor-pointer flex gap-3"
                        >
                          <div className="flex-shrink-0 pt-0.5">
                            <Info size={14} className="text-text-secondary" />
                          </div>
                          <div>
                            <p className="font-semibold text-text-main">{n.title}</p>
                            <p className="text-[10px] text-text-secondary mt-1">{n.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Earlier */}
                {groupedNotifications.earlier.length > 0 && (
                  <div className="space-y-2">
                    <span className="block text-[9px] uppercase font-bold">Earlier</span>
                    <div className="space-y-1.5">
                      {groupedNotifications.earlier.map(n => (
                        <div
                          key={n.id}
                          onClick={() => handleNotificationClick(n)}
                          className="p-3 border border-border/50 rounded-xl bg-card hover:bg-hover/30 transition-colors cursor-pointer flex gap-3"
                        >
                          <div className="flex-shrink-0 pt-0.5">
                            <Info size={14} className="text-text-secondary" />
                          </div>
                          <div>
                            <p className="font-semibold text-text-main">{n.title}</p>
                            <p className="text-[10px] text-text-secondary mt-1">{n.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </Drawer>
    </header>
  );
};

export default Topbar;
