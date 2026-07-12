import React, { useState } from 'react';
import { 
  FileText, 
  History, 
  Layers, 
  Clock, 
  FileCheck, 
  ArrowLeft 
} from 'lucide-react';
import Button from './Button';

/**
 * Reusable Entity Detail Layout for Vehicle, Driver, Trip, Fuel, Maintenance, Expense details.
 * @param {Object} props
 * @param {string} props.title - Entity ID or Name header
 * @param {string} props.subtitle - Details helper text
 * @param {string} props.imageUrl - Image link (vehicle image or driver avatar)
 * @param {React.ReactNode} props.statusBadge - Status badge component
 * @param {React.ReactNode} props.quickActions - Buttons for actions (Edit, Delete, Status change)
 * @param {Array} props.tabs - Tabs definition array: [{ id: 'overview', label: 'Overview', content: ... }]
 * @param {function} props.onBack - Back action callback
 */
const EntityDetailLayout = ({
  title,
  subtitle,
  imageUrl,
  statusBadge,
  quickActions,
  tabs = [],
  onBack
}) => {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id || 'overview');

  const activeTabContent = tabs.find(tab => tab.id === activeTab)?.content;

  return (
    <div className="space-y-6 text-left select-none">
      
      {/* Back Button */}
      {onBack && (
        <button 
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold text-text-secondary hover:text-text-main transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Registry</span>
        </button>
      )}

      {/* Header Banner Section */}
      <div className="bg-card border border-border rounded-2xl p-5 md:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          
          {/* Entity Image */}
          {imageUrl ? (
            <div className="h-16 w-16 md:h-20 md:w-20 rounded-xl overflow-hidden bg-hover border border-border flex-shrink-0">
              <img 
                src={imageUrl} 
                alt={title} 
                className="w-full h-full object-cover" 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&w=100&h=100&q=80';
                }}
              />
            </div>
          ) : (
            <div className="h-16 w-16 md:h-20 md:w-20 rounded-xl bg-hover border border-border flex items-center justify-center flex-shrink-0 text-text-secondary">
              <FileCheck size={28} />
            </div>
          )}

          {/* Titles & Status */}
          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-lg md:text-xl font-black text-text-main leading-tight">{title}</h2>
              {statusBadge}
            </div>
            {subtitle && <p className="text-xs text-text-secondary font-semibold">{subtitle}</p>}
          </div>

        </div>

        {/* Quick Actions Panel */}
        {quickActions && (
          <div className="flex flex-wrap gap-2.5 w-full md:w-auto">
            {quickActions}
          </div>
        )}
      </div>

      {/* Tabs Menu Navigation */}
      <div className="border-b border-border flex items-center gap-1 overflow-x-auto custom-scrollbar pb-px">
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4.5 py-3 border-b-2 text-xs font-bold transition-all whitespace-nowrap -mb-px flex items-center gap-1.5 ${
                isActive 
                  ? 'border-info text-info font-black' 
                  : 'border-transparent text-text-secondary hover:text-text-main hover:border-border/60'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Body Content */}
      <div className="bg-card border border-border rounded-2xl p-5 md:p-6 shadow-sm min-h-[300px]">
        {activeTabContent || (
          <div className="py-20 text-center text-text-secondary text-xs">
            No details recorded under this tab.
          </div>
        )}
      </div>

    </div>
  );
};

export default EntityDetailLayout;
export { EntityDetailLayout };
