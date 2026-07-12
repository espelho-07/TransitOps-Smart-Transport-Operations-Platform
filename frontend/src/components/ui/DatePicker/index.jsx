import React, { forwardRef } from 'react';
import { Calendar } from 'lucide-react';

/**
 * Reusable DatePicker Input wrapper.
 * @param {Object} props
 * @param {string} props.label - DatePicker label text
 * @param {string} props.error - Validation error text
 */
const DatePicker = forwardRef(({
  label,
  error,
  helperText,
  className = '',
  disabled = false,
  required = false,
  ...props
}, ref) => {
  return (
    <div className={`w-full space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}

      <div className="relative rounded-lg shadow-sm">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-secondary/50">
          <Calendar size={15} />
        </div>
        <input
          ref={ref}
          type="date"
          disabled={disabled}
          className={`
            block w-full rounded-lg border text-sm transition-all focus:outline-none focus:ring-1 pl-10 pr-3 py-2
            bg-card text-text-main
            disabled:bg-hover disabled:cursor-not-allowed
            ${error ? 'border-danger focus:ring-danger focus:border-danger' : 'border-border focus:ring-info focus:border-info'}
          `}
          {...props}
        />
      </div>

      {error && (
        <p className="text-xs text-danger font-medium animate-fadeIn">{error}</p>
      )}
      {!error && helperText && (
        <p className="text-xs text-text-secondary">{helperText}</p>
      )}
    </div>
  );
});

DatePicker.displayName = 'DatePicker';

export default DatePicker;
export { DatePicker };
