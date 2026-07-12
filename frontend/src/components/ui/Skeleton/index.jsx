import React from 'react';

/**
 * Reusable layout Shimmer Loaders.
 * @param {Object} props
 * @param {'text'|'circle'|'rectangle'|'card'|'table'|'profile'|'dashboard'} props.variant - Loader styles
 * @param {number} props.count - Number of items
 */
const Skeleton = ({
  variant = 'text',
  count = 1,
  className = ''
}) => {
  const baseStyle = 'animate-pulse bg-border rounded-md';

  const variants = {
    text: 'h-4 w-full mb-2 last:w-4/5',
    circle: 'rounded-full h-10 w-10',
    rectangle: 'h-24 w-full',
    card: 'h-28 w-full p-4 border border-border bg-card/45 flex flex-col justify-between rounded-xl',
    table: 'h-10 w-full mb-1.5'
  };

  const renderSingle = (key) => {
    if (variant === 'card') {
      return (
        <div key={key} className={`${variants.card} ${className}`}>
          <div className="space-y-2">
            <div className="h-3 w-1/3 bg-border rounded" />
            <div className="h-5 w-2/3 bg-border rounded" />
          </div>
          <div className="h-3.5 w-1/4 bg-border rounded" />
        </div>
      );
    }

    if (variant === 'table') {
      return (
        <div key={key} className="flex gap-4 items-center py-3.5 border-b border-border last:border-0">
          <div className="h-4 w-6 bg-border rounded" />
          <div className="h-4 w-1/4 bg-border rounded" />
          <div className="h-4 w-1/3 bg-border rounded" />
          <div className="h-4 w-1/6 bg-border rounded" />
          <div className="h-4 w-10 bg-border rounded ml-auto" />
        </div>
      );
    }

    if (variant === 'profile') {
      return (
        <div key={key} className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-border rounded-full animate-pulse" />
            <div className="space-y-2 flex-1">
              <div className="h-4 w-1/4 bg-border rounded animate-pulse" />
              <div className="h-3 w-1/3 bg-border rounded animate-pulse" />
            </div>
          </div>
          <div className="h-px bg-border" />
          <div className="space-y-4">
            <div className="h-12 w-full bg-border rounded animate-pulse" />
            <div className="h-12 w-full bg-border rounded animate-pulse" />
          </div>
        </div>
      );
    }

    if (variant === 'dashboard') {
      return (
        <div key={key} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-border rounded-xl animate-pulse" />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-64 bg-border rounded-xl col-span-2 animate-pulse" />
            <div className="h-64 bg-border rounded-xl animate-pulse" />
          </div>
        </div>
      );
    }

    return (
      <div
        key={key}
        className={`${baseStyle} ${variants[variant]} ${className}`}
      />
    );
  };

  return (
    <div className="w-full">
      {Array.from({ length: count }).map((_, idx) => renderSingle(idx))}
    </div>
  );
};

export default Skeleton;
export { Skeleton };
