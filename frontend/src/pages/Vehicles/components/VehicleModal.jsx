import React, { useState, useEffect } from 'react';
import { X, Save, ShieldAlert } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import ImageUpload from '../../../components/ui/ImageUpload';
import { vehicleService } from '../../../services/vehicleService';
import { showToast } from '../../../components/ui/Toast';

const VEHICLE_TYPES = ['Heavy Truck', 'Box Truck', 'Light Cargo', 'Van', 'Mini'];
const FUEL_TYPES = ['Diesel', 'Gasoline', 'CNG', 'Electric'];
const REGIONS = ['North', 'South', 'East', 'West', 'Central'];
const STATUSES = ['Available', 'On Trip', 'Maintenance', 'Retired'];

const INITIAL_STATE = {
  plateNumber: '',
  make: '',
  model: '',
  type: 'Light Cargo',
  fuelType: 'Diesel',
  carrierCap: '1.5 Tons',
  capacityKg: 1500,
  purchaseDate: new Date().toISOString().split('T')[0],
  purchaseCost: 0,
  odometer: 0,
  fuelTankCapacity: 60,
  registrationExpiry: '',
  insuranceExpiry: '',
  fitnessExpiry: '',
  permitExpiry: '',
  pucExpiry: '',
  region: 'Central',
  status: 'Available',
  notes: '',
  image: '',
  year: new Date().getFullYear()
};

/**
 * Centered Create & Edit Vehicle Modal Dialog
 * Implements strict ERP validation rules and 20+ fields.
 */
