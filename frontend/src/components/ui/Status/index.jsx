import React from 'react';

/**
 * Reusable Status label with leading indicator dot.
 * @param {Object} props
 * @param {string} props.status - Status text label (e.g. Available, Maintenance, Pending)
 */
const Status = ({
  status = 'info',
  className = ''
}) => {
  const normalized = status.toLowerCase().replace(/_/g, ' ');

  const getStatusColor = (val) => {
    switch (val) {
      case 'available':
      case 'completed':
      case 'approved':
      case 'active':
      case 'success':
        return 'bg-success';
      
      case 'maintenance':
      case 'pending':
      case 'scheduled':
      case 'warning':
        return 'bg-warning';
      
      case 'retired':
      case 'cancelled':
      case 'rejected':
      case 'out of service':
      case 'danger':
        return 'bg-danger';
      
      case 'on trip':
      case 'in progress':
      case 'routine':
      case 'preventive':
      case 'repair':
      case 'info':
      default:
        return 'bg-info';
    }
  };

  return (
    <div className={`inline-flex items-center gap-2 text-sm font-semibold text-text-main ${className}`}>
      <span className={`h-2 w-2 rounded-full flex-shrink-0 ${getStatusColor(normalized)}`} />
      <span className="capitalize">{status}</span>
    </div>
  );
};

export default Status;
export { Status };
