import React from 'react';

const Avatar = ({
  src,
  initials = '',
  status, // active, on-trip, inactive, busy
  size = 'md', // sm, md, lg
  className = ''
}) => {
  const sizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base'
  };

  const statusColors = {
    active: 'bg-success',
    'on-trip': 'bg-info',
    inactive: 'bg-text-secondary',
    busy: 'bg-warning'
  };

  return (
    <div className="relative inline-block flex-shrink-0">
      <div className={`
        flex items-center justify-center rounded-full font-semibold overflow-hidden border border-border
        bg-hover text-text-main select-none ${sizes[size]} ${className}
      `}>
        {src ? (
          <img src={src} alt="Avatar" className="h-full w-full object-cover" />
        ) : (
          <span>{initials}</span>
        )}
      </div>

      {status && (
        <span className={`
          absolute bottom-0 right-0 block rounded-full ring-2 ring-card
          ${status === 'active' || status === 'on-trip' ? 'h-2.5 w-2.5' : 'h-2 w-2'}
          ${statusColors[status] || 'bg-text-secondary'}
        `} />
      )}
    </div>
  );
};

export default Avatar;
