import React from 'react';
import { motion } from 'framer-motion';

/**
 * Reusable Switch Toggle Component.
 * @param {Object} props
 * @param {boolean} props.checked - Active toggle state
 * @param {function} props.onChange - Toggle change handler
 * @param {string} props.label - Toggle title label
 * @param {string} props.helperText - Description notes
 */
const Switch = ({
  checked = false,
  onChange,
  label,
  helperText,
  disabled = false,
  className = '',
  ...props
}) => {
  const handleToggle = () => {
    if (!disabled && onChange) {
      onChange(!checked);
    }
  };

  return (
    <label className={`
      inline-flex items-start gap-3 cursor-pointer text-sm font-semibold select-none text-text-main ${className}
      ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    `}>
      {/* Switch track overlay */}
      <div
        onClick={handleToggle}
        className={`
          relative w-9 h-5 rounded-full p-0.5 transition-colors duration-200 mt-0.5 flex items-center
          ${checked ? 'bg-info' : 'bg-hover border border-border'}
          ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
        `}
        {...props}
      >
        {/* Switch thumb bubble */}
        <motion.div
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className={`h-4 w-4 rounded-full shadow-sm bg-white`}
          style={{ x: checked ? 14 : 0 }}
        />
      </div>

      {(label || helperText) && (
        <div className="flex flex-col" onClick={handleToggle}>
          {label && <span>{label}</span>}
          {helperText && (
            <span className="text-xs text-text-secondary font-normal mt-0.5">{helperText}</span>
          )}
        </div>
      )}
    </label>
  );
};

export default Switch;
export { Switch };
