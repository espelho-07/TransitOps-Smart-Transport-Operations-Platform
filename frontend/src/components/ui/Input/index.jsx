import React, { forwardRef, useState } from 'react';
import { Eye, EyeOff, Search } from 'lucide-react';

/**
 * Reusable Enterprise Form Input.
 * @param {Object} props
 * @param {string} props.label - Floating or standard label text
 * @param {boolean} props.floating - If true, translates the label as a floating label inside input
 * @param {string} props.error - Error detail message (renders red validation borders)
 * @param {boolean} props.success - Success status (renders green borders)
 * @param {string} props.helperText - Subtitle description label
 * @param {boolean} props.isSearch - Renders magnifying glass search icon inside input
 * @param {boolean} props.isCurrency - Renders a dollar prefix icon inside input
 * @param {React.ComponentType} props.icon - Leading Lucide icon element
 */
const Input = forwardRef(({
  label,
  floating = false,
  error,
  success,
  helperText,
  type = 'text',
  placeholder = '',
  className = '',
  disabled = false,
  isSearch = false,
  isCurrency = false,
  icon: Icon,
  required = false,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const isPassword = type === 'password';
  const actualType = isPassword ? (showPassword ? 'text' : 'password') : type;

  const getBorderColor = () => {
    if (error) return 'border-danger focus:ring-danger focus:border-danger';
    if (success) return 'border-success focus:ring-success focus:border-success';
    return 'border-border focus:ring-info focus:border-info';
  };

  return (
    <div className={`w-full space-y-1.5 ${className}`}>
      {/* Standard non-floating Label */}
      {label && !floating && (
        <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}

      <div className="relative rounded-lg shadow-sm">
        {/* Floating Label overlay */}
        {label && floating && (
          <label className={`
            absolute left-3 top-2.5 z-10 origin-[0] -translate-y-4 scale-75 transform text-xs font-semibold uppercase tracking-wider text-text-secondary transition-all
            peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-4 peer-focus:scale-75
          `}>
            {label} {required && <span className="text-danger">*</span>}
          </label>
        )}

        {/* Leading search icon */}
        {isSearch && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-secondary/50">
            <Search size={16} />
          </div>
        )}

        {/* Leading currency prefix */}
        {isCurrency && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-secondary/60 text-sm font-semibold select-none">
            $
          </div>
        )}

        {/* General leading custom icon */}
        {!isSearch && !isCurrency && Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-secondary/50">
            <Icon size={16} />
          </div>
        )}

        <input
          ref={ref}
          type={actualType}
          disabled={disabled}
          placeholder={placeholder}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
            block w-full rounded-lg border text-sm transition-all focus:outline-none focus:ring-1 py-2 bg-card text-text-main
            ${isSearch || isCurrency || Icon ? 'pl-10' : 'pl-3'}
            ${isPassword ? 'pr-10' : 'pr-3'}
            ${getBorderColor()}
            placeholder:text-text-secondary/40
            disabled:bg-hover disabled:cursor-not-allowed
          `}
          {...props}
        />

        {/* Password toggle icon */}
        {isPassword && !disabled && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-secondary/60 hover:text-text-main transition-colors"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>

      {/* Helper & validation text alerts */}
      {error && (
        <p className="text-xs text-danger font-medium animate-fadeIn">{error}</p>
      )}
      {!error && helperText && (
        <p className="text-xs text-text-secondary">{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
export { Input };
