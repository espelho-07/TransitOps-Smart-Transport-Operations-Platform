import React from 'react';

/**
 * Reusable Audit Log Timeline.
 * @param {Object} props
 * @param {Array<{title: string, description: string, date: string, status?: string}>} props.items - Timeline items
 */
const Timeline = ({
  items = [],
  className = ''
}) => {
  return (
    <div className={`flow-root ${className}`}>
      <ul className="-mb-8">
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <li key={item.title + idx}>
              <div className="relative pb-8">
                {/* Connecting line */}
                {!isLast && (
                  <span
                    className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-border"
                    aria-hidden="true"
                  />
                )}
                
                <div className="relative flex space-x-3.5 items-start">
                  {/* Timeline bullet node */}
                  <div>
                    <span className="h-8 w-8 rounded-full bg-hover border border-border flex items-center justify-center text-xs font-bold text-text-secondary">
                      {idx + 1}
                    </span>
                  </div>
                  
                  {/* Item Content box */}
                  <div className="flex-1 min-w-0 pt-1.5 space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <p className="text-text-main">{item.title}</p>
                      <time className="text-[10px] text-text-secondary uppercase tracking-wider flex-shrink-0">
                        {item.date}
                      </time>
                    </div>
                    {item.description && (
                      <p className="text-xs text-text-secondary leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Timeline;
export { Timeline };
