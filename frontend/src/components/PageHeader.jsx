import React from 'react';

const PageHeader = ({
  title,
  subtitle,
  actions,
  className = ''
}) => {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-border mb-6 ${className}`}>
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-text-main leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs sm:text-sm text-text-secondary">
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2.5 sm:justify-end">
          {actions}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
