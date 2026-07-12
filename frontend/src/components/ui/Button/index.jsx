import React from 'react';
import { motion } from 'framer-motion';

/**
 * Reusable Enterprise Button Component.
 * @param {Object} props
 * @param {'primary'|'secondary'|'outline'|'ghost'|'danger'|'success'|'warning'|'info'|'dark'|'light'} props.variant - Button color style
 * @param {'sm'|'md'|'lg'} props.size - Button height/padding sizes
 * @param {boolean} props.isLoading - If true, displays a spinning loader and disables click
 * @param {boolean} props.disabled - Standard HTML disabled attribute
 * @param {React.ComponentType} props.leftIcon - Lucide-react icon component on the left side
 * @param {React.ComponentType} props.rightIcon - Lucide-react icon component on the right side
 */
const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  className = '',
  ...props
}) => {
  const baseStyle = "inline-flex items-center justify-center font-semibold rounded-lg transition-all focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-info disabled:opacity-50 disabled:cursor-not-allowed select-none";

  const variants = {
    primary: "bg-info hover:bg-opacity-90 text-white border border-transparent focus:ring-offset-background",
    secondary: "bg-hover hover:bg-opacity-80 text-text-main border border-border focus:ring-offset-background",
    outline: "bg-transparent hover:bg-hover text-text-main border border-border focus:ring-offset-background",
    ghost: "bg-transparent hover:bg-hover text-text-main border border-transparent focus:ring-offset-background",
    danger: "bg-danger hover:bg-opacity-90 text-white border border-transparent focus:ring-danger focus:ring-offset-background",
    success: "bg-success hover:bg-opacity-90 text-white border border-transparent focus:ring-success focus:ring-offset-background",
    warning: "bg-warning hover:bg-opacity-90 text-white border border-transparent focus:ring-warning focus:ring-offset-background",
    info: "bg-info hover:bg-opacity-90 text-white border border-transparent focus:ring-info focus:ring-offset-background",
    dark: "bg-[#18181B] hover:bg-[#232326] text-white border border-[#2E2E34] focus:ring-offset-background",
    light: "bg-white hover:bg-gray-100 text-[#09090B] border border-gray-200 focus:ring-offset-background"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs gap-1.5 rounded-[8px]",
    md: "px-4 py-2 text-sm gap-2 rounded-[10px]",
    lg: "px-5 py-2.5 text-base gap-2.5 rounded-[12px]"
  };

  return (
    <motion.button
      whileTap={!disabled && !isLoading ? { scale: 0.98 } : {}}
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : LeftIcon ? (
        <LeftIcon size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} className="flex-shrink-0" />
      ) : null}
      
      <span>{children}</span>

      {!isLoading && RightIcon && (
        <RightIcon size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} className="flex-shrink-0" />
      )}
    </motion.button>
  );
};

export default Button;
export { Button };
