import React from 'react';

/**
 * Reusable Form Wrapper and Form Field component.
 * @param {Object} props
 * @param {function} props.onSubmit - Submit handler callback
 */
const Form = ({
  children,
  onSubmit,
  className = '',
  ...props
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit && onSubmit(e);
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`} {...props}>
      {children}
    </form>
  );
};

export const FormField = ({ children, className = '' }) => (
  <div className={`space-y-1 ${className}`}>
    {children}
  </div>
);

export const FormGrid = ({ children, className = '', cols = 2 }) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2 gap-4',
    3: 'grid-cols-1 md:grid-cols-3 gap-4',
    4: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4'
  };

  return (
    <div className={`grid ${gridCols[cols] || gridCols[2]} ${className}`}>
      {children}
    </div>
  );
};

export default Form;
export { Form };
