import React, { forwardRef } from 'react';

const Select = forwardRef(({
  label,
  error,
  options = [],
  placeholder = 'Select an option',
  className = '',
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
        <select
          ref={ref}
          className={`
            block w-full rounded-lg border text-sm transition-all focus:outline-none focus:ring-1 pr-10 pl-3 py-2
            bg-card text-text-main border-border appearance-none
            focus:ring-info focus:border-info
            disabled:bg-hover disabled:cursor-not-allowed
            ${error ? 'border-danger focus:ring-danger focus:border-danger' : ''}
          `}
          {...props}
        >
          {placeholder && <option value="" disabled>{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-text-secondary">
          <svg className="h-4 w-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>
      {error && (
        <p className="text-xs text-danger font-medium animate-fadeIn">{error}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
