import React from 'react';

const SectionHeader = ({
  title,
  subtitle,
  actions,
  className = ''
}) => {
  return (
    <div className={`flex items-start justify-between pb-3 border-b border-border mb-4 ${className}`}>
      <div className="space-y-0.5">
        <h4 className="text-sm font-bold text-text-main leading-tight">
          {title}
        </h4>
        {subtitle && (
          <p className="text-xs text-text-secondary">
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
};

export default SectionHeader;
