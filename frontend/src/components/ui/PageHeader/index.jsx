import React from 'react';

/**
 * Reusable Page Title and Action Header.
 * @param {Object} props
 * @param {string} props.title - Primary title
 * @param {string} props.subtitle - Page subtitle description
 * @param {React.ReactNode} props.actions - Actions layout slot
 */
const PageHeader = ({
  title,
  subtitle,
  actions,
  className = ''
}) => {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border mb-5 ${className}`}>
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-text-main leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs sm:text-sm text-text-secondary font-medium">
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2 sm:justify-end flex-shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
export { PageHeader };
