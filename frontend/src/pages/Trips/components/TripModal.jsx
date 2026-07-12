import React, { useState, useEffect } from 'react';
import { X, Save, AlertTriangle } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { tripService } from '../../../services/tripService';
import { vehicleService } from '../../../services/vehicleService';
import { driverService } from '../../../services/driverService';
import { showToast } from '../../../components/ui/Toast';

const STATUSES = ['Scheduled', 'Active', 'Completed', 'Cancelled'];

const INITIAL_STATE = {
  vehicleId: '',
  driverId: '',
  origin: '',
  destination: '',
  distance: 100,
  cargoWeight: '2 Tons',
  startDate: new Date().toISOString().split('T')[0],
  status: 'Scheduled'
};

/**
 * Centered Modal Form for Dispatched Logistics Trips
 * Enforces strict availability and licensing compliance checks.
 */
const TripModal = ({ isOpen, onClose, tripId, onSave }) => {
  const isEdit = !!tripId;
  const [formData, setFormData] = useState(INITIAL_STATE);
  const [errors, setErrors] = useState({});
  
  // Database references
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setErrors({});
      loadDependencies();
      if (isEdit && tripId) {
        loadTripData();
      } else {
        setFormData({
          ...INITIAL_STATE,
          startDate: new Date().toISOString().split('T')[0]
        });
      }
    }
  }, [isOpen, tripId, isEdit]);

  const loadDependencies = async () => {
    try {
      const [vData, dData] = await Promise.all([
        vehicleService.getAll(),
        driverService.getAll()
      ]);
      setVehicles(vData);
      setDrivers(dData);
    } catch {
      console.error("Failed to query dispatcher dependencies");
    }
  };

  const loadTripData = async () => {
    setLoading(true);
    try {
      const data = await tripService.getById(tripId);
      setFormData(data);
    } catch {
      showToast.error("Failed to load dispatch ticket details");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const tempErrors = {};
    if (!formData.vehicleId) tempErrors.vehicleId = 'Vehicle assignment is required';
    if (!formData.driverId) tempErrors.driverId = 'Custodian driver assignment is required';
    if (!formData.origin.trim()) tempErrors.origin = 'Origin city is required';
    if (!formData.destination.trim()) tempErrors.destination = 'Destination destination is required';
    if (Number(formData.distance) <= 0) tempErrors.distance = 'Route mileage must be positive';
    if (!formData.cargoWeight) tempErrors.cargoWeight = 'Cargo weight is required';

    // 1. Compliance availability validation checks
    if (formData.vehicleId) {
      const vehicleObj = vehicles.find(v => v.id === formData.vehicleId);
      if (vehicleObj && !isEdit) {
        if (vehicleObj.status === 'Maintenance') {
          tempErrors.vehicleId = 'Selected vehicle is in Maintenance. Cannot dispatch cargo.';
        } else if (vehicleObj.status === 'Retired') {
          tempErrors.vehicleId = 'Selected vehicle is Retired from fleet. Cannot dispatch cargo.';
        } else if (vehicleObj.status === 'On Trip') {
          tempErrors.vehicleId = 'Selected vehicle is On Trip and unavailable.';
        }
      }

      // Check Cargo Load Weight Capacity
      if (vehicleObj && formData.cargoWeight) {
        const weightNum = parseFloat(formData.cargoWeight);
        const isTon = String(formData.cargoWeight).toLowerCase().includes('ton') || String(formData.cargoWeight).toLowerCase().includes('t');
        const weightKg = isTon ? weightNum * 1000 : weightNum;
        const capKg = vehicleObj.capacityKg || 20000;
        if (weightKg > capKg) {
          tempErrors.cargoWeight = `Cargo load weight (${formData.cargoWeight}) exceeds vehicle capacity (${capKg / 1000} Tons / ${capKg} kg)!`;
        }
      }
    }

    if (formData.driverId) {
      const driverObj = drivers.find(d => d.id === formData.driverId);
      if (driverObj) {
        // Expired License Check
        const isExpired = driverObj.licenseExpiry && new Date(driverObj.licenseExpiry) < new Date();
        if (isExpired) {
          tempErrors.driverId = `Driver's license (${driverObj.license}) is expired since ${driverObj.licenseExpiry}. Cannot assign!`;
        } else if (driverObj.status === 'Suspended') {
          tempErrors.driverId = 'Selected driver is Suspended. Licensing audit failed.';
        } else if (driverObj.status === 'On Trip' && !isEdit) {
          tempErrors.driverId = 'Selected driver is On Duty / On Trip. Unavailable.';
        }
      }
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast.error("Availability audit failed. Correct warnings.");
      return;
    }

    setIsSaving(true);
    try {
      if (isEdit) {
        await tripService.update(tripId, formData);
        showToast.success("Dispatch route details modified");
      } else {
        // Create trip
        await tripService.create(formData);
        
        // Dynamically update driver and vehicle statuses to "On Trip" if active!
        if (formData.status === 'Active') {
          await Promise.all([
            vehicleService.update(formData.vehicleId, { status: 'On Trip', assignedDriverId: formData.driverId, assignedTripId: `T${formData.id}` }),
            driverService.update(formData.driverId, { status: 'On Trip' })
          ]);
        }
        showToast.success("Dispatch cargo route initialized!");
      }
      onSave();
      onClose();
    } catch (err) {
      showToast.error(err.response?.data?.error || "Failed to save dispatch log");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-[1.5px] select-none text-left">
      <div className="bg-card border border-border w-full max-w-lg rounded-2xl shadow-xl flex flex-col max-h-[85vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/80 bg-hover/10">
          <div>
            <h3 className="text-sm font-black text-text-main uppercase tracking-wider">
              {isEdit ? 'Modify Dispatch Route' : 'Dispatch Logistics Trip'}
            </h3>
            <p className="text-[11px] text-text-secondary font-semibold">
              Create route cargo parameters and verify operator licensing
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-text-secondary hover:text-text-main hover:bg-hover transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-info" />
            <span className="text-xs text-text-secondary font-bold uppercase">Loading dispatches...</span>
          </div>
        ) : (
          <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
            
            {/* Vehicle Selection dropdown */}
            <div className="space-y-1">
              <label className="text-xs text-text-secondary font-semibold">Assigned Fleet Vehicle *</label>
              <select
                value={formData.vehicleId}
                onChange={(e) => handleInputChange('vehicleId', e.target.value)}
                className={`w-full text-xs font-semibold bg-card border rounded-lg p-2.5 text-text-main focus:outline-none focus:ring-1 focus:ring-info ${errors.vehicleId ? 'border-danger' : 'border-border'}`}
              >
                <option value="">Choose Vehicle</option>
                {vehicles.filter(v => v.status === 'Available' || (isEdit && v.id === formData.vehicleId)).map(v => (
                  <option key={v.id} value={v.id}>
                    {v.plateNumber} — {v.make} {v.model} ({v.status})
                  </option>
                ))}
              </select>
              {errors.vehicleId && (
                <span className="text-[10px] text-danger font-bold flex items-center gap-1 mt-1 bg-danger/5 p-1 rounded border border-danger/10">
                  <AlertTriangle size={10} />
                  {errors.vehicleId}
                </span>
              )}
            </div>

            {/* Driver Selection dropdown */}
            <div className="space-y-1">
              <label className="text-xs text-text-secondary font-semibold">On-Duty Driver *</label>
              <select
                value={formData.driverId}
                onChange={(e) => handleInputChange('driverId', e.target.value)}
                className={`w-full text-xs font-semibold bg-card border rounded-lg p-2.5 text-text-main focus:outline-none focus:ring-1 focus:ring-info ${errors.driverId ? 'border-danger' : 'border-border'}`}
              >
                <option value="">Choose Driver</option>
                {drivers.filter(d => {
                  const isExpired = d.licenseExpiry && new Date(d.licenseExpiry) < new Date();
                  return (d.status === 'Available' && !isExpired) || (isEdit && d.id === formData.driverId);
                }).map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.status})
                  </option>
                ))}
              </select>
              {errors.driverId && (
                <span className="text-[10px] text-danger font-bold flex items-center gap-1 mt-1 bg-danger/5 p-1 rounded border border-danger/10">
                  <AlertTriangle size={10} />
                  {errors.driverId}
                </span>
              )}
            </div>

            {/* Origin & Destination */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-text-secondary font-semibold">Origin Hub *</label>
                <Input
                  required
                  value={formData.origin}
                  onChange={(e) => handleInputChange('origin', e.target.value)}
                  className={`text-xs ${errors.origin ? 'border-danger' : ''}`}
                  placeholder="e.g. Austin, TX"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-text-secondary font-semibold">Destination Hub *</label>
                <Input
                  required
                  value={formData.destination}
                  onChange={(e) => handleInputChange('destination', e.target.value)}
                  className={`text-xs ${errors.destination ? 'border-danger' : ''}`}
                  placeholder="e.g. Dallas, TX"
                />
              </div>
            </div>

            {/* Route specifics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-text-secondary font-semibold">Distance (km)</label>
                <Input
                  type="number"
                  value={formData.distance}
                  onChange={(e) => handleInputChange('distance', e.target.value)}
                  className={`text-xs ${errors.distance ? 'border-danger' : ''}`}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-text-secondary font-semibold">Cargo Load Weight *</label>
                <Input
                  value={formData.cargoWeight}
                  onChange={(e) => handleInputChange('cargoWeight', e.target.value)}
                  className={`text-xs ${errors.cargoWeight ? 'border-danger' : ''}`}
                  placeholder="e.g. 5 Tons"
                />
                {errors.cargoWeight && (
                  <span className="text-[10px] text-danger font-bold flex items-center gap-1 mt-1 bg-danger/5 p-1 rounded border border-danger/10">
                    <AlertTriangle size={10} />
                    {errors.cargoWeight}
                  </span>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-xs text-text-secondary font-semibold">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full text-xs font-semibold bg-card border border-border rounded-lg p-2.5 text-text-main focus:outline-none focus:ring-1 focus:ring-info"
                >
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

          </form>
        )}

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-hover/10 flex items-center justify-between">
          <span className="text-[9px] font-bold text-text-secondary uppercase">
            * Assets availability verified dynamically
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" type="button" onClick={onClose} className="text-xs px-4">Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleFormSubmit} isLoading={isSaving} className="text-xs px-4">
              {isEdit ? 'Save Changes' : 'Dispatch Cargo'}
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TripModal;
