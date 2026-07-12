import React from 'react';
import { Inbox } from 'lucide-react';
import Button from '../Button';

/**
 * Reusable EmptyState Placeholder.
 * @param {Object} props
 * @param {string} props.title - Main title heading
 * @param {string} props.description - Detailed explanation notes
 * @param {React.ComponentType} props.icon - Lucide placeholder icon
 * @param {string} props.actionText - Text on call to action button
 * @param {function} props.onActionClick - Callback click action
 */
const EmptyState = ({
  title = "No data found",
  description = "There are no records in this list yet.",
  icon: Icon = Inbox,
  actionText,
  onActionClick,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 border border-dashed border-border rounded-xl bg-card/30 ${className}`}>
      <div className="p-4 bg-hover rounded-full text-text-secondary/60 mb-4 flex items-center justify-center">
        <Icon size={32} strokeWidth={1.5} />
      </div>
      <h3 className="text-sm font-bold text-text-main leading-snug">{title}</h3>
      <p className="text-xs text-text-secondary mt-1.5 max-w-xs leading-relaxed font-medium">{description}</p>
      {actionText && onActionClick && (
        <Button
          variant="outline"
          size="sm"
          onClick={onActionClick}
          className="mt-5"
        >
          {actionText}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
export { EmptyState };
