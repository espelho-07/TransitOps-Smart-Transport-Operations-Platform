import React, { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  error,
  type = 'text',
  placeholder = '',
  className = '',
  icon: Icon,
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
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-secondary">
            <Icon size={16} />
          </div>
        )}
        <input
          ref={ref}
          type={type}
          placeholder={placeholder}
          className={`
            block w-full rounded-lg border text-sm transition-all focus:outline-none focus:ring-1
            ${Icon ? 'pl-10' : 'pl-3'} pr-3 py-2
            bg-card text-text-main border-border
            focus:ring-info focus:border-info
            placeholder:text-text-secondary/50
            disabled:bg-hover disabled:cursor-not-allowed
            ${error ? 'border-danger focus:ring-danger focus:border-danger' : ''}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="text-xs text-danger font-medium animate-fadeIn">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
