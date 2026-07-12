import React from 'react';
import Card from '../Card';

/**
 * Reusable Information Card for metadata listings.
 * @param {Object} props
 * @param {string} props.title - Card title header
 * @param {Array<{label: string, value: string|React.ReactNode}>} props.items - Property grid list items
 */
const InfoCard = ({
  title,
  subtitle,
  items = [],
  actions,
  className = '',
  cols = 1
}) => {
  const colStyles = {
    1: 'grid-cols-1 gap-y-3.5',
    2: 'grid-cols-1 sm:grid-cols-2 gap-4',
    3: 'grid-cols-1 sm:grid-cols-3 gap-4'
  };

  return (
    <Card title={title} subtitle={subtitle} actions={actions} className={className}>
      <div className={`grid ${colStyles[cols] || colStyles[1]}`}>
        {items.map((item, idx) => (
          <div key={item.label + idx} className="space-y-1">
            <span className="block text-[10px] font-bold text-text-secondary uppercase tracking-widest">
              {item.label}
            </span>
            <div className="text-sm font-semibold text-text-main leading-snug">
              {item.value !== undefined && item.value !== null ? item.value : '-'}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default InfoCard;
export { InfoCard };
