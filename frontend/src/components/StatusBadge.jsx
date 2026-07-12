import React from 'react';

const StatusBadge = ({ status = 'info', className = '' }) => {
  const normalized = status.toLowerCase().replace(/_/g, ' ');

  const getStatusColor = (val) => {
    switch (val) {
      // Success variants
      case 'active':
      case 'completed':
      case 'approved':
      case 'success':
        return 'bg-success/10 text-success border-success/30';
      
      // Warning variants
      case 'maintenance':
      case 'scheduled':
      case 'pending':
      case 'warning':
        return 'bg-warning/10 text-warning border-warning/30';

      // Danger variants
      case 'out of service':
      case 'cancelled':
      case 'rejected':
      case 'danger':
        return 'bg-danger/10 text-danger border-danger/30';

      // Info variants
      case 'on trip':
      case 'in progress':
      case 'routine':
      case 'preventive':
      case 'repair':
      case 'info':
      default:
        return 'bg-info/10 text-info border-info/30';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(normalized)} ${className}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
