import React from 'react';

const Card = ({
  children,
  title,
  subtitle,
  headerActions,
  className = '',
  bodyClassName = ''
}) => {
  return (
    <div className={`bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col ${className}`}>
      {(title || subtitle || headerActions) && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            {title && <h3 className="text-sm font-bold text-text-main leading-tight">{title}</h3>}
            {subtitle && <p className="text-xs text-text-secondary mt-0.5">{subtitle}</p>}
          </div>
          {headerActions && <div className="flex items-center gap-2">{headerActions}</div>}
        </div>
      )}
      <div className={`px-6 py-4 flex-1 ${bodyClassName}`}>
        {children}
      </div>
    </div>
  );
};

export default Card;
