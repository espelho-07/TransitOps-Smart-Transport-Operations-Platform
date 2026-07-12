import React, { forwardRef } from 'react';

/**
 * Reusable Enterprise Textarea.
 * @param {Object} props
 * @param {string} props.label - Textarea title label
 * @param {string} props.error - Error details
 * @param {string} props.helperText - Description notes
 * @param {number} props.rows - Rows height count
 */
const Textarea = forwardRef(({
  label,
  error,
  helperText,
  rows = 4,
  placeholder = '',
  className = '',
  disabled = false,
  required = false,
  ...props
}, ref) => {
  const getBorderColor = () => {
    if (error) return 'border-danger focus:ring-danger focus:border-danger';
    return 'border-border focus:ring-info focus:border-info';
  };

  return (
    <div className={`w-full space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}

      <textarea
        ref={ref}
        rows={rows}
        disabled={disabled}
        placeholder={placeholder}
        className={`
          block w-full rounded-lg border text-sm transition-all focus:outline-none focus:ring-1 px-3 py-2
          bg-card text-text-main placeholder:text-text-secondary/40
          disabled:bg-hover disabled:cursor-not-allowed
          ${getBorderColor()}
        `}
        {...props}
      />

      {error && (
        <p className="text-xs text-danger font-medium animate-fadeIn">{error}</p>
      )}
      {!error && helperText && (
        <p className="text-xs text-text-secondary">{helperText}</p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Textarea;
export { Textarea };
