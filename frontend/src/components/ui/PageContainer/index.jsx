import React from 'react';

/**
 * Reusable Container for limiting page layout bounds.
 * @param {Object} props
 * @param {'sm'|'md'|'lg'|'xl'|'4xl'|'5xl'|'7xl'|'full'} props.maxWidth - Container width sizes
 */
const PageContainer = ({
  children,
  maxWidth = '7xl',
  className = ''
}) => {
  const widths = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full'
  };

  return (
    <div className={`mx-auto w-full ${widths[maxWidth]} px-4 sm:px-6 lg:px-8 py-4 animate-fadeIn ${className}`}>
      {children}
    </div>
  );
};

export default PageContainer;
export { PageContainer };
