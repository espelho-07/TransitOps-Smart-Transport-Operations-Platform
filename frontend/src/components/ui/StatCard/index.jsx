import React from 'react';
import Card from '../Card';
import { TrendingUp, TrendingDown } from 'lucide-react';

/**
 * Enterprise StatCard with SVG Sparkline Chart.
 * @param {Object} props
 * @param {string} props.title - Card title
 * @param {string|number} props.value - Primary stat value
 * @param {string|number} props.change - Trend percentage change
 * @param {boolean} props.isPositive - Trend direction
 * @param {Array<number>} props.sparklineData - Array of numbers to draw sparkline path
 */
const StatCard = ({
  title,
  value,
  change,
  isPositive = true,
  icon: Icon,
  sparklineData = [10, 15, 8, 22, 19, 32, 28],
  className = ''
}) => {
  // SVG Sparkline path builder
  const getSparklinePath = (points) => {
    if (!points || points.length === 0) return '';
    const width = 100;
    const height = 30;
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min === 0 ? 1 : max - min;
    
    return points
      .map((p, idx) => {
        const x = (idx / (points.length - 1)) * width;
        const y = height - ((p - min) / range) * height;
        return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  };

  return (
    <Card className={`relative overflow-hidden ${className}`}>
      <div className="flex justify-between items-start">
        <div className="space-y-1.5 flex-1 min-w-0">
          <span className="block text-[10px] font-bold text-text-secondary uppercase tracking-widest truncate">
            {title}
          </span>
          <h3 className="text-2xl font-black text-text-main tracking-tight leading-none">
            {value}
          </h3>
        </div>
        {Icon && (
          <div className="p-2 bg-hover/80 border border-border/40 text-text-secondary rounded-lg flex-shrink-0">
            <Icon size={16} strokeWidth={2} />
          </div>
        )}
      </div>

      <div className="mt-5 flex items-end justify-between">
        {/* Trend Indicator */}
        {change !== undefined && (
          <div className="flex flex-col gap-0.5">
            <span className={`inline-flex items-center gap-0.5 text-xs font-bold ${
              isPositive ? 'text-success' : 'text-danger'
            }`}>
              {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {isPositive ? '+' : ''}{change}%
            </span>
            <span className="text-[10px] text-text-secondary font-semibold uppercase tracking-wider lowercase select-none">
              this week
            </span>
          </div>
        )}

        {/* Dynamic Sparkline chart */}
        {sparklineData && sparklineData.length > 0 && (
          <div className="w-24 h-8" aria-hidden="true">
            <svg viewBox="0 0 100 30" className="w-full h-full overflow-visible">
              <path
                d={getSparklinePath(sparklineData)}
                fill="none"
                stroke={isPositive ? 'var(--success)' : 'var(--danger)'}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}
      </div>
    </Card>
  );
};

export default StatCard;
export { StatCard };
