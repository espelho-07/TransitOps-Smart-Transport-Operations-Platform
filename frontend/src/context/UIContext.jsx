import React, { createContext, useContext, useState } from 'react';

const UIContext = createContext();

export const UIProvider = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('transitops_sidebar_collapsed');
    return saved ? JSON.parse(saved) : false;
  });
  
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('transitops_sidebar_collapsed', JSON.stringify(next));
      return next;
    });
  };

  const toggleMobileDrawer = () => {
    setIsMobileDrawerOpen((prev) => !prev);
  };

  return (
    <UIContext.Provider
      value={{
        isSidebarCollapsed,
        isMobileDrawerOpen,
        toggleSidebarCollapse,
        toggleMobileDrawer,
        setIsMobileDrawerOpen
      }}
    >
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};
