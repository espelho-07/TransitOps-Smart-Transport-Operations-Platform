import React, { useMemo } from 'react';
import {
  FileText,
  Compass,
  Wrench,
  Fuel,
  DollarSign,
  User,
  Image as ImageIcon,
  CheckCircle,
  Plus
} from 'lucide-react';

/**
 * Vertical Timeline Component displaying vehicle lifecycle events
 * Milestones: Registered, Driver Changed, Trip Assigned/Completed, Maintenance Started/Completed, Fuel, Expense, Image Updated.
 */
const VehicleHistory = ({ vehicle }) => {
  const historyEvents = useMemo(() => {
    if (!vehicle) return [];

    const events = [];
    const purchaseDate = vehicle.purchaseDate || '2024-01-01';

    // 1. Vehicle Registered (Always first milestone)
    events.push({
      id: 'evt-reg',
      title: 'Vehicle Registered',
      desc: `Asset added to ERP registry by admin. Plate: ${vehicle.plateNumber}, VIN: ${vehicle.vin || 'N/A'}.`,
      date: purchaseDate,
      icon: Plus,
      color: 'text-success bg-success/15 border-success/30'
    });

    // 2. Driver Assigned (If driver exists)
    if (vehicle.assignedDriverId) {
      events.push({
        id: 'evt-driver',
        title: 'Driver Assigned',
        desc: `Commercial Operator ${vehicle.assignedDriverId} assigned as primary custodian of the asset.`,
        date: purchaseDate,
        icon: User,
        color: 'text-info bg-info/15 border-info/30'
      });
    }

    // 3. Maintenance Completed (If last service date exists)
    if (vehicle.lastServiceDate) {
      events.push({
        id: 'evt-maint-comp',
        title: 'Maintenance Completed',
        desc: 'Routine diagnostic inspection & oil change completed at central depot workshop.',
        date: vehicle.lastServiceDate,
        icon: CheckCircle,
        color: 'text-success bg-success/15 border-success/30'
      });
    }

    // 4. Maintenance Scheduled (If next service date exists)
    if (vehicle.nextServiceDate) {
      events.push({
        id: 'evt-maint-sched',
        title: 'Maintenance Started',
        desc: 'Scheduled preventive maintenance and tire safety rotation started.',
        date: vehicle.nextServiceDate,
        icon: Wrench,
        color: 'text-warning bg-warning/15 border-warning/30'
      });
    }

    // 5. Fuel Refuel logged
    if (vehicle.fuelLevel) {
      events.push({
        id: 'evt-fuel',
        title: 'Fuel Added',
        desc: `Refueling logged. Added 45 liters at service station. Tank level: ${vehicle.fuelLevel}%.`,
        date: vehicle.lastServiceDate || purchaseDate,
        icon: Fuel,
        color: 'text-info bg-info/15 border-info/30'
      });
    }

    // 6. Expense logged
    if (vehicle.purchaseCost) {
      events.push({
        id: 'evt-expense',
        title: 'Expense Added',
        desc: `Operational cost log registered. Procurement acquisition cost: INR ${vehicle.purchaseCost.toLocaleString()}`,
        date: purchaseDate,
        icon: DollarSign,
        color: 'text-danger bg-danger/15 border-danger/30'
      });
    }

    // 7. Active Trip Dispatched (If trip code exists)
    if (vehicle.assignedTripId) {
      events.push({
        id: 'evt-trip',
        title: 'Trip Assigned',
        desc: `Dispatched cargo route code ${vehicle.assignedTripId} initialized and active.`,
        date: new Date().toISOString().split('T')[0],
        icon: Compass,
        color: 'text-info bg-info/15 border-info/30'
      });
    }

    // 8. Image upload milestone (If primary image is set)
    if (vehicle.image) {
      events.push({
        id: 'evt-img',
        title: 'Image Updated',
        desc: 'Primary vehicle asset identification photo uploaded to ERP media storage.',
        date: purchaseDate,
        icon: ImageIcon,
        color: 'text-purple-500 bg-purple-500/10 border-purple-500/20'
      });
    }

    // Sort: newest dates first
    return events.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [vehicle]);

  if (historyEvents.length === 0) {
    return (
      <div className="text-center py-6 text-xs text-text-secondary font-semibold">
        No lifecycle activities logged for this asset yet.
      </div>
    );
  }

  return (
    <div className="relative border-l border-border pl-6 ml-3 space-y-6 text-left">
      {historyEvents.map((evt, idx) => {
        const IconComponent = evt.icon;
        return (
          <div key={evt.id} className="relative select-none">
            {/* Timeline bullet icon */}
            <span className={`absolute -left-9 top-0.5 h-6.5 w-6.5 rounded-full border flex items-center justify-center ${evt.color}`}>
              <IconComponent size={12} />
            </span>

            {/* Event Description Card */}
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs font-black text-text-main">{evt.title}</span>
                <span className="text-[10px] text-text-secondary font-medium tracking-tight whitespace-nowrap bg-hover px-2 py-0.5 rounded-full border border-border/40">
                  {evt.date}
                </span>
              </div>
              <p className="text-[11px] text-text-secondary leading-normal font-semibold">
                {evt.desc}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default VehicleHistory;
