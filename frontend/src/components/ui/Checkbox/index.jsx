import React, { forwardRef } from 'react';

/**
 * Reusable Enterprise Checkbox Component.
 * @param {Object} props
 * @param {string} props.label - Checkbox label text
 * @param {string} props.helperText - Description notes
 * @param {string} props.error - Error detail message
 */
const Checkbox = forwardRef(({
  label,
  helperText,
  error,
  disabled = false,
  className = '',
  ...props
}, ref) => {
  return (
    <div className={`space-y-1 ${className}`}>
      <label className={`
        inline-flex items-start gap-2.5 cursor-pointer text-sm font-semibold select-none text-text-main
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}>
        <input
          ref={ref}
          type="checkbox"
          disabled={disabled}
          className="
            mt-0.5 rounded border border-border bg-card text-info focus:ring-1 focus:ring-info focus:ring-offset-background h-4 w-4 transition-all
            disabled:bg-hover disabled:cursor-not-allowed
          "
          {...props}
        />
        <div className="flex flex-col">
          <span>{label}</span>
          {helperText && (
            <span className="text-xs text-text-secondary font-normal mt-0.5">{helperText}</span>
          )}
        </div>
      </label>
      
      {error && (
        <p className="text-xs text-danger font-medium animate-fadeIn pl-7">{error}</p>
      )}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';

export default Checkbox;
export { Checkbox };
