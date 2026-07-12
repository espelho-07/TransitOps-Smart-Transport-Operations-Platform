import React from 'react';

/**
 * Reusable Section Header.
 * @param {Object} props
 * @param {string} props.title - Section title
 * @param {string} props.subtitle - Section description notes
 * @param {React.ReactNode} props.actions - Actions layout slot
 */
const SectionHeader = ({
  title,
  subtitle,
  actions,
  className = ''
}) => {
  return (
    <div className={`flex items-start justify-between pb-2 border-b border-border/60 mb-4 ${className}`}>
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
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
};

export default SectionHeader;
export { SectionHeader };
