import React from 'react';
import { X } from 'lucide-react';

/**
 * Reusable Chip Tag Component.
 * @param {Object} props
 * @param {string} props.label - Chip text display
 * @param {React.ComponentType} props.icon - Leading icon
 * @param {function} props.onDelete - Optional trailing X delete handler
 */
const Chip = ({
  label,
  icon: Icon,
  onDelete,
  className = '',
  disabled = false
}) => {
  return (
    <span className={`
      inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold select-none border border-border bg-hover text-text-main
      ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      ${className}
    `}>
      {Icon && <Icon size={12} className="text-text-secondary" />}
      <span>{label}</span>
      {onDelete && !disabled && (
        <button
          type="button"
          onClick={onDelete}
          className="hover:text-danger hover:bg-hover p-0.5 rounded-full transition-colors flex items-center justify-center focus:outline-none"
        >
          <X size={10} />
        </button>
      )}
    </span>
  );
};

export default Chip;
export { Chip };
