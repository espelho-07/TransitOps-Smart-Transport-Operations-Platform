import React from 'react';

/**
 * Reusable Linear Progress Bar.
 * @param {Object} props
 * @param {number} props.value - Percentage value (0 to 100)
 * @param {'sm'|'md'|'lg'} props.size - Height thickness
 */
const Progress = ({
  value = 0,
  size = 'md',
  className = ''
}) => {
  const percentage = Math.min(100, Math.max(0, value));

  const sizes = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };

  return (
    <div className={`w-full bg-hover rounded-full overflow-hidden ${sizes[size] || sizes.md} ${className}`}>
      <div
        className="bg-info h-full transition-all duration-300 rounded-full"
        style={{ width: `${percentage}%` }}
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin="0"
        aria-valuemax="100"
      />
    </div>
  );
};

export default Progress;
export { Progress };
