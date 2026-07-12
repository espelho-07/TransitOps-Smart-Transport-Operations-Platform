import React from 'react';

/**
 * Reusable Enterprise Color Badge.
 * @param {Object} props
 * @param {string} props.status - Automatically formats and colors badge based on value
 * @param {'success'|'warning'|'danger'|'info'|'secondary'} props.variant - Force a semantic color style override
 */
const Badge = ({
  children,
  status = 'info',
  variant,
  className = ''
}) => {
  const getBadgeColors = (val) => {
    if (variant) {
      const styles = {
        success: 'bg-success/10 text-success border-success/35',
        warning: 'bg-warning/10 text-warning border-warning/35',
        danger: 'bg-danger/10 text-danger border-danger/35',
        info: 'bg-info/10 text-info border-info/35',
        secondary: 'bg-hover text-text-secondary border-border'
      };
      return styles[variant] || styles.info;
    }

    const normalized = val.toLowerCase().replace(/_/g, ' ');

    switch (normalized) {
      // Success
      case 'available':
      case 'completed':
      case 'approved':
      case 'active':
      case 'success':
        return 'bg-success/10 text-success border-success/35';
      
      // Warning
      case 'maintenance':
      case 'pending':
      case 'scheduled':
      case 'warning':
        return 'bg-warning/10 text-warning border-warning/35';
      
      // Danger
      case 'retired':
      case 'cancelled':
      case 'rejected':
      case 'out of service':
      case 'danger':
        return 'bg-danger/10 text-danger border-danger/35';
      
      // Info / Progress
      case 'on trip':
      case 'in progress':
      case 'routine':
      case 'preventive':
      case 'repair':
      case 'info':
      default:
        return 'bg-info/10 text-info border-info/35';
    }
  };

  return (
    <span className={`
      inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border leading-tight select-none
      ${getBadgeColors(status)}
      ${className}
    `}>
      {children || status}
    </span>
  );
};

export default Badge;
export { Badge };
