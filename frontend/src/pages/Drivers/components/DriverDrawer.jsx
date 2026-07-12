import React, { useState, useEffect, useMemo } from 'react';
import {
  FolderOpen,
  Edit,
  UserX,
  UserCheck,
  Phone,
  Mail,
  Shield,
  Calendar,
  Compass,
  X,
  TrendingUp
} from 'lucide-react';
import Drawer from '../../../components/ui/Drawer';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Tabs from '../../../components/ui/Tabs';
import { driverService } from '../../../services/driverService';
import { vehicleService } from '../../../services/vehicleService';
import { tripService } from '../../../services/tripService';
import { showToast } from '../../../components/ui/Toast';
import { DriverAvatar, VehicleImage } from '../../../components/ui/FallbackImage';
import { useAuth } from '../../../context/AuthContext';

const TABS = [
  { id: 'overview', label: 'Overview Specs' },
  { id: 'trips', label: 'Dispatches' }
];

/**
 * High-fidelity details drawer panel (420px) for drivers.
 */
const DriverDrawer = ({ isOpen, onClose, driverId, driver: propDriver, onViewProfile, onEditProfile, onUpdate }) => {
  const { currentUser } = useAuth();
  const isSafety = currentUser?.role === 'Admin' || currentUser?.role === 'Safety Officer';
  const isManager = currentUser?.role === 'Admin' || currentUser?.role === 'Fleet Manager';

  // State hooks
  const [driverState, setDriverState] = useState(null);
  const driver = propDriver || driverState;
  const [assignedVehicle, setAssignedVehicle] = useState(null);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (isOpen) {
      if (propDriver) {
        loadRelatedData(propDriver);
      } else if (driverId) {
        loadDriverData();
      }
    }
  }, [isOpen, driverId, propDriver]);

  const loadRelatedData = async (data) => {
    try {
      // Load related vehicle
      const allVehicles = await vehicleService.getAll();
      const linked = allVehicles.find(v => v.assignedDriverId === data.id);
      setAssignedVehicle(linked || null);

      // Load related dispatches
      const allTrips = await tripService.getAll();
      setTrips(allTrips.filter(t => t.driverId === data.id));
    } catch (err) {
      console.error(err);
    }
  };

  const loadDriverData = async () => {
    setLoading(true);
    try {
      const data = await driverService.getById(driverId);
      setDriverState(data);
      await loadRelatedData(data);
    } catch {
      showToast.error("Failed to load driver details");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSuspension = async () => {
    if (!driver) return;
    const isSuspended = driver.status === 'Suspended';
    const nextStatus = isSuspended ? 'Available' : 'Suspended';
    try {
      const updated = await driverService.update(driver.id, { status: nextStatus });
      setDriver(updated);
      showToast.success(`Driver rating status set to ${nextStatus}`);
      onUpdate && onUpdate();
    } catch {
      showToast.error("Status adjustment failed");
    }
  };

  if (!isOpen) return null;

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={driver ? `Driver profile: ${driver.id}` : 'Driver Profile'}
      className="w-full sm:w-[420px]"
    >
      {loading || !driver ? (
        <div className="flex flex-col items-center justify-center py-36 space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-info" />
          <span className="text-xs text-text-secondary font-bold uppercase">Syncing records...</span>
        </div>
      ) : (
        <div className="space-y-5 h-full flex flex-col justify-between">
          
          <div className="flex-1 overflow-y-auto space-y-5 pr-1 custom-scrollbar">
            
            {/* Header profile cards */}
            <div className="flex items-center gap-4 bg-hover/10 p-4 border border-border/80 rounded-xl">
              <DriverAvatar name={driver.name} avatarUrl={driver.avatar} size={72} />
              <div className="min-w-0 text-left space-y-1">
                <h4 className="text-xs font-black text-text-main truncate leading-tight">
                  {driver.name}
                </h4>
                <span className="block text-[10px] text-text-secondary font-semibold uppercase">
                  License: {driver.licenseNumber}
                </span>
                <Badge status={driver.status} className="mt-1" />
              </div>
            </div>

            {/* Tabs panel */}
            <Tabs tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} className="scale-95" />

            <div className="space-y-4">
              
              {/* Tab 1: Overview */}
              {activeTab === 'overview' && (
                <div className="space-y-4 text-xs font-semibold text-text-secondary text-left">
                  
                  {/* Performance stats strips */}
                  <div className="grid grid-cols-2 gap-3 text-left">
                    <div className="border border-border/40 p-2.5 rounded-lg bg-hover/5">
                      <span className="block text-[9px] uppercase font-bold">Safety Rating</span>
                      <span className="font-bold text-text-main text-sm block mt-0.5 flex items-center gap-1">
                        <Shield size={12} className="text-success" />
                        {driver.ratings} / 5.0
                      </span>
                    </div>
                    <div className="border border-border/40 p-2.5 rounded-lg bg-hover/5">
                      <span className="block text-[9px] uppercase font-bold">Hiring Date</span>
                      <span className="font-bold text-text-main block mt-0.5 flex items-center gap-1">
                        <Calendar size={12} />
                        {driver.hireDate}
                      </span>
                    </div>
                  </div>

                  {/* Contacts */}
                  <div className="border border-border p-3.5 rounded-xl space-y-3 bg-hover/5">
                    <h5 className="text-[9.5px] font-black text-text-main uppercase tracking-wider">Contact Credentials</h5>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Mail size={13} className="text-text-secondary" />
                        <span className="text-text-main select-all">{driver.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone size={13} className="text-text-secondary" />
                        <span className="text-text-main select-all">{driver.phone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Linked assigned vehicle card */}
                  <div className="border border-border p-3.5 rounded-xl space-y-3 bg-hover/5">
                    <h5 className="text-[9.5px] font-black text-text-main uppercase tracking-wider">Assigned Logistics Asset</h5>
                    {assignedVehicle ? (
                      <div className="flex items-center gap-3">
                        <VehicleImage src={assignedVehicle.image} size={48} className="rounded-lg object-cover" />
                        <div className="text-left space-y-0.5">
                          <span className="block font-bold text-text-main text-xs">{assignedVehicle.make} {assignedVehicle.model}</span>
                          <span className="block text-[9.5px] text-text-secondary font-black uppercase">{assignedVehicle.plateNumber}</span>
                        </div>
                      </div>
                    ) : (
                      <span className="block text-[11px] text-text-secondary font-semibold py-1">No vehicle assigned to driver custodian list.</span>
                    )}
                  </div>

                </div>
              )}

              {/* Tab 2: Dispatches */}
              {activeTab === 'trips' && (
                <div className="space-y-3 text-xs text-left">
                  <h5 className="text-[9.5px] font-black text-text-main uppercase tracking-wider">Logistics Trips Summary</h5>
                  {trips.length === 0 ? (
                    <div className="text-center py-6 bg-hover/5 border border-border/40 rounded-lg text-text-secondary font-semibold">
                      No dispatches recorded for this operator.
                    </div>
                  ) : (
                    <div className="divide-y divide-border border border-border rounded-lg overflow-hidden bg-card font-semibold text-text-secondary">
                      {trips.slice(0, 5).map(t => (
                        <div key={t.id} className="p-3 flex items-center justify-between">
                          <div className="space-y-0.5">
                            <span className="block text-[10px] text-info font-black">{t.tripNumber}</span>
                            <span className="block text-[10px] text-text-main">{t.origin} &rarr; {t.destination}</span>
                          </div>
                          <Badge status={t.status} className="scale-90" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>

          </div>

          {/* Action Trigger footer buttons */}
          <div className="space-y-2 border-t border-border pt-4 text-left">
            <div className={`grid ${isManager ? 'grid-cols-2' : 'grid-cols-1'} gap-2`}>
              <Button variant="primary" onClick={() => onViewProfile(driver.id)} leftIcon={FolderOpen} className="w-full text-xs">
                Full Profile
              </Button>
              {isManager && (
                <Button variant="outline" onClick={() => onEditProfile(driver.id)} leftIcon={Edit} className="w-full text-xs">
                  Edit Profile
                </Button>
              )}
            </div>

            {isSafety && (
              <Button
                variant={driver.status === 'Suspended' ? 'success' : 'danger'}
                onClick={handleToggleSuspension}
                leftIcon={driver.status === 'Suspended' ? UserCheck : UserX}
                className="w-full text-xs font-bold uppercase tracking-wider py-2"
              >
                {driver.status === 'Suspended' ? 'Validate Driver CDL' : 'Suspend Driver License'}
              </Button>
            )}
          </div>

        </div>
      )}
    </Drawer>
  );
};

export default DriverDrawer;
