import React, { useMemo } from 'react';
import {
  Truck,
  CheckCircle,
  Play,
  Wrench,
  AlertTriangle,
  Clock
} from 'lucide-react';

/**
 * Modern ERP Vehicle Dashboard KPI Strip
 * Renders exactly 6 cards: Total Vehicles, Available, On Trip, Maintenance, Retired, Average Fleet Age.
 */
const VehicleDashboard = ({ vehicles = [] }) => {
  const activeVehicles = useMemo(() => vehicles.filter(v => !v.isArchived), [vehicles]);

  const stats = useMemo(() => {
    const total = activeVehicles.length;
    const available = activeVehicles.filter(v => v.status === 'Available').length;
    const onTrip = activeVehicles.filter(v => v.status === 'On Trip').length;
    const maintenance = activeVehicles.filter(v => v.status === 'Maintenance').length;
    const retired = activeVehicles.filter(v => v.status === 'Retired').length;

    // Average fleet age calculation based on year of manufacture
    const currentYear = new Date().getFullYear();
    const totalAge = activeVehicles.reduce((acc, v) => acc + (currentYear - (Number(v.year) || currentYear)), 0);
    const avgAge = total > 0 ? (totalAge / total).toFixed(1) : '0.0';

    return {
      total,
      available,
      onTrip,
      maintenance,
      retired,
      avgAge
    };
  }, [activeVehicles]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 select-none text-left">
      {/* 1. Total Vehicles */}
      <div className="bg-card border border-border p-4 rounded-xl flex items-start justify-between shadow-xs hover:border-info/30 transition-all">
        <div className="space-y-1">
          <span className="block text-[9.5px] font-bold text-text-secondary uppercase tracking-wider">Total Vehicles</span>
          <span className="text-xl font-black text-text-main leading-none">{stats.total}</span>
        </div>
        <div className="p-2 bg-info/10 text-info rounded-lg">
          <Truck size={16} />
        </div>
      </div>

      {/* 2. Available */}
      <div className="bg-card border border-border p-4 rounded-xl flex items-start justify-between shadow-xs hover:border-success/30 transition-all">
        <div className="space-y-1">
          <span className="block text-[9.5px] font-bold text-text-secondary uppercase tracking-wider">Available</span>
          <span className="text-xl font-black text-text-main leading-none">{stats.available}</span>
        </div>
        <div className="p-2 bg-success/15 text-success rounded-lg">
          <CheckCircle size={16} />
        </div>
      </div>

      {/* 3. On Trip */}
      <div className="bg-card border border-border p-4 rounded-xl flex items-start justify-between shadow-xs hover:border-info/30 transition-all">
        <div className="space-y-1">
          <span className="block text-[9.5px] font-bold text-text-secondary uppercase tracking-wider">On Trip</span>
          <span className="text-xl font-black text-text-main leading-none">{stats.onTrip}</span>
        </div>
        <div className="p-2 bg-info/15 text-info rounded-lg">
          <Play size={16} fill="currentColor" className="ml-0.5" />
        </div>
      </div>

      {/* 4. Maintenance */}
      <div className="bg-card border border-border p-4 rounded-xl flex items-start justify-between shadow-xs hover:border-warning/30 transition-all">
        <div className="space-y-1">
          <span className="block text-[9.5px] font-bold text-text-secondary uppercase tracking-wider">Maintenance</span>
          <span className="text-xl font-black text-text-main leading-none">{stats.maintenance}</span>
        </div>
        <div className="p-2 bg-warning/15 text-warning rounded-lg">
          <Wrench size={16} />
        </div>
      </div>

      {/* 5. Retired */}
      <div className="bg-card border border-border p-4 rounded-xl flex items-start justify-between shadow-xs hover:border-danger/30 transition-all">
        <div className="space-y-1">
          <span className="block text-[9.5px] font-bold text-text-secondary uppercase tracking-wider">Retired</span>
          <span className="text-xl font-black text-text-main leading-none">{stats.retired}</span>
        </div>
        <div className="p-2 bg-danger/10 text-danger rounded-lg">
          <AlertTriangle size={16} />
        </div>
      </div>

      {/* 6. Average Fleet Age */}
      <div className="bg-card border border-border p-4 rounded-xl flex items-start justify-between shadow-xs hover:border-indigo-500/30 transition-all">
        <div className="space-y-1">
          <span className="block text-[9.5px] font-bold text-text-secondary uppercase tracking-wider">Avg Fleet Age</span>
          <span className="text-xl font-black text-text-main leading-none">{stats.avgAge} yrs</span>
        </div>
        <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-lg">
          <Clock size={16} />
        </div>
      </div>
    </div>
  );
};

export default VehicleDashboard;
