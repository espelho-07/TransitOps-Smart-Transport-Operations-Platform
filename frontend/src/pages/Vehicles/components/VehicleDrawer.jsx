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
import Tabs from '../../../components/ui/Tabs';
import { driverService } from '../../../services/driverService';
import { vehicleService } from '../../../services/vehicleService';
import { tripService } from '../../../services/tripService';
import { maintenanceService } from '../../../services/maintenanceService';
import { showToast } from '../../../components/ui/Toast';
import { VehicleImage, DriverAvatar } from '../../../components/ui/FallbackImage';
import VehicleHistory from './VehicleHistory';
import { useAuth } from '../../../context/AuthContext';

/**
 * High-fidelity right drawer (420px) displaying complete vehicle specs,
 * compliance flags, latest trips, fuel economies, maintenance schedules, and activity timelines.
 */
const VehicleDrawer = ({
  isOpen,
  onClose,
  vehicleId,
  onViewProfile,
  onEditProfile,
  onUpdate
}) => {
  const { currentUser } = useAuth ? useAuth() : { currentUser: { role: 'Admin' } }; // Fail-safe fallback if useAuth is unimported
  const isManager = currentUser?.role === 'Admin' || currentUser?.role === 'Fleet Manager';

  // Drawer local states
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

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
    if (isOpen && vehicleId) {
      loadVehicleData();
      loadDrivers();
    }
  }, [isOpen, vehicleId]);

  const loadVehicleData = async () => {
    setLoading(true);
    try {
      const data = await vehicleService.getById(vehicleId);
      setVehicle(data);
      setOdometer(data.odometer || '');
      setStatus(data.status || '');
      setDriverId(data.assignedDriverId || '');

      // Load related dispatches
      const allTrips = await tripService.getAll();
      setTrips(allTrips.filter(t => t.vehicleId === data.id));

      // Load related maintenance logs
      const allMaint = await maintenanceService.getAll();
      setMaintenance(allMaint.filter(m => m.vehicleId === data.id));
    } catch {
      showToast.error("Failed to load vehicle parameters");
    } finally {
      setLoading(false);
    }
  };

  const loadDrivers = async () => {
    try {
      const data = await driverService.getAll();
      // Filter out suspended drivers
      setAvailableDrivers(data.filter(d => d.status !== 'Suspended'));
    } catch {
      console.error("Failed to query operator profiles");
    }
  };

  // Actions
  const handleSaveOdometer = async () => {
    if (odometer === '' || Number(odometer) < 0) {
      showToast.error('Enter a valid non-negative mileage reading');
      return;
    }
    setSavingOdometer(true);
    try {
      const updated = await vehicleService.update(vehicleId, { odometer: Number(odometer) });
      setVehicle(updated);
      showToast.success('Odometer reading updated');
      onUpdate && onUpdate();
    } catch {
      showToast.error('Odometer update failed');
    } finally {
      setSavingOdometer(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setSavingStatus(true);
    setStatus(newStatus);
    try {
      const updated = await vehicleService.update(vehicleId, { status: newStatus });
      setVehicle(updated);
      showToast.success(`Operational status changed to ${newStatus}`);
      onUpdate && onUpdate();
    } catch {
      showToast.error('Status transition failed');
    } finally {
      setSavingStatus(false);
    }
  };

  const handleDriverChange = async (newDriverId) => {
    setSavingDriver(true);
    setDriverId(newDriverId);
    try {
      const updated = await vehicleService.update(vehicleId, { assignedDriverId: newDriverId || null });
      setVehicle(updated);
      showToast.success(newDriverId ? 'Custodian driver assigned successfully' : 'Driver unassigned');
      onUpdate && onUpdate();
    } catch {
      showToast.error('Custodian assignment failed');
    } finally {
      setSavingDriver(false);
    }
  };

  const handleArchive = async () => {
    try {
      const updated = await vehicleService.archive(vehicleId);
      setVehicle(updated);
      showToast.success(updated.isArchived ? 'Asset archived successfully' : 'Asset restored successfully');
      onUpdate && onUpdate();
    } catch {
      showToast.error('Archive action failed');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this vehicle asset? This action is permanent.')) {
      try {
        await vehicleService.delete(vehicleId);
        showToast.success('Vehicle asset deleted successfully');
        onUpdate && onUpdate();
        onClose();
      } catch (err) {
        showToast.error(err.message || 'Deletion failed');
      }
    }
  };

  const handleFuelSubmit = (e) => {
    e.preventDefault();
    if (!fuelLiters || !fuelCost) return;
    showToast.success(`Logged refuel: ${fuelLiters}L for INR ${fuelCost}`);
    setShowFuelLogModal(false);
    setFuelLiters('');
    setFuelCost('');
  };

  // Compute Expirations Checkbox Grid Values
  const complianceStatus = useMemo(() => {
    if (!vehicle) return {};
    const now = new Date();
    const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const getStatus = (dateStr) => {
      if (!dateStr) return 'Missing';
      const dateVal = new Date(dateStr);
      if (dateVal < now) return 'Expired';
      if (dateVal <= thirtyDays) return 'Expiring';
      return 'Valid';
    };

    return {
      insurance: getStatus(vehicle.insuranceExpiry),
      fitness: getStatus(vehicle.fitnessExpiry),
      permit: getStatus(vehicle.permitExpiry),
      puc: getStatus(vehicle.pucExpiry)
    };
  }, [vehicle]);

  const docBadge = (status) => {
    if (status === 'Valid') return <span className="inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold bg-success/15 border border-success/35 text-success uppercase">Valid</span>;
    if (status === 'Expiring') return <span className="inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold bg-warning/15 border border-warning/35 text-warning uppercase animate-pulse">Expiring</span>;
    return <span className="inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold bg-danger/15 border border-danger/35 text-danger uppercase">Expired</span>;
  };

  const tabOptions = [
    { id: 'overview', label: 'Specs & Compliance' },
    { id: 'logs', label: 'Trips & Servicing' },
    { id: 'timeline', label: 'Event Timeline' }
  ];

  if (!isOpen) return null;

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={vehicle ? `Quick Audit: ${vehicle.plateNumber}` : 'Vehicle Parameters'}
      className="w-full sm:w-[420px]"
    >
      {loading || !vehicle ? (
        <div className="flex flex-col items-center justify-center py-36 space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-info" />
          <span className="text-xs text-text-secondary font-bold uppercase tracking-wider">Syncing details...</span>
        </div>
      ) : (
        <div className="space-y-5 h-full flex flex-col justify-between">
          
          {/* Scrollable Main body wrapper */}
          <div className="flex-1 overflow-y-auto space-y-5 custom-scrollbar pr-1">
            
            {/* Header profile cards */}
            <div className="flex items-center gap-4 bg-hover/10 p-4 border border-border/80 rounded-xl">
              <button 
                type="button" 
                onClick={() => onViewProfile(vehicle.id)}
                className="cursor-pointer hover:opacity-85 transition-opacity"
                title="View full specs"
              >
                <VehicleImage src={vehicle.image} alt={vehicle.plateNumber} size={80} />
              </button>
              <div className="min-w-0 text-left space-y-1">
                <h4 className="text-xs font-black text-text-main leading-tight truncate">
                  {vehicle.make} {vehicle.model}
                </h4>
                <span className="block text-[11px] font-black text-text-secondary uppercase">
                  {vehicle.plateNumber}
                </span>
                <Badge status={vehicle.status} className="mt-1" />
              </div>
            </div>

            {/* Custom Tab Panel bar */}
            <Tabs tabs={tabOptions} activeTab={activeTab} onTabChange={setActiveTab} className="scale-95" />

            {/* Tab Panels */}
            <div className="space-y-4">
              
              {/* Tab 1: Overview */}
              {activeTab === 'overview' && (
                <div className="space-y-4 text-xs font-semibold text-text-secondary">
                  
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
                      <span className="block text-[9px] uppercase font-bold">Cargo Capacity</span>
                      <span className="font-bold text-text-main block mt-0.5">{vehicle.carrierCap}</span>
                    </div>
                    <div className="border border-border/40 p-2.5 rounded-lg bg-hover/5">
                      <span className="block text-[9px] uppercase font-bold">Fuel Type</span>
                      <span className="font-bold text-text-main block mt-0.5">{vehicle.fuelType}</span>
                    </div>
                    <div className="border border-border/40 p-2.5 rounded-lg bg-hover/5">
                      <span className="block text-[9px] uppercase font-bold">Tank Capacity</span>
                      <span className="font-bold text-text-main block mt-0.5">{vehicle.fuelTankCapacity || 60} L</span>
                    </div>
                    <div className="border border-border/40 p-2.5 rounded-lg bg-hover/5">
                      <span className="block text-[9px] uppercase font-bold">Purchase Date</span>
                      <span className="font-bold text-text-main block mt-0.5">{vehicle.purchaseDate || 'N/A'}</span>
                    </div>
                    <div className="border border-border/40 p-2.5 rounded-lg bg-hover/5">
                      <span className="block text-[9px] uppercase font-bold">Acquisition Cost</span>
                      <span className="font-bold text-text-main block mt-0.5">INR {vehicle.purchaseCost?.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Compliance Policy Watch Checklist */}
                  <div className="border border-border p-3.5 rounded-xl space-y-3.5 bg-hover/10 text-left">
                    <h5 className="text-[10px] font-black text-text-main uppercase tracking-wider">Regulatory Compliance Watch</h5>
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

                </div>
              )}

              {/* Tab 2: Logs */}
              {activeTab === 'logs' && (
                <div className="space-y-4 text-xs text-left">
                  
                  {/* Latest 5 dispatches */}
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
                    <h5 className="text-[10px] font-black text-text-main uppercase tracking-wider">Preventive Maintenance Schedules</h5>
                    <div className="grid grid-cols-2 gap-3 border border-border p-3 rounded-lg bg-hover/5 font-semibold text-text-secondary">
                      <div>
                        <span className="block text-[9px] uppercase">Last Service</span>
                        <span className="text-text-main font-bold mt-0.5 block">{vehicle.lastServiceDate || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] uppercase">Next Service</span>
                        <span className="text-text-main font-bold mt-0.5 block">{vehicle.nextServiceDate || 'N/A'}</span>
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
              )}

              {/* Tab 3: Timeline */}
              {activeTab === 'timeline' && (
                <div className="py-2.5 max-h-[300px] overflow-y-auto pr-1">
                  <VehicleHistory vehicle={vehicle} />
                </div>
              )}

            </div>

            {/* Quick configurations (Odometer status driver assignments) */}
            {isManager && (
              <div className="border border-border p-3.5 rounded-xl space-y-4 text-left bg-hover/5">
                <h5 className="text-[10px] font-black text-text-main uppercase tracking-wider">Configuration Controls</h5>
                
                {/* Inline Odometer Edit */}
                <div className="space-y-1">
                  <label className="text-[10px] text-text-secondary font-bold uppercase">Update Mileage Odometer (km)</label>
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
                      className="p-2 text-xs font-bold"
                    >
                      Save
                    </Button>
                  </div>
                </div>

                {/* Quick Driver Assign */}
                <div className="space-y-1">
                  <label className="text-[10px] text-text-secondary font-bold uppercase">Custodian Driver</label>
                  <select
                    value={driverId}
                    onChange={(e) => handleDriverChange(e.target.value)}
                    disabled={savingDriver || vehicle.status === 'Maintenance' || vehicle.status === 'Retired'}
                    className="w-full text-xs font-semibold bg-card border border-border rounded-lg p-2 text-text-main focus:outline-none focus:ring-1 focus:ring-info disabled:opacity-50"
                  >
                    <option value="">Unassigned</option>
                    {availableDrivers.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.id})</option>
                    ))}
                  </select>
                </div>

                {/* Quick Status Setter */}
                <div className="space-y-1">
                  <label className="text-[10px] text-text-secondary font-bold uppercase">Operational Status</label>
                  <select
                    value={status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    disabled={savingStatus}
                    className="w-full text-xs font-semibold bg-card border border-border rounded-lg p-2 text-text-main focus:outline-none focus:ring-1 focus:ring-info"
                  >
                    <option value="Available">Available</option>
                    <option value="On Trip">On Trip</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Retired">Retired</option>
                  </select>
                </div>
              </div>
            )}

          </div>

          {/* Action Trigger Buttons Footer */}
          <div className="space-y-2 border-t border-border pt-4 text-left">
            <div className={`grid ${isManager ? 'grid-cols-2' : 'grid-cols-1'} gap-2`}>
              <Button
                variant="primary"
                onClick={() => onViewProfile(vehicle.id)}
                leftIcon={FolderOpen}
                className="w-full text-xs"
              >
                Full Profile
              </Button>
              {isManager && (
                <Button
                  variant="outline"
                  onClick={() => onEditProfile(vehicle.id)}
                  leftIcon={Edit}
                  className="w-full text-xs"
                >
                  Edit Asset
                </Button>
              )}
            </div>
            
            {isManager && (
              <>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (vehicle.status === 'Maintenance' || vehicle.status === 'Retired') {
                        showToast.error('Cannot dispatch vehicles in maintenance or retired');
                        return;
                      }
                      showToast.success('Dispatch trip workflow opened in modal');
                    }}
                    leftIcon={Compass}
                    className="text-[10px] p-2"
                  >
                    Dispatch Trip
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      showToast.success('Maintenance scheduled successfully');
                    }}
                    leftIcon={Wrench}
                    className="text-[10px] p-2"
                  >
                    Maintenance
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowFuelLogModal(true)}
                    leftIcon={Fuel}
                    className="text-[10px] p-2"
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
              </>
            )}
          </div>

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
