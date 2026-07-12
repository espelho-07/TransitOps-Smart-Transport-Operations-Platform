import React from 'react';

const PageContainer = ({
  children,
  maxWidth = '7xl', // sm, md, lg, xl, 4xl, 5xl, 7xl, full
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
    <div className={`mx-auto w-full ${widths[maxWidth]} px-2 sm:px-4 lg:px-6 py-2 animate-fadeIn ${className}`}>
      {children}
    </div>
  );
};

export default PageContainer;
