import React from 'react';
import Card from '../Card';
import Button from '../Button';
import { ArrowRight } from 'lucide-react';

/**
 * Reusable Action Shortcut Card.
 * @param {Object} props
 * @param {string} props.title - Action title
 * @param {string} props.description - Action subtitle explanation
 * @param {string} props.buttonText - Text label on shortcut trigger
 * @param {React.ComponentType} props.icon - Action icon
 */
const QuickActionCard = ({
  title,
  description,
  buttonText = 'Execute Action',
  onClick,
  icon: Icon,
  variant = 'primary', // primary, secondary, danger, outline
  className = ''
}) => {
  return (
    <Card className={`group hover:border-info/40 transition-all duration-200 ${className}`}>
      <div className="flex gap-4 items-start">
        {Icon && (
          <div className="p-3 bg-hover group-hover:bg-info/10 group-hover:text-info rounded-xl text-text-secondary transition-colors flex-shrink-0">
            <Icon size={20} strokeWidth={2} />
          </div>
        )}
        <div className="space-y-1.5 flex-1 min-w-0">
          <h4 className="text-sm font-bold text-text-main group-hover:text-info transition-colors truncate">
            {title}
          </h4>
          <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">
            {description}
          </p>
          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onClick}
              rightIcon={ArrowRight}
              className="text-xs"
            >
              {buttonText}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default QuickActionCard;
export { QuickActionCard };
