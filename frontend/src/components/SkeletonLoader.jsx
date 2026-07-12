import React from 'react';

const SkeletonLoader = ({
  variant = 'text', // text, circle, rectangle, card, table
  count = 1,
  className = ''
}) => {
  const baseStyle = 'animate-pulse bg-border rounded-md';

  const variants = {
    text: 'h-4 w-full mb-2 last:w-5/6',
    circle: 'rounded-full',
    rectangle: 'h-24 w-full',
    card: 'h-32 w-full p-4 border border-border bg-card/50 flex flex-col justify-between',
    table: 'h-10 w-full mb-1.5'
  };

  const renderSingle = (key) => {
    if (variant === 'card') {
      return (
        <div key={key} className={`${variants.card} ${className}`}>
          <div className="space-y-2">
            <div className="h-4 w-1/3 bg-border rounded" />
            <div className="h-6 w-2/3 bg-border rounded" />
          </div>
          <div className="h-3 w-1/4 bg-border rounded" />
        </div>
      );
    }

    if (variant === 'table') {
      return (
        <div key={key} className="flex gap-4 items-center py-3.5 border-b border-border last:border-0">
          <div className="h-4 w-8 bg-border rounded" />
          <div className="h-4 w-1/4 bg-border rounded" />
          <div className="h-4 w-1/3 bg-border rounded" />
          <div className="h-4 w-1/6 bg-border rounded" />
          <div className="h-4 w-12 bg-border rounded ml-auto" />
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

export default SkeletonLoader;
