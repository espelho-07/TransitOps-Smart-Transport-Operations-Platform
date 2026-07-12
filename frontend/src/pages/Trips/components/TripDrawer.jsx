import React, { useState, useEffect } from 'react';
import {
  Compass,
  Edit,
  FolderOpen,
  MapPin,
  Clock,
  Layers,
  ArrowRight,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import Drawer from '../../../components/ui/Drawer';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import { tripService } from '../../../services/tripService';
import { vehicleService } from '../../../services/vehicleService';
import { driverService } from '../../../services/driverService';
import { showToast } from '../../../components/ui/Toast';
import { VehicleImage, DriverAvatar } from '../../../components/ui/FallbackImage';
import { useAuth } from '../../../context/AuthContext';

/**
 * Slide-out details drawer panel (420px) for active dispatches.
 */
const TripDrawer = ({ isOpen, onClose, tripId, trip: propTrip, onViewProfile, onEditProfile, onUpdate }) => {
  const { currentUser } = useAuth();
  const isManager = currentUser?.role === 'Admin' || currentUser?.role === 'Fleet Manager';

  // Details local state
  const [tripState, setTripState] = useState(null);
  const trip = propTrip || tripState;
  const [vehicle, setVehicle] = useState(null);
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (propTrip) {
        loadRelatedData(propTrip);
      } else if (tripId) {
        loadTripData();
      }
    }
  }, [isOpen, tripId, propTrip]);

  const loadRelatedData = async (data) => {
    try {
      const [vObj, dObj] = await Promise.all([
        vehicleService.getById(data.vehicleId).catch(() => null),
        driverService.getById(data.driverId).catch(() => null)
      ]);
      setVehicle(vObj);
      setDriver(dObj);
    } catch (err) {
      console.error(err);
    }
  };

  const loadTripData = async () => {
    setLoading(true);
    try {
      const data = await tripService.getById(tripId);
      setTripState(data);
      await loadRelatedData(data);
    } catch {
      showToast.error("Failed to load trip parameters");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!trip) return;
    setSaving(true);
    try {
      const updated = await tripService.update(trip.id, { status: newStatus });
      setTrip(updated);
      showToast.success(`Trip status moved to ${newStatus}`);

      // Business Rule: Trip Complete resets vehicle & driver availability
      if (newStatus === 'Completed' || newStatus === 'Cancelled') {
        await Promise.all([
          vehicleService.update(trip.vehicleId, { status: 'Available', assignedDriverId: null, assignedTripId: null }),
          driverService.update(trip.driverId, { status: 'Available' })
        ]);
        showToast.success("Vehicle & driver released to available fleet pool");
      } else if (newStatus === 'Active') {
        await Promise.all([
          vehicleService.update(trip.vehicleId, { status: 'On Trip', assignedDriverId: trip.driverId, assignedTripId: trip.id }),
          driverService.update(trip.driverId, { status: 'On Trip' })
        ]);
      }

      onUpdate && onUpdate();
    } catch {
      showToast.error("Failed to update status");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={trip ? `Dispatch log: ${trip.tripNumber}` : 'Trip Logs'}
      className="w-full sm:w-[420px]"
    >
      {loading || !trip ? (
        <div className="flex flex-col items-center justify-center py-36 space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-info" />
          <span className="text-xs text-text-secondary font-bold uppercase">Syncing routes...</span>
        </div>
      ) : (
        <div className="space-y-5 h-full flex flex-col justify-between">
          
          <div className="flex-1 overflow-y-auto space-y-5 pr-1 custom-scrollbar text-left text-xs font-semibold text-text-secondary">
            
            {/* Cargo routes banner */}
            <div className="bg-hover/10 p-4 border border-border rounded-xl space-y-3">
              <div className="flex items-center justify-between border-b border-border/50 pb-2">
                <span className="text-[10px] font-black text-text-secondary uppercase">Lifecycle status</span>
                <Badge status={trip.status} />
              </div>
              <div className="flex items-center gap-3">
                <MapPin size={20} className="text-info shrink-0" />
                <div className="min-w-0">
                  <span className="block text-[9px] uppercase font-bold text-text-secondary">Route Path</span>
                  <span className="block text-text-main font-black text-sm mt-0.5 leading-tight">
                    {trip.origin} &rarr; {trip.destination}
                  </span>
                </div>
              </div>
            </div>

            {/* Specifications Cards Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="border border-border/40 p-2.5 rounded-lg bg-hover/5">
                <span className="block text-[9px] uppercase font-bold">Route distance</span>
                <span className="font-bold text-text-main block mt-0.5">{trip.distance} km</span>
              </div>
              <div className="border border-border/40 p-2.5 rounded-lg bg-hover/5">
                <span className="block text-[9px] uppercase font-bold">Cargo weight</span>
                <span className="font-bold text-text-main block mt-0.5">{trip.cargoWeight}</span>
              </div>
              <div className="border border-border/40 p-2.5 rounded-lg bg-hover/5">
                <span className="block text-[9px] uppercase font-bold">Refuel Liters</span>
                <span className="font-bold text-text-main block mt-0.5">{trip.fuelConsumed ? `${trip.fuelConsumed} L` : 'N/A'}</span>
              </div>
              <div className="border border-border/40 p-2.5 rounded-lg bg-hover/5">
                <span className="block text-[9px] uppercase font-bold">Departure Date</span>
                <span className="font-bold text-text-main block mt-0.5">{trip.startDate?.split('T')[0]}</span>
              </div>
            </div>

            {/* Assigned vehicle specs card */}
            <div className="border border-border p-3.5 rounded-xl space-y-3 bg-hover/5">
              <h5 className="text-[9.5px] font-black text-text-main uppercase tracking-wider">Assigned Fleet Vehicle</h5>
              {vehicle ? (
                <div className="flex items-center gap-3">
                  <VehicleImage src={vehicle.image} size={48} className="rounded-lg border object-cover" />
                  <div className="text-left space-y-0.5">
                    <span className="block font-bold text-text-main text-xs">{vehicle.make} {vehicle.model}</span>
                    <span className="block text-[9.5px] text-text-secondary font-black uppercase">{vehicle.plateNumber}</span>
                  </div>
                </div>
              ) : (
                <span className="block text-[11px] text-text-secondary font-semibold py-1">Vehicle assignment missing.</span>
              )}
            </div>

            {/* Assigned driver specs card */}
            <div className="border border-border p-3.5 rounded-xl space-y-3 bg-hover/5">
              <h5 className="text-[9.5px] font-black text-text-main uppercase tracking-wider">Assigned custodian operator</h5>
              {driver ? (
                <div className="flex items-center gap-3">
                  <DriverAvatar name={driver.name} avatarUrl={driver.avatar} size={40} />
                  <div className="text-left space-y-0.5">
                    <span className="block font-bold text-text-main text-xs">{driver.name}</span>
                    <span className="block text-[9.5px] text-text-secondary font-black uppercase">ID: {driver.id}</span>
                  </div>
                </div>
              ) : (
                <span className="block text-[11px] text-text-secondary font-semibold py-1">Driver assignment missing.</span>
              )}
            </div>

            {/* State Transition controllers */}
            {isManager && trip.status !== 'Completed' && trip.status !== 'Cancelled' && (
              <div className="border border-border p-3.5 rounded-xl space-y-3 bg-hover/5 text-left">
                <h5 className="text-[9.5px] font-black text-text-main uppercase tracking-wider">Lifecycle transitions</h5>
                <div className="flex gap-2">
                  {trip.status === 'Scheduled' && (
                    <Button variant="primary" onClick={() => handleUpdateStatus('Active')} className="w-full text-xs py-1.5">
                      Activate Dispatch
                    </Button>
                  )}
                  {trip.status === 'Active' && (
                    <>
                      <Button variant="outline" onClick={() => handleUpdateStatus('Cancelled')} className="w-1/2 text-xs py-1.5">
                        Cancel Trip
                      </Button>
                      <Button variant="success" onClick={() => handleUpdateStatus('Completed')} className="w-1/2 text-xs py-1.5">
                        Complete Trip
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}

          </div>

          {/* Action Trigger footer buttons */}
          <div className="space-y-2 border-t border-border pt-4 text-left">
            <div className={`grid ${isManager && trip.status !== 'Completed' && trip.status !== 'Cancelled' ? 'grid-cols-2' : 'grid-cols-1'} gap-2`}>
              <Button variant="primary" onClick={() => onViewProfile(trip.id)} leftIcon={FolderOpen} className="w-full text-xs">
                Full Details
              </Button>
              {isManager && trip.status !== 'Completed' && trip.status !== 'Cancelled' && (
                <Button variant="outline" onClick={() => onEditProfile(trip.id)} leftIcon={Edit} className="w-full text-xs">
                  Edit Dispatch
                </Button>
              )}
            </div>
          </div>

        </div>
      )}
    </Drawer>
  );
};

export default TripDrawer;
