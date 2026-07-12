import React from 'react';

/**
 * Reusable layout Divider line.
 * @param {Object} props
 * @param {'horizontal'|'vertical'} props.orientation - Alignment orientation direction
 * @param {string} props.text - Middle centered label
 */
const Divider = ({
  orientation = 'horizontal',
  text,
  className = ''
}) => {
  if (orientation === 'vertical') {
    return (
      <div className={`h-full w-px bg-border ${className}`} aria-hidden="true" />
    );
  }

  if (text) {
    return (
      <div className={`flex items-center w-full my-4 ${className}`} aria-hidden="true">
        <div className="flex-grow border-t border-border" />
        <span className="flex-shrink mx-3 text-[10px] font-bold text-text-secondary uppercase tracking-widest">
          {text}
        </span>
        <div className="flex-grow border-t border-border" />
      </div>
    );
  }

  return (
    <hr className={`w-full border-t border-border my-4 ${className}`} aria-hidden="true" />
  );
};

export default Divider;
export { Divider };
