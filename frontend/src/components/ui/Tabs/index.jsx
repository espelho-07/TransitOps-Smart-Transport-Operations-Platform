import React from 'react';
import { motion } from 'framer-motion';

/**
 * Reusable dynamic Tab triggers strip.
 * @param {Object} props
 * @param {Array<{id: string, label: string, count?: number}>} props.tabs - Tab fields mapping list
 * @param {string} props.activeTab - Active tab identifier key
 * @param {function} props.onTabChange - Triggered on selection click
 */
const Tabs = ({
  tabs = [],
  activeTab,
  onTabChange,
  className = ''
}) => {
  return (
    <div className={`flex border-b border-border w-full overflow-x-auto custom-scrollbar ${className}`}>
      <nav className="flex space-x-6 min-w-max px-1" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange && onTabChange(tab.id)}
              className={`
                relative py-3.5 text-xs font-bold whitespace-nowrap focus:outline-none transition-colors uppercase tracking-wider
                ${isActive ? 'text-info' : 'text-text-secondary hover:text-text-main'}
              `}
            >
              <div className="flex items-center gap-1.5">
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`
                    text-[10px] px-1.5 py-0.5 rounded-full font-bold
                    ${isActive ? 'bg-info/15 text-info' : 'bg-hover text-text-secondary'}
                  `}>
                    {tab.count}
                  </span>
                )}
              </div>
              
              {isActive && (
                <motion.div
                  layoutId="activeTabUnderline"
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
export { Tabs };