const VehicleModal = ({ isOpen, onClose, vehicleId, onSave, vehiclesList = [] }) => {
  const isEdit = !!vehicleId;
  const [formData, setFormData] = useState(INITIAL_STATE);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setErrors({});
      if (isEdit && vehicleId) {
        loadVehicleData();
      } else {
        setFormData({
          ...INITIAL_STATE,
          purchaseDate: new Date().toISOString().split('T')[0]
        });
      }
    }
  }, [isOpen, vehicleId, isEdit]);

  const loadVehicleData = async () => {
    setLoading(true);
    try {
      const data = await vehicleService.getById(vehicleId);
      setFormData(data);
    } catch {
      showToast.error("Failed to load vehicle record parameters");
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

  // Field validation gates
  const validateForm = () => {
    const tempErrors = {};
    const plateRegex = /^[A-Z0-9-]{3,15}$/i;
    const nowStr = new Date().toISOString().split('T')[0];

    // 1. Required fields
    if (!formData.plateNumber.trim()) {
      tempErrors.plateNumber = 'Registration plate number is required';
    } else if (!plateRegex.test(formData.plateNumber)) {
      tempErrors.plateNumber = 'Alphanumeric and dashes only (3-15 chars)';
    } else {
      // Uniqueness Check
      const isDuplicate = vehiclesList.some(v => 
        v.plateNumber.toLowerCase() === formData.plateNumber.toLowerCase() && v.id !== vehicleId
      );
      if (isDuplicate) {
        tempErrors.plateNumber = 'This Registration Number is already in use';
      }
    }

    if (!formData.make.trim()) tempErrors.make = 'Manufacturer brand name is required';
    if (!formData.model.trim()) tempErrors.model = 'Model identifier is required';
    
    // 2. Numeric constraints
    if (Number(formData.capacityKg) <= 0) {
      tempErrors.capacityKg = 'Capacity must be a positive number';
    }
    if (Number(formData.odometer) < 0) {
      tempErrors.odometer = 'Odometer reading cannot be negative';
    }
    if (Number(formData.purchaseCost) < 0) {
      tempErrors.purchaseCost = 'Procurement cost cannot be negative';
    }
    if (Number(formData.fuelTankCapacity) <= 0) {
      tempErrors.fuelTankCapacity = 'Tank volume must be a positive capacity';
    }

    // 3. Purchase date constraint
    if (formData.purchaseDate && new Date(formData.purchaseDate) > new Date()) {
      tempErrors.purchaseDate = 'Purchase date cannot be set in the future';
    }

    // 4. Compliance exipires validation
    if (formData.insuranceExpiry && formData.insuranceExpiry <= nowStr) {
      tempErrors.insuranceExpiry = 'Insurance expiry must be set after today';
    }
    if (formData.permitExpiry && formData.permitExpiry <= nowStr) {
      tempErrors.permitExpiry = 'Permit expiry must be set after today';
    }
    if (formData.fitnessExpiry && formData.fitnessExpiry <= nowStr) {
      tempErrors.fitnessExpiry = 'Fitness cert expiry must be set after today';
    }
    if (formData.pucExpiry && formData.pucExpiry <= nowStr) {
      tempErrors.pucExpiry = 'PUC expiry must be set after today';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast.error("Form validation rejected. Correct red warning inputs.");
      return;
    }

    setIsSaving(true);
    try {
      // Map year field dynamically from purchaseDate
      const yearVal = formData.purchaseDate ? new Date(formData.purchaseDate).getFullYear() : new Date().getFullYear();
      const submissionData = {
        ...formData,
        year: yearVal,
        capacityKg: Number(formData.capacityKg),
        odometer: Number(formData.odometer),
        purchaseCost: Number(formData.purchaseCost),
        fuelTankCapacity: Number(formData.fuelTankCapacity)
      };

      if (isEdit) {
        await vehicleService.update(vehicleId, submissionData);
        showToast.success("Vehicle registry updated successfully");
      } else {
        await vehicleService.create(submissionData);
        showToast.success("New vehicle asset registered");
      }
      onSave();
      onClose();
    } catch (err) {
      showToast.error(err.message || "Operation failed");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-[1.5px] select-none">
      <div className="bg-card border border-border w-full max-w-3xl rounded-2xl shadow-xl flex flex-col max-h-[85vh] overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/80 bg-hover/10">
          <div className="text-left">
            <h3 className="text-sm font-black text-text-main uppercase tracking-wider">
              {isEdit ? 'Modify Vehicle Parameters' : 'Register New Fleet Asset'}
            </h3>
            <p className="text-[11px] text-text-secondary font-semibold">
              Fill in technical details, acquisitions cost, and compliance policy schedules
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-text-secondary hover:text-text-main hover:bg-hover transition-colors"
            aria-label="Close Modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Form Content */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-info" />
            <span className="text-xs text-text-secondary font-bold uppercase tracking-wider">Loading specs...</span>
          </div>
        ) : (
          <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            
            {/* Section 1: Asset Image */}
            <div className="space-y-2">
              <span className="block text-xs font-bold text-text-main uppercase tracking-wider text-left">Primary Asset Image</span>
              <ImageUpload
                currentUrl={formData.image}
                onUpload={(url) => handleInputChange('image', url)}
                onRemove={() => handleInputChange('image', '')}
                aspectRatioLabel="Upload a photo of the vehicle. Max 5MB."
              />
            </div>

            {/* Section 2: General Info */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-text-secondary uppercase tracking-widest border-b border-border/60 pb-1 text-left">
                General Registry Specifications
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-left space-y-1">
                  <label className="text-xs text-text-secondary font-semibold">Registration Number *</label>
                  <Input
                    required
                    value={formData.plateNumber}
                    onChange={(e) => handleInputChange('plateNumber', e.target.value.toUpperCase())}
                    className={`text-xs ${errors.plateNumber ? 'border-danger focus:ring-danger/25' : ''}`}
                    placeholder="e.g. TX-101-AB"
                  />
                  {errors.plateNumber && <span className="text-[10px] text-danger font-bold block">{errors.plateNumber}</span>}
                </div>
                <div className="text-left space-y-1">
                  <label className="text-xs text-text-secondary font-semibold">Vehicle Name *</label>
                  <Input
                    required
                    value={formData.model}
                    onChange={(e) => handleInputChange('model', e.target.value)}
                    className="text-xs"
                    placeholder="e.g. Super Carrier 400"
                  />
                </div>
                <div className="text-left space-y-1">
                  <label className="text-xs text-text-secondary font-semibold">Manufacturer *</label>
                  <Input
                    required
                    value={formData.make}
                    onChange={(e) => handleInputChange('make', e.target.value)}
                    className="text-xs"
                    placeholder="e.g. Tata Motors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-left space-y-1">
                  <label className="text-xs text-text-secondary font-semibold">Asset Region</label>
                  <select
                    value={formData.region}
                    onChange={(e) => handleInputChange('region', e.target.value)}
                    className="w-full text-xs font-semibold bg-card border border-border rounded-lg p-2.5 text-text-main focus:outline-none focus:ring-1 focus:ring-info"
                  >
                    {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="text-left space-y-1">
                  <label className="text-xs text-text-secondary font-semibold">Asset Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full text-xs font-semibold bg-card border border-border rounded-lg p-2.5 text-text-main focus:outline-none focus:ring-1 focus:ring-info"
                  >
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="text-left space-y-1">
                  <label className="text-xs text-text-secondary font-semibold">Vehicle Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    className="w-full text-xs font-semibold bg-card border border-border rounded-lg p-2.5 text-text-main focus:outline-none focus:ring-1 focus:ring-info"
                  >
                    {VEHICLE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Section 3: Technical Details */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-text-secondary uppercase tracking-widest border-b border-border/60 pb-1 text-left">
                Technical & Engine Parameters
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-left space-y-1">
                  <label className="text-xs text-text-secondary font-semibold">Fuel Type</label>
                  <select
                    value={formData.fuelType}
                    onChange={(e) => handleInputChange('fuelType', e.target.value)}
                    className="w-full text-xs font-semibold bg-card border border-border rounded-lg p-2.5 text-text-main focus:outline-none focus:ring-1 focus:ring-info"
                  >
                    {FUEL_TYPES.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div className="text-left space-y-1">
                  <label className="text-xs text-text-secondary font-semibold">Tank Capacity (L)</label>
                  <Input
                    type="number"
                    value={formData.fuelTankCapacity}
                    onChange={(e) => handleInputChange('fuelTankCapacity', e.target.value)}
                    className={`text-xs ${errors.fuelTankCapacity ? 'border-danger' : ''}`}
                  />
                  {errors.fuelTankCapacity && <span className="text-[9px] text-danger font-bold block">{errors.fuelTankCapacity}</span>}
                </div>
                <div className="text-left space-y-1">
                  <label className="text-xs text-text-secondary font-semibold">Max Capacity (kg) *</label>
                  <Input
                    type="number"
                    required
                    value={formData.capacityKg}
                    onChange={(e) => {
                      const val = e.target.value;
                      handleInputChange('capacityKg', val);
                      // Update carrierCap automatically
                      handleInputChange('carrierCap', val >= 1000 ? `${(val / 1000).toFixed(1)} Tons` : `${val} kg`);
                    }}
                    className={`text-xs ${errors.capacityKg ? 'border-danger' : ''}`}
                  />
                  {errors.capacityKg && <span className="text-[9px] text-danger font-bold block">{errors.capacityKg}</span>}
                </div>
                <div className="text-left space-y-1">
                  <label className="text-xs text-text-secondary font-semibold">Current Odometer (km)</label>
                  <Input
                    type="number"
                    value={formData.odometer}
                    onChange={(e) => handleInputChange('odometer', e.target.value)}
                    className={`text-xs ${errors.odometer ? 'border-danger' : ''}`}
                  />
                  {errors.odometer && <span className="text-[9px] text-danger font-bold block">{errors.odometer}</span>}
                </div>
              </div>
            </div>

            {/* Section 4: Acquisition Details */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-text-secondary uppercase tracking-widest border-b border-border/60 pb-1 text-left">
                Acquisition Procurement Costs
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-left space-y-1">
                  <label className="text-xs text-text-secondary font-semibold">Purchase Date *</label>
                  <Input
                    type="date"
                    required
                    value={formData.purchaseDate}
                    onChange={(e) => handleInputChange('purchaseDate', e.target.value)}
                    className={`text-xs ${errors.purchaseDate ? 'border-danger' : ''}`}
                  />
                  {errors.purchaseDate && <span className="text-[9px] text-danger font-bold block">{errors.purchaseDate}</span>}
                </div>
                <div className="text-left space-y-1">
                  <label className="text-xs text-text-secondary font-semibold">Acquisition Cost (INR)</label>
                  <Input
                    type="number"
                    value={formData.purchaseCost}
                    onChange={(e) => handleInputChange('purchaseCost', e.target.value)}
                    className={`text-xs ${errors.purchaseCost ? 'border-danger' : ''}`}
                  />
                  {errors.purchaseCost && <span className="text-[9px] text-danger font-bold block">{errors.purchaseCost}</span>}
                </div>
              </div>
            </div>

            {/* Section 5: Compliance schedules */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-text-secondary uppercase tracking-widest border-b border-border/60 pb-1 text-left">
                Regulatory Policy Expiration Schedules
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-left space-y-1">
                  <label className="text-xs text-text-secondary font-semibold">Registration Expiry</label>
                  <Input
                    type="date"
                    value={formData.registrationExpiry}
                    onChange={(e) => handleInputChange('registrationExpiry', e.target.value)}
                    className="text-xs"
                  />
                </div>
                <div className="text-left space-y-1">
                  <label className="text-xs text-text-secondary font-semibold">Insurance Expiry</label>
                  <Input
                    type="date"
                    value={formData.insuranceExpiry}
                    onChange={(e) => handleInputChange('insuranceExpiry', e.target.value)}
                    className={`text-xs ${errors.insuranceExpiry ? 'border-danger' : ''}`}
                  />
                  {errors.insuranceExpiry && <span className="text-[9px] text-danger font-bold block">{errors.insuranceExpiry}</span>}
                </div>
                <div className="text-left space-y-1">
                  <label className="text-xs text-text-secondary font-semibold">Fitness Certificate Expiry</label>
                  <Input
                    type="date"
                    value={formData.fitnessExpiry}
                    onChange={(e) => handleInputChange('fitnessExpiry', e.target.value)}
                    className={`text-xs ${errors.fitnessExpiry ? 'border-danger' : ''}`}
                  />
                  {errors.fitnessExpiry && <span className="text-[9px] text-danger font-bold block">{errors.fitnessExpiry}</span>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-left space-y-1">
                  <label className="text-xs text-text-secondary font-semibold">Permit Expiry</label>
                  <Input
                    type="date"
                    value={formData.permitExpiry}
                    onChange={(e) => handleInputChange('permitExpiry', e.target.value)}
                    className={`text-xs ${errors.permitExpiry ? 'border-danger' : ''}`}
                  />
                  {errors.permitExpiry && <span className="text-[9px] text-danger font-bold block">{errors.permitExpiry}</span>}
                </div>
                <div className="text-left space-y-1">
                  <label className="text-xs text-text-secondary font-semibold">PUC Emission Expiry</label>
                  <Input
                    type="date"
                    value={formData.pucExpiry}
                    onChange={(e) => handleInputChange('pucExpiry', e.target.value)}
                    className={`text-xs ${errors.pucExpiry ? 'border-danger' : ''}`}
                  />
                  {errors.pucExpiry && <span className="text-[9px] text-danger font-bold block">{errors.pucExpiry}</span>}
                </div>
              </div>
            </div>

            {/* Notes Textarea */}
            <div className="text-left space-y-1">
              <label className="text-xs text-text-secondary font-semibold">Registry Log Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                className="w-full text-xs bg-hover/10 border border-border rounded-lg p-2.5 text-text-main focus:outline-none focus:ring-1 focus:ring-info h-20 resize-none"
                placeholder="Enter additional asset descriptions..."
              />
            </div>
          </form>
        )}

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-border bg-hover/10 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-text-secondary">
            <ShieldAlert size={14} />
            <span className="text-[9px] uppercase font-black tracking-wider">* Indicates fields are validation audited</span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={onClose}
              className="text-xs px-4"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              onClick={handleFormSubmit}
              isLoading={isSaving}
              leftIcon={Save}
              className="text-xs px-4"
            >
              {isEdit ? 'Save Changes' : 'Register Vehicle'}
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default VehicleModal;
