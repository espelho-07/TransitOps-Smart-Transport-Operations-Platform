import React from 'react';
import Card from '../Card';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

/**
 * Reusable Metric Indicator Card.
 * @param {Object} props
 * @param {string} props.label - Metric label description
 * @param {string|number} props.value - Metric numeric display
 * @param {number} props.change - Trend percentage change
 * @param {boolean} props.isPositive - Trend directions
 */
const MetricCard = ({
  label,
  value,
  change,
  isPositive = true,
  icon: Icon,
  className = ''
}) => {
  return (
    <Card className={`relative overflow-hidden ${className}`}>
      <div className="flex justify-between items-start">
        <div className="space-y-2 flex-1 min-w-0">
          <span className="block text-[10px] font-bold text-text-secondary uppercase tracking-widest truncate">
            {label}
          </span>
          <h2 className="text-3xl font-black text-text-main tracking-tight leading-none">
            {value}
          </h2>
        </div>
        {Icon && (
          <div className="p-2 bg-hover/80 border border-border/40 text-text-secondary rounded-lg flex-shrink-0">
            <Icon size={18} strokeWidth={2} />
          </div>
        )}
      </div>

      {(change !== undefined || change !== null) && (
        <div className="mt-4 flex items-center gap-1 text-xs font-bold">
          <span className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 ${
            isPositive ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger'
          }`}>
            {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {change}%
          </span>
          <span className="text-text-secondary font-medium lowercase">vs last month</span>
        </div>
      )}
    </Card>
  );
};

export default MetricCard;
export { MetricCard };
