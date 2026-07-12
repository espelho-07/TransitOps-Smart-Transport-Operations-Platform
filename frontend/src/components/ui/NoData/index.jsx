import React from 'react';
import { DatabaseBackup } from 'lucide-react';

/**
 * Compact Inline Empty State Widget.
 * @param {Object} props
 * @param {string} props.message - Descriptive text label
 */
const NoData = ({
  message = 'No records available',
  icon: Icon = DatabaseBackup,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-6 text-center select-none ${className}`}>
      <div className="text-text-secondary/35 mb-2 flex items-center justify-center">
        <Icon size={20} strokeWidth={1.5} />
      </div>
      <p className="text-[11px] font-bold text-text-secondary uppercase tracking-widest leading-none">
        {message}
      </p>
    </div>
  );
};

export default NoData;
export { NoData };
