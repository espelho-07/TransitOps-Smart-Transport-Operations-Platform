import React from 'react';
import { motion } from 'framer-motion';

const Tabs = ({
  tabs = [], // { id: 'all', label: 'All', count: 12 }
  activeTab,
  onTabChange,
  className = ''
}) => {
  return (
    <div className={`flex border-b border-border w-full overflow-x-auto ${className}`}>
      <nav className="flex space-x-6 min-w-max px-2" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                relative py-3.5 text-sm font-semibold whitespace-nowrap focus:outline-none transition-colors
                ${isActive ? 'text-info' : 'text-text-secondary hover:text-text-main'}
              `}
            >
              <div className="flex items-center gap-2">
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`
                    text-xs px-2 py-0.5 rounded-full font-bold
                    ${isActive ? 'bg-info/15 text-info' : 'bg-hover text-text-secondary'}
                  `}>
                    {tab.count}
                  </span>
                )}
              </div>
              
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-info"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Tabs;
