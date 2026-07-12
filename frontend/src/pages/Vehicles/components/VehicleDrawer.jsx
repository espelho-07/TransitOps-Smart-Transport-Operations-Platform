import React, { useState, useEffect, useMemo } from 'react';
import {
  Wrench,
  UserCheck,
  Edit,
  FolderOpen,
  Archive,
  Trash2,
  Gauge,
  Fuel,
  Info,
  Calendar,
  Save,
  Check,
  Clock,
  Compass,
  FileText,
  DollarSign,
  AlertTriangle
} from 'lucide-react';
import Drawer from '../../../components/ui/Drawer';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Input from '../../../components/ui/Input';
import EntityDetailLayout from '../../../components/ui/EntityDetailLayout';
import { driverService } from '../../../services/driverService';
import { vehicleService } from '../../../services/vehicleService';
import { tripService } from '../../../services/tripService';
import { maintenanceService } from '../../../services/maintenanceService';
import { showToast } from '../../../components/ui/Toast';
import { VehicleImage, DriverAvatar } from '../../../components/ui/FallbackImage';
import VehicleHistory from './VehicleHistory';
import { useAuth } from '../../../context/AuthContext';

const VehicleDrawer = ({
  isOpen,
  onClose,
  vehicleId,
  vehicle: propVehicle,
  onViewProfile,
  onEditProfile,
  onUpdate
}) => {
  const { currentUser } = useAuth();
  const isManager = currentUser?.role === 'Admin' || currentUser?.role === 'Fleet Manager';

  // Drawer local states
  const [vehicleState, setVehicleState] = useState(null);
  const vehicle = propVehicle || vehicleState;
  const [loading, setLoading] = useState(false);
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [maintenance, setMaintenance] = useState([]);

  // Quick edit config states
  const [odometer, setOdometer] = useState('');
  const [status, setStatus] = useState('');
  const [driverId, setDriverId] = useState('');
  const [savingOdometer, setSavingOdometer] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingDriver, setSavingDriver] = useState(false);

  // Modal actions simulations
  const [showFuelLogModal, setShowFuelLogModal] = useState(false);
  const [fuelLiters, setFuelLiters] = useState('');
  const [fuelCost, setFuelCost] = useState('');

  // Load details
  useEffect(() => {
    if (isOpen) {
      if (propVehicle) {
        setOdometer(propVehicle.odometer || '');
        setStatus(propVehicle.status || '');
        setDriverId(propVehicle.assignedDriverId || '');
        loadRelatedData(propVehicle);
      } else if (vehicleId) {
        loadVehicleData();
      }
      loadDrivers();
    }
  }, [isOpen, vehicleId, propVehicle]);

  const loadRelatedData = async (data) => {
    try {
      const allTrips = await tripService.getAll();
      setTrips(allTrips.filter(t => t.vehicleId === data.id));

      const allMaint = await maintenanceService.getAll();
      setMaintenance(allMaint.filter(m => m.vehicleId === data.id));
    } catch (err) {
      console.error(err);
    }
  };

  const loadVehicleData = async () => {
    setLoading(true);
    try {
      const data = await vehicleService.getById(vehicleId);
      setVehicleState(data);
      setOdometer(data.odometer || '');
      setStatus(data.status || '');
      setDriverId(data.assignedDriverId || '');

      await loadRelatedData(data);
    } catch {
      showToast.error("Failed to load vehicle parameters");
    } finally {
      setLoading(false);
    }
  };

  const loadDrivers = async () => {
    try {
      const allDrivers = await driverService.getAll();
      setAvailableDrivers(allDrivers);
    } catch {
      console.error("Failed to load drivers for assignment");
    }
  };

  const handleSaveOdometer = async () => {
    if (!odometer || isNaN(odometer)) {
      showToast.error("Please enter a valid mileage numeric log");
      return;
    }
    setSavingOdometer(true);
    try {
      const updated = await vehicleService.updateOdometer(vehicle.id, Number(odometer));
      setVehicle(updated);
      showToast.success("Mileage odometer logs updated successfully!");
      if (onUpdate) onUpdate();
    } catch {
      showToast.error("Failed to update odometer");
    } finally {
      setSavingOdometer(false);
    }
  };

  const handleSaveStatus = async (newStatus) => {
    setSavingStatus(true);
    try {
      const updated = await vehicleService.updateStatus(vehicle.id, newStatus);
      setVehicle(updated);
      setStatus(newStatus);
      showToast.success(`Vehicle status changed to: ${newStatus}`);
      if (onUpdate) onUpdate();
    } catch {
      showToast.error("Failed to change vehicle status");
    } finally {
      setSavingStatus(false);
    }
  };

  const handleAssignDriver = async (e) => {
    const selectedDriverId = e.target.value;
    setDriverId(selectedDriverId);
    setSavingDriver(true);
    try {
      const updated = await vehicleService.assignDriver(vehicle.id, selectedDriverId || null);
      setVehicle(updated);
      showToast.success(selectedDriverId ? "New custodian driver pilot assigned!" : "Custodian driver pilot released");
      if (onUpdate) onUpdate();
    } catch {
      showToast.error("Failed to assign driver pilot");
    } finally {
      setSavingDriver(false);
    }
  };

  const handleArchive = async () => {
    try {
      if (vehicle.isArchived) {
        await vehicleService.restore(vehicle.id);
        showToast.success("Vehicle restored to active registry");
      } else {
        await vehicleService.archive(vehicle.id);
        showToast.success("Vehicle archived in registry");
      }
      onClose();
      if (onUpdate) onUpdate();
    } catch {
      showToast.error("Failed to toggle archive status");
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this vehicle permanently?")) {
      try {
        await vehicleService.delete(vehicle.id);
        showToast.success("Vehicle asset deleted permanently");
        onClose();
        if (onUpdate) onUpdate();
      } catch {
        showToast.error("Failed to delete vehicle");
      }
    }
  };

  const handleFuelSubmit = async (e) => {
    e.preventDefault();
    if (!fuelLiters || !fuelCost) {
      showToast.error("Please fill in both fields");
      return;
    }
    showToast.success("Fuel log simulated successfully");
    setShowFuelLogModal(false);
    setFuelCost('');
    setFuelLiters('');
  };

  // Document Badge Helpers
  const docBadge = (statusVal) => {
    if (statusVal === 'valid' || statusVal === true) {
      return <span className="text-[10px] font-black text-success uppercase">Valid</span>;
    }
    if (statusVal === 'expiring') {
      return <span className="text-[10px] font-black text-warning uppercase">Expiring</span>;
    }
    return <span className="text-[10px] font-black text-danger uppercase">Expired</span>;
  };

  const complianceStatus = useMemo(() => {
    if (!vehicle) return { insurance: 'expired', permit: 'expired', fitness: 'expired', puc: 'expired' };
    
    // Convert text dates into simple evaluations
    return {
      insurance: vehicle.insuranceExpiry ? (new Date(vehicle.insuranceExpiry) > new Date() ? 'valid' : 'expired') : 'expired',
      permit: vehicle.permitExpiry ? (new Date(vehicle.permitExpiry) > new Date() ? 'valid' : 'expired') : 'expired',
      fitness: vehicle.fitnessExpiry ? (new Date(vehicle.fitnessExpiry) > new Date() ? 'valid' : 'expired') : 'expired',
      puc: vehicle.pucExpiry ? (new Date(vehicle.pucExpiry) > new Date() ? 'valid' : 'expired') : 'expired',
    };
  }, [vehicle]);

  if (!isOpen) return null;

  // Overview tab Content
  const overviewContent = vehicle && (
    <div className="space-y-4.5 text-xs font-semibold text-text-secondary">
      {/* Driver custodianship card */}
      <div className="flex items-center justify-between border border-border p-3.5 rounded-xl bg-hover/5">
        <div className="flex items-center gap-3">
          <DriverAvatar 
            name={availableDrivers.find(d => d.id === vehicle.assignedDriverId)?.name || 'Unassigned'} 
            avatarUrl={availableDrivers.find(d => d.id === vehicle.assignedDriverId)?.avatar} 
            size={40} 
          />
          <div className="text-left">
            <span className="block text-[9px] font-black text-text-secondary uppercase tracking-wider">Custodian</span>
            <span className="text-text-main font-bold block mt-0.5">
              {availableDrivers.find(d => d.id === vehicle.assignedDriverId)?.name || 'Unassigned'}
            </span>
          </div>
        </div>
        <div className="text-right">
          <span className="block text-[9px] font-black text-text-secondary uppercase tracking-wider">Active Trip</span>
          <span className="text-text-main font-bold block mt-0.5 text-info">
            {vehicle.assignedTripId ? vehicle.assignedTripId : 'None'}
          </span>
        </div>
      </div>

      {/* General Specifications Grid */}
      <div className="grid grid-cols-2 gap-3 text-left">
        <div className="border border-border/40 p-2.5 rounded-lg bg-hover/5">
          <span className="block text-[9px] uppercase font-bold">Class / Type</span>
          <span className="font-bold text-text-main block mt-0.5">{vehicle.type}</span>
        </div>
        <div className="border border-border/40 p-2.5 rounded-lg bg-hover/5">
          <span className="block text-[9px] uppercase font-bold">Capacity</span>
          <span className="font-bold text-text-main block mt-0.5">{vehicle.carrierCap}</span>
        </div>
        <div className="border border-border/40 p-2.5 rounded-lg bg-hover/5">
          <span className="block text-[9px] uppercase font-bold">Fuel Type</span>
          <span className="font-bold text-text-main block mt-0.5">{vehicle.fuelType}</span>
        </div>
        <div className="border border-border/40 p-2.5 rounded-lg bg-hover/5">
          <span className="block text-[9px] uppercase font-bold">Odometer (km)</span>
          <span className="font-bold text-text-main block mt-0.5">{vehicle.odometer?.toLocaleString()} km</span>
        </div>
      </div>

      {/* Compliance Policy Watch Checklist */}
      <div className="border border-border p-3.5 rounded-xl space-y-3 bg-hover/10 text-left">
        <h5 className="text-[10px] font-black text-text-main uppercase tracking-wider">Regulatory Compliance</h5>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center justify-between border-b border-border/60 pb-1.5">
            <span className="text-[10px]">Insurance</span>
            {docBadge(complianceStatus.insurance)}
          </div>
          <div className="flex items-center justify-between border-b border-border/60 pb-1.5">
            <span className="text-[10px]">Permit</span>
            {docBadge(complianceStatus.permit)}
          </div>
          <div className="flex items-center justify-between border-b border-border/60 pb-1.5">
            <span className="text-[10px]">Fitness Cert</span>
            {docBadge(complianceStatus.fitness)}
          </div>
          <div className="flex items-center justify-between border-b border-border/60 pb-1.5">
            <span className="text-[10px]">PUC Emission</span>
            {docBadge(complianceStatus.puc)}
          </div>
        </div>
      </div>

      {/* Configuration Controls (Only for Managers) */}
      {isManager && (
        <div className="border border-border p-3.5 rounded-xl space-y-3 text-left bg-hover/5">
          <h5 className="text-[10px] font-black text-text-main uppercase tracking-wider">Configuration Controls</h5>
          
          {/* Inline Odometer Edit */}
          <div className="space-y-1">
            <label className="text-[9.5px] text-text-secondary font-bold uppercase">Update Mileage (km)</label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={odometer}
                onChange={(e) => setOdometer(e.target.value)}
                className="flex-1 text-xs"
              />
              <Button
                variant="outline"
                onClick={handleSaveOdometer}
                isLoading={savingOdometer}
                className="px-3 text-xs font-bold"
              >
                Save
              </Button>
            </div>
          </div>

          {/* Quick status controls */}
          <div className="space-y-1.5">
            <label className="text-[9.5px] text-text-secondary font-bold uppercase block">Change Status Flag</label>
            <div className="flex gap-2 flex-wrap">
              {['Available', 'Maintenance', 'Active'].map(statusName => (
                <button
                  key={statusName}
                  onClick={() => handleSaveStatus(statusName)}
                  disabled={savingStatus}
                  className={`px-3 py-1.5 rounded-lg text-[9.5px] font-black uppercase transition-all ${
                    vehicle.status === statusName
                      ? 'bg-info text-white font-black'
                      : 'bg-hover/80 text-text-secondary hover:text-text-main hover:bg-hover'
                  }`}
                >
                  {statusName}
                </button>
              ))}
            </div>
          </div>

          {/* Custodian Driver assign */}
          <div className="space-y-1">
            <label className="text-[9.5px] text-text-secondary font-bold uppercase">Re-assign Custodian Pilot</label>
            <select
              value={driverId}
              onChange={handleAssignDriver}
              disabled={savingDriver}
              className="bg-background text-text-main border border-border rounded-lg px-2.5 py-1.5 text-xs w-full focus:outline-none focus:border-info"
            >
              <option value="">Unassigned</option>
              {availableDrivers.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.status})
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );

  // Trips & Maintenance tab Content
  const logsContent = (
    <div className="space-y-4 text-xs text-left">
      {/* Latest dispatches */}
      <div className="space-y-2">
        <h5 className="text-[10px] font-black text-text-main uppercase tracking-wider">Recent Logistics Dispatches</h5>
        {trips.length === 0 ? (
          <div className="text-center py-4 bg-hover/5 border border-border/40 rounded-lg text-text-secondary font-semibold">No dispatches logged for this asset.</div>
        ) : (
          <div className="divide-y divide-border border border-border rounded-lg overflow-hidden bg-card">
            {trips.slice(0, 3).map(t => (
              <div key={t.id} className="p-2.5 flex items-center justify-between font-semibold">
                <div className="space-y-0.5">
                  <span className="block text-[10px] text-info font-bold">{t.tripNumber}</span>
                  <span className="block text-[10px] text-text-main leading-none">{t.origin} &rarr; {t.destination}</span>
                </div>
                <Badge status={t.status} className="scale-90" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Servicing schedules */}
      <div className="space-y-2">
        <h5 className="text-[10px] font-black text-text-main uppercase tracking-wider">Preventive Maintenance</h5>
        <div className="grid grid-cols-2 gap-3 border border-border p-3 rounded-lg bg-hover/5 font-semibold text-text-secondary">
          <div>
            <span className="block text-[9px] uppercase">Last Service</span>
            <span className="text-text-main font-bold mt-0.5 block">{vehicle?.lastServiceDate || 'N/A'}</span>
          </div>
          <div>
            <span className="block text-[9px] uppercase">Next Service</span>
            <span className="text-text-main font-bold mt-0.5 block">{vehicle?.nextServiceDate || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Refueling logs summary */}
      <div className="space-y-2">
        <h5 className="text-[10px] font-black text-text-main uppercase tracking-wider">Fuel Statistics</h5>
        <div className="grid grid-cols-3 gap-3 font-semibold text-text-secondary text-center">
          <div className="border border-border p-2 rounded bg-hover/10">
            <span className="block text-[9px] uppercase">Fuel Econ</span>
            <span className="text-text-main font-bold text-xs mt-0.5 block">8.2 km/l</span>
          </div>
          <div className="border border-border p-2 rounded bg-hover/10">
            <span className="block text-[9px] uppercase">Liters Logged</span>
            <span className="text-text-main font-bold text-xs mt-0.5 block">140 L</span>
          </div>
          <div className="border border-border p-2 rounded bg-hover/10">
            <span className="block text-[9px] uppercase">Fuel Cost</span>
            <span className="text-text-main font-bold text-xs mt-0.5 block">INR 12.6k</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Timeline tab Content
  const timelineContent = vehicle && (
    <div className="py-2.5 max-h-[350px] overflow-y-auto pr-1">
      <VehicleHistory vehicle={vehicle} />
    </div>
  );

  const detailTabs = [
    { id: 'overview', label: 'Specs & Compliance', content: overviewContent },
    { id: 'logs', label: 'Trips & Servicing', content: logsContent },
    { id: 'timeline', label: 'Event Timeline', content: timelineContent }
  ];

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={vehicle ? `Quick Audit: ${vehicle.plateNumber}` : 'Vehicle Parameters'}
      className="w-full sm:w-[450px]"
    >
      {loading || !vehicle ? (
        <div className="flex flex-col items-center justify-center py-36 space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-info" />
          <span className="text-xs text-text-secondary font-bold uppercase tracking-wider">Syncing details...</span>
        </div>
      ) : (
        <div className="space-y-6 h-full flex flex-col justify-between">
          <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
            <EntityDetailLayout
              title={`${vehicle.make} ${vehicle.model}`}
              subtitle={vehicle.plateNumber}
              imageUrl={vehicle.image}
              statusBadge={<Badge status={vehicle.status} />}
              tabs={detailTabs}
            />
          </div>

          {/* Quick Actions Panel at the bottom */}
          {isManager && (
            <div className="border-t border-border pt-4 space-y-3 bg-card shrink-0">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    showToast.success('Maintenance scheduled successfully');
                  }}
                  leftIcon={Wrench}
                  className="text-xs p-2.5"
                >
                  Maintenance
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowFuelLogModal(true)}
                  leftIcon={Fuel}
                  className="text-xs p-2.5"
                >
                  Fuel Log
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={handleArchive}
                  leftIcon={Archive}
                  className={`w-full text-xs border-border/80 ${vehicle.isArchived ? 'bg-warning/10 text-warning border-warning/30' : ''}`}
                >
                  {vehicle.isArchived ? 'Restore' : 'Archive'}
                </Button>
                <Button
                  variant="danger"
                  onClick={handleDelete}
                  leftIcon={Trash2}
                  className="w-full text-xs"
                >
                  Delete Asset
                </Button>
              </div>
            </div>
          )}

          {/* Modal Fuel entry inside Drawer */}
          {showFuelLogModal && (
            <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
              <div className="bg-card border border-border rounded-xl p-5 w-full max-w-xs space-y-4">
                <div className="text-left">
                  <h6 className="font-bold text-text-main uppercase tracking-wider text-xs">Record Fuel Log</h6>
                  <p className="text-[10px] text-text-secondary mt-0.5">Input fuel liters and cost metrics</p>
                </div>
                <form onSubmit={handleFuelSubmit} className="space-y-3 text-left">
                  <div className="space-y-1">
                    <label className="text-[10px] text-text-secondary font-bold uppercase">Liters Refueled</label>
                    <Input type="number" required value={fuelLiters} onChange={(e) => setFuelLiters(e.target.value)} className="text-xs" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-text-secondary font-bold uppercase">Cost (INR)</label>
                    <Input type="number" required value={fuelCost} onChange={(e) => setFuelCost(e.target.value)} className="text-xs" />
                  </div>
                  <div className="flex gap-2 text-xs">
                    <Button variant="outline" type="button" onClick={() => setShowFuelLogModal(false)} className="w-1/2 text-xs">Cancel</Button>
                    <Button variant="primary" type="submit" className="w-1/2 text-xs">Save</Button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </Drawer>
  );
};

export default VehicleDrawer;
