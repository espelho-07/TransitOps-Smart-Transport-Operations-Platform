import React from 'react';
import { Info, Truck, CheckCircle2, ShieldAlert, BadgeAlert } from 'lucide-react';

const NotificationItem = ({
  title,
  time,
  unread = false,
  type = 'info', // info, vehicle, trip, fuel, maintenance, license
  onClick
}) => {
  const getIcon = () => {
    switch (type) {
      case 'vehicle':
        return <Truck size={14} className="text-info" />;
      case 'trip':
        return <CheckCircle2 size={14} className="text-success" />;
      case 'fuel':
        return <Info size={14} className="text-info" />;
      case 'maintenance':
        return <CheckCircle2 size={14} className="text-success" />;
      case 'license':
        return <ShieldAlert size={14} className="text-danger" />;
      case 'info':
      default:
        return <BadgeAlert size={14} className="text-warning" />;
    }
  };

  return (
    <div
      onClick={onClick}
      className={`
        px-4 py-3 flex gap-3 cursor-pointer transition-colors border-b border-border/40 last:border-0 hover:bg-hover/40
        ${unread ? 'bg-info/5' : ''}
      `}
    >
      <div className="flex-shrink-0 mt-0.5">
        <div className={`p-1.5 rounded-lg bg-hover/80 flex items-center justify-center`}>
          {getIcon()}
        </div>
      </div>
      
      <div className="space-y-0.5 flex-1 min-w-0">
        <p className={`text-xs text-text-main leading-tight truncate ${unread ? 'font-bold' : 'font-semibold'}`}>
          {title}
        </p>
        <span className="text-[10px] text-text-secondary font-medium block">
          {time}
        </span>
      </div>

      {unread && (
        <div className="flex-shrink-0 self-center">
          <div className="h-1.5 w-1.5 rounded-full bg-info" />
        </div>
      )}
    </div>
  );
};

export default NotificationItem;
