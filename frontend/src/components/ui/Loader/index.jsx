import React from 'react';

/**
 * Reusable Spinner/Loader component.
 * @param {Object} props
 * @param {'sm'|'md'|'lg'} props.size - Dimension scales
 * @param {boolean} props.fullPage - Centers overlay on viewport
 */
const Loader = ({
  size = 'md',
  fullPage = false,
  className = ''
}) => {
  const sizes = {
    sm: 'h-4 w-4 stroke-[3px]',
    md: 'h-8 w-8 stroke-[2px]',
    lg: 'h-12 w-12 stroke-[1.5px]'
  };

  const spinner = (
    <svg
      className={`animate-spin text-info ${sizes[size] || sizes.md} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 bg-background/80 flex flex-col items-center justify-center gap-3 select-none animate-fadeIn">
        {spinner}
        <span className="text-xs font-bold text-text-secondary uppercase tracking-widest">
          Loading TransitOps...
        </span>
      </div>
    );
  }

  return spinner;
};

export default Loader;
export { Loader };
