import React from 'react';

/**
 * Reusable Enterprise Base Card.
 * @param {Object} props
 * @param {string} props.title - Card header title
 * @param {string} props.subtitle - Card description subtitle
 * @param {React.ReactNode} props.actions - Custom action node inside header
 */
const Card = ({
  children,
  title,
  subtitle,
  actions,
  className = '',
  bodyClassName = ''
}) => {
  return (
    <div className={`bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col transition-all hover:border-hover/50 ${className}`}>
      {(title || subtitle || actions) && (
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-hover/5">
          <div className="min-w-0">
            {title && (
              <h3 className="text-sm font-bold text-text-main leading-tight truncate">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-text-secondary mt-0.5 truncate">
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
      )}
      <div className={`px-5 py-4 flex-1 ${bodyClassName}`}>
        {children}
      </div>
    </div>
  );
};

export default Card;
export { Card };
