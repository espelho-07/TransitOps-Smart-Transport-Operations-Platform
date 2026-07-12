import React, { forwardRef } from 'react';

/**
 * Reusable Enterprise Radio Button.
 * @param {Object} props
 * @param {string} props.label - Radio label
 * @param {string} props.helperText - Description subtitle
 */
const Radio = forwardRef(({
  label,
  helperText,
  disabled = false,
  className = '',
  ...props
}, ref) => {
  return (
    <label className={`
      inline-flex items-start gap-2.5 cursor-pointer text-sm font-semibold select-none text-text-main ${className}
      ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    `}>
      <input
        ref={ref}
        type="radio"
        disabled={disabled}
        className="
          mt-0.5 rounded-full border border-border bg-card text-info focus:ring-1 focus:ring-info focus:ring-offset-background h-4 w-4 transition-all
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
  );
});

Radio.displayName = 'Radio';

export default Radio;
export { Radio };
