import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Save,
  UploadCloud,
  FileText,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import ImageUpload from '../../../components/ui/ImageUpload';
import { vehicleService } from '../../../services/vehicleService';
import { showToast } from '../../../components/ui/Toast';

const VEHICLE_TYPES = ['Heavy Truck', 'Box Truck', 'Light Cargo', 'Van', 'Mini'];
const FUEL_TYPES = ['Diesel', 'Gasoline', 'CNG', 'Electric'];

const INITIAL_FORM_STATE = {
  plateNumber: '',
  make: '',
  model: '',
  year: new Date().getFullYear(),
  type: 'Light Cargo',
  fuelType: 'Diesel',
  color: '',
  carrierCap: '1.5 Tons',
  capacityKg: 1500,
  vin: '',
  engineNumber: '',
  chassisNumber: '',
  odometer: 0,
  transmission: 'Automatic',
  purchaseCost: 0,
  purchaseDate: new Date().toISOString().split('T')[0],
  insuranceNumber: '',
  insuranceExpiry: '',
  fitnessExpiry: '',
  pucExpiry: '',
  permitNumber: '',
  permitExpiry: ''
};

const VehicleForm = ({ vehicleId, onSave, onCancel }) => {
  const isEditMode = !!vehicleId;
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [vehiclesList, setVehiclesList] = useState([]);
  
  // Mock file attachments
  const [uploadedFiles, setUploadedFiles] = useState([]);

  useEffect(() => {
    loadVehicles();
    if (isEditMode) {
      loadVehicleData();
    }
  }, [vehicleId]);

  const loadVehicles = async () => {
    try {
      const all = await vehicleService.getAll();
      setVehiclesList(all);
    } catch (err) {
      console.error(err);
    }
  };

  const loadVehicleData = async () => {
    setLoading(true);
    try {
      const data = await vehicleService.getById(vehicleId);
      setFormData(data);
      // Populate mock files if they exist in source
      if (data.files) {
        setUploadedFiles(data.files);
      }
    } catch (err) {
      showToast.error('Failed to load vehicle data');
      onCancel();
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, val) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: val };
      
      // Auto-compute numeric capacity if capacity string changes (optional convenience helper)
      if (field === 'carrierCap') {
        const clean = val.toLowerCase();
        let kg = 1500;
        if (clean.includes('ton')) {
          const num = parseFloat(clean);
          kg = isNaN(num) ? 1500 : num * 1000;
        } else if (clean.includes('kg')) {
          const num = parseInt(clean);
          kg = isNaN(num) ? 1500 : num;
        }
        updated.capacityKg = kg;
      }
      return updated;
    });

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  // Validations per step
  const validateStep = (currentStep) => {
    const stepErrors = {};
    const plateRegex = /^[A-Z0-9-]{3,15}$/i;

    if (currentStep === 1) {
      if (!formData.plateNumber.trim()) {
        stepErrors.plateNumber = 'Registration plate number is required';
      } else if (!plateRegex.test(formData.plateNumber)) {
        stepErrors.plateNumber = 'Invalid plate format (alphanumeric and dashes only, 3-15 chars)';
      } else {
        // Unique Check
        const isDuplicate = vehiclesList.some(v => 
          v.plateNumber.toLowerCase() === formData.plateNumber.toLowerCase() && v.id !== vehicleId
        );
        if (isDuplicate) {
          stepErrors.plateNumber = 'This Registration Number is already registered in the database';
        }
      }

      if (!formData.make.trim()) stepErrors.make = 'Manufacturer brand is required';
      if (!formData.model.trim()) stepErrors.model = 'Vehicle model name is required';
      if (!formData.year || formData.year < 1980 || formData.year > new Date().getFullYear() + 1) {
        stepErrors.year = 'Enter a valid manufacture year (1980 - current year)';
      }
      if (!formData.carrierCap.trim()) stepErrors.carrierCap = 'Load capacity string is required (e.g. 5 Tons, 500 kg)';
      if (Number(formData.capacityKg) <= 0) {
        stepErrors.capacityKg = 'Cargo weight capacity in kg must be a positive numeric value';
      }
    }

    if (currentStep === 2) {
      if (!formData.vin.trim()) {
        stepErrors.vin = 'Vehicle Identification Number (VIN) is required';
      } else if (formData.vin.trim().length !== 17) {
        stepErrors.vin = 'VIN must be exactly 17 characters';
      } else {
        // Unique Check
        const isDuplicate = vehiclesList.some(v => 
          v.vin.toLowerCase() === formData.vin.toLowerCase() && v.id !== vehicleId
        );
        if (isDuplicate) {
          stepErrors.vin = 'This VIN is already registered to another asset';
        }
      }
      if (!formData.engineNumber.trim()) stepErrors.engineNumber = 'Engine serial number is required';
      if (!formData.chassisNumber.trim()) stepErrors.chassisNumber = 'Chassis serial number is required';
      if (formData.odometer === '' || Number(formData.odometer) < 0) {
        stepErrors.odometer = 'Odometer reading must be a positive number';
      }
      if (formData.purchaseCost === '' || Number(formData.purchaseCost) < 0) {
        stepErrors.purchaseCost = 'Purchase cost must be a positive value';
      }
      if (!formData.purchaseDate) {
        stepErrors.purchaseDate = 'Purchase date is required';
      } else if (new Date(formData.purchaseDate) > new Date()) {
        stepErrors.purchaseDate = 'Purchase date cannot be set in the future';
      }
    }

    if (currentStep === 3) {
      if (!formData.insuranceNumber.trim()) stepErrors.insuranceNumber = 'Insurance policy number is required';
      if (!formData.insuranceExpiry) stepErrors.insuranceExpiry = 'Insurance expiry date is required';
      if (!formData.fitnessExpiry) stepErrors.fitnessExpiry = 'Fitness certificate expiry date is required';
      if (!formData.pucExpiry) stepErrors.pucExpiry = 'PUC certificate expiry date is required';
      if (!formData.permitNumber.trim()) stepErrors.permitNumber = 'Permit license number is required';
      if (!formData.permitExpiry) stepErrors.permitExpiry = 'Permit expiry date is required';
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
    } else {
      showToast.error('Please correct errors on the current form step before proceeding');
    }
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = files.map(file => ({
      name: file.name,
      status: 'Uploaded',
      url: '#'
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
    showToast.success(`${files.length} document(s) attached`);
  };

  const handleFileRemove = (index) => {
    setUploadedFiles(prev => prev.filter((_, idx) => idx !== index));
    showToast.success('Attachment removed');
  };

  const handleVehicleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const mockUrl = URL.createObjectURL(file);
      handleInputChange('image', mockUrl);
      showToast.success('Vehicle image uploaded');
    }
  };

  const handleRemoveVehicleImage = () => {
    handleInputChange('image', null);
    showToast.success('Vehicle image removed');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      showToast.error('Please resolve validation issues in previous steps');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        odometer: Number(formData.odometer),
        purchaseCost: Number(formData.purchaseCost),
        capacityKg: Number(formData.capacityKg),
        files: uploadedFiles
      };

      if (isEditMode) {
        await vehicleService.update(vehicleId, payload);
        showToast.success('Vehicle asset updated successfully');
      } else {
        await vehicleService.create(payload);
        showToast.success('New vehicle asset registered successfully');
      }
      onSave && onSave();
    } catch (err) {
      showToast.error(err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  // Compliance Alerts check on final review step
  const complianceWarnings = React.useMemo(() => {
    const warnings = [];
    const now = new Date();
    const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    if (formData.insuranceExpiry && new Date(formData.insuranceExpiry) < thirtyDays) {
      warnings.push(`Insurance policy expires soon or is already expired (${formData.insuranceExpiry})`);
    }
    if (formData.fitnessExpiry && new Date(formData.fitnessExpiry) < thirtyDays) {
      warnings.push(`Fitness safety certificate expires soon or is expired (${formData.fitnessExpiry})`);
    }
    if (formData.permitExpiry && new Date(formData.permitExpiry) < thirtyDays) {
      warnings.push(`National carrier permit expires soon or is expired (${formData.permitExpiry})`);
    }
    return warnings;
  }, [formData]);

  const stepLabels = ['Basic Info', 'Technical Specs', 'Compliance', 'Documents', 'Review & Save'];

  if (loading && isEditMode && step === 1 && formData.plateNumber === '') {
    return (
      <div className="flex flex-col items-center justify-center h-48 space-y-2">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-info" />
        <span className="text-xs text-text-secondary font-bold">Fetching profile logs...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Step Progress Headers */}
      <div className="border border-border p-4 bg-hover/5 rounded-xl">
        <div className="flex justify-between items-center overflow-x-auto custom-scrollbar">
          {stepLabels.map((lbl, idx) => {
            const stepNum = idx + 1;
            const isCompleted = step > stepNum;
            const isActive = step === stepNum;
            return (
              <div key={lbl} className="flex items-center gap-2 pr-4 min-w-max">
                <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-black select-none border transition-all ${
                  isCompleted ? 'bg-success border-success text-white' :
                  isActive ? 'bg-info border-info text-white shadow-sm ring-1 ring-info' :
                  'bg-card border-border text-text-secondary'
                }`}>
                  {isCompleted ? '✓' : stepNum}
                </div>
                <span className={`text-xs font-bold transition-colors ${isActive ? 'text-info' : isCompleted ? 'text-text-main' : 'text-text-secondary'}`}>
                  {lbl}
                </span>
                {stepNum < 5 && <span className="text-text-secondary/30 ml-4 font-bold">&rarr;</span>}
              </div>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-card border border-border p-6 rounded-xl shadow-sm space-y-6">
        
        {/* STEP 1: Basic Information */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="border-b border-border/60 pb-2">
              <h3 className="text-sm font-bold text-text-main uppercase tracking-wider">Basic Vehicle Parameters</h3>
              <p className="text-xs text-text-secondary">Provide general identification models and capacity profiles</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Registration Plate Number"
                required
                value={formData.plateNumber}
                onChange={(e) => handleInputChange('plateNumber', e.target.value.toUpperCase())}
                error={errors.plateNumber}
                placeholder="e.g. TX-440-AB"
              />
              <Input
                label="Vehicle Custom Name"
                required
                value={formData.model}
                onChange={(e) => handleInputChange('model', e.target.value)}
                error={errors.model}
                placeholder="e.g. Medium Box Van - 12"
              />
              <Input
                label="Manufacturer Brand"
                required
                value={formData.make}
                onChange={(e) => handleInputChange('make', e.target.value)}
                error={errors.make}
                placeholder="e.g. Volvo, Mercedes-Benz, Ford"
              />
              <Input
                label="Year of MFR"
                type="number"
                required
                value={formData.year}
                onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                error={errors.year}
              />
              
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">Vehicle Class Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="w-full text-xs font-semibold bg-card border border-border rounded-lg p-2 bg-hover/20 text-text-main focus:outline-none focus:ring-1 focus:ring-info"
                >
                  {VEHICLE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">Fuel System Type</label>
                <select
                  value={formData.fuelType}
                  onChange={(e) => handleInputChange('fuelType', e.target.value)}
                  className="w-full text-xs font-semibold bg-card border border-border rounded-lg p-2 bg-hover/20 text-text-main focus:outline-none focus:ring-1 focus:ring-info"
                >
                  {FUEL_TYPES.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>

              <Input
                label="Acquisition Load Capacity (e.g., Tons or kg)"
                required
                value={formData.carrierCap}
                onChange={(e) => handleInputChange('carrierCap', e.target.value)}
                error={errors.carrierCap}
                placeholder="e.g. 8 Tons"
              />

              <Input
                label="Raw Capacity in kg (For Trip Dispatch Checks)"
                type="number"
                required
                value={formData.capacityKg}
                onChange={(e) => handleInputChange('capacityKg', parseInt(e.target.value))}
                error={errors.capacityKg}
              />
            </div>
          </div>
        )}

        {/* STEP 2: Technical Details */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="border-b border-border/60 pb-2">
              <h3 className="text-sm font-bold text-text-main uppercase tracking-wider">Technical Specifications & Financials</h3>
              <p className="text-xs text-text-secondary">Provide engine, chassis numbers and procurement financials</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="17-Digit VIN Number"
                required
                value={formData.vin}
                onChange={(e) => handleInputChange('vin', e.target.value.toUpperCase())}
                error={errors.vin}
                placeholder="17-character alpha-numeric code"
                maxLength={17}
              />
              <Input
                label="Engine Serial Number"
                required
                value={formData.engineNumber}
                onChange={(e) => handleInputChange('engineNumber', e.target.value.toUpperCase())}
                error={errors.engineNumber}
              />
              <Input
                label="Chassis Serial Number"
                required
                value={formData.chassisNumber}
                onChange={(e) => handleInputChange('chassisNumber', e.target.value.toUpperCase())}
                error={errors.chassisNumber}
              />
              
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">Gearbox Transmission</label>
                <select
                  value={formData.transmission}
                  onChange={(e) => handleInputChange('transmission', e.target.value)}
                  className="w-full text-xs font-semibold bg-card border border-border rounded-lg p-2 bg-hover/20 text-text-main focus:outline-none focus:ring-1 focus:ring-info"
                >
                  <option value="Automatic">Automatic</option>
                  <option value="Manual">Manual</option>
                </select>
              </div>

              <Input
                label="Initial Odometer Reading (km)"
                type="number"
                required
                value={formData.odometer}
                onChange={(e) => handleInputChange('odometer', e.target.value)}
                error={errors.odometer}
              />
              <Input
                label="Procurement Acquisition Cost (INR)"
                type="number"
                required
                value={formData.purchaseCost}
                onChange={(e) => handleInputChange('purchaseCost', e.target.value)}
                error={errors.purchaseCost}
              />
              <Input
                label="Acquisition Procurement Date"
                type="date"
                required
                value={formData.purchaseDate}
                onChange={(e) => handleInputChange('purchaseDate', e.target.value)}
                error={errors.purchaseDate}
              />
            </div>
          </div>
        )}

        {/* STEP 3: Compliance Details */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="border-b border-border/60 pb-2">
              <h3 className="text-sm font-bold text-text-main uppercase tracking-wider">Compliance Licensure & Expiry Limits</h3>
              <p className="text-xs text-text-secondary">Provide valid insurance covers and carriage permits</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Insurance Policy Number"
                required
                value={formData.insuranceNumber}
                onChange={(e) => handleInputChange('insuranceNumber', e.target.value.toUpperCase())}
                error={errors.insuranceNumber}
              />
              <Input
                label="Insurance Policy Expiry"
                type="date"
                required
                value={formData.insuranceExpiry}
                onChange={(e) => handleInputChange('insuranceExpiry', e.target.value)}
                error={errors.insuranceExpiry}
              />
              <Input
                label="Road Worthiness Fitness Certificate Expiry"
                type="date"
                required
                value={formData.fitnessExpiry}
                onChange={(e) => handleInputChange('fitnessExpiry', e.target.value)}
                error={errors.fitnessExpiry}
              />
              <Input
                label="PUC Emission Certificate Expiry"
                type="date"
                required
                value={formData.pucExpiry}
                onChange={(e) => handleInputChange('pucExpiry', e.target.value)}
                error={errors.pucExpiry}
              />
              <Input
                label="Goods Carriage Permit License Number"
                required
                value={formData.permitNumber}
                onChange={(e) => handleInputChange('permitNumber', e.target.value.toUpperCase())}
                error={errors.permitNumber}
              />
              <Input
                label="Permit Certificate Expiry"
                type="date"
                required
                value={formData.permitExpiry}
                onChange={(e) => handleInputChange('permitExpiry', e.target.value)}
                error={errors.permitExpiry}
              />
            </div>
          </div>
        )}

        {/* STEP 4: Document Attachments */}
        {step === 4 && (
          <div className="space-y-6">
            {/* Vehicle Primary Image Upload */}
            <div className="space-y-3">
              <div className="border-b border-border/60 pb-2">
                <h3 className="text-sm font-bold text-text-main uppercase tracking-wider text-left">Vehicle Primary Photo</h3>
                <p className="text-xs text-text-secondary text-left">Attach a high-resolution identification photo of the vehicle asset</p>
              </div>

              <ImageUpload
                currentUrl={formData.image}
                onUpload={(url) => handleInputChange('image', url)}
                onRemove={handleRemoveVehicleImage}
                aspectRatioLabel="Recommended: 16:9 or 4:3 ratio, max 5MB"
              />
            </div>

            <div className="border-b border-border/60 pb-2">
              <h3 className="text-sm font-bold text-text-main uppercase tracking-wider">Regulatory Compliance Uploads</h3>
              <p className="text-xs text-text-secondary">Attach digital copies of registration certificates, invoices, and insurance papers</p>
            </div>

            {/* Dropzone Container */}
            <div className="border-2 border-dashed border-border hover:border-info/50 rounded-xl p-8 text-center bg-hover/5 transition-all">
              <UploadCloud size={40} className="mx-auto text-text-secondary mb-3.5" />
              <div className="space-y-1.5">
                <span className="block text-xs font-bold text-text-main">
                  Click to upload files or drag and drop here
                </span>
                <span className="block text-[10px] text-text-secondary font-semibold uppercase tracking-wider">
                  Supported formats: PDF, PNG, JPG up to 10MB
                </span>
              </div>
              <label className="mt-4 inline-block cursor-pointer">
                <input type="file" multiple onChange={handleFileUpload} className="hidden" />
                <span className="px-4 py-2 bg-card border border-border text-text-main hover:bg-hover rounded-lg text-xs font-bold shadow-sm transition-colors">
                  Select Documents
                </span>
              </label>
            </div>

            {/* File List Grid */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-3.5">
                <h4 className="text-xs font-bold text-text-main uppercase tracking-wider">Attached files ({uploadedFiles.length})</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {uploadedFiles.map((file, idx) => (
                    <div key={idx} className="border border-border p-3.5 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <FileText size={16} className="text-info flex-shrink-0" />
                        <span className="text-xs font-bold text-text-main truncate max-w-xs">{file.name}</span>
                      </div>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleFileRemove(idx)}
                        className="p-1.5"
                        aria-label="Remove Attachment"
                      >
                        <Trash2 size={13} />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 5: Final Review Summary */}
        {step === 5 && (
          <div className="space-y-6">
            <div className="border-b border-border/60 pb-2">
              <h3 className="text-sm font-bold text-text-main uppercase tracking-wider">Review Asset Registration details</h3>
              <p className="text-xs text-text-secondary">Verify technical specifications and active compliance warning flags</p>
            </div>

            {/* Compliance warning alerts */}
            {complianceWarnings.length > 0 && (
              <div className="border border-warning/30 bg-warning/5 p-4 rounded-xl space-y-2">
                <h4 className="text-xs font-black text-warning flex items-center gap-1.5 uppercase tracking-wider">
                  <AlertTriangle size={14} />
                  Compliance Expiry Warnings
                </h4>
                <ul className="list-disc pl-5 text-xs text-warning font-semibold space-y-1.5">
                  {complianceWarnings.map((warn, i) => <li key={i}>{warn}</li>)}
                </ul>
              </div>
            )}

            {/* Grid summary panels */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs border border-border/80 p-5 rounded-xl bg-hover/10">
              <div className="space-y-4">
                <h4 className="font-bold text-text-main border-b border-border/40 pb-1.5 uppercase tracking-wider text-[10px]">
                  General Specs
                </h4>
                <div className="grid grid-cols-2 gap-y-2.5 font-semibold text-text-secondary">
                  <span>Plate Number:</span>
                  <span className="text-text-main font-bold">{formData.plateNumber}</span>
                  
                  <span>Model:</span>
                  <span className="text-text-main font-bold">{formData.make} {formData.model}</span>
                  
                  <span>Vehicle Type:</span>
                  <span className="text-text-main font-bold">{formData.type}</span>
                  
                  <span>Load Limit:</span>
                  <span className="text-text-main font-bold">{formData.carrierCap} ({formData.capacityKg} kg)</span>
                  
                  <span>Fuel System:</span>
                  <span className="text-text-main font-bold">{formData.fuelType}</span>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-text-main border-b border-border/40 pb-1.5 uppercase tracking-wider text-[10px]">
                  Technical Specs & Policies
                </h4>
                <div className="grid grid-cols-2 gap-y-2.5 font-semibold text-text-secondary">
                  <span>VIN:</span>
                  <span className="text-text-main font-bold">{formData.vin}</span>
                  
                  <span>Engine / Chassis:</span>
                  <span className="text-text-main font-bold truncate">{formData.engineNumber} / {formData.chassisNumber}</span>
                  
                  <span>Odometer:</span>
                  <span className="text-text-main font-bold">{formData.odometer} km</span>
                  
                  <span>Acquisition Cost:</span>
                  <span className="text-text-main font-bold">INR {Number(formData.purchaseCost).toLocaleString()}</span>
                  
                  <span>Insurance policy:</span>
                  <span className="text-text-main font-bold">{formData.insuranceNumber}</span>
                </div>
              </div>
            </div>

            {/* Summary success badge */}
            <div className="flex items-center gap-2.5 text-xs font-bold text-success border border-success/20 bg-success/5 p-3.5 rounded-xl select-none">
              <CheckCircle size={16} />
              <span>Constraint checks passed. Ready to commit record changes to memory database.</span>
            </div>
          </div>
        )}

        {/* Wizard Navigation Footer controls */}
        <div className="flex items-center justify-between border-t border-border/60 pt-4">
          <Button
            variant="outline"
            type="button"
            onClick={step === 1 ? onCancel : handleBack}
            leftIcon={ArrowLeft}
            disabled={loading}
            className="text-xs"
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </Button>

          {step < 5 ? (
            <Button
              variant="primary"
              type="button"
              onClick={handleNext}
              rightIcon={ArrowRight}
              className="text-xs"
            >
              Continue
            </Button>
          ) : (
            <Button
              variant="primary"
              type="submit"
              isLoading={loading}
              leftIcon={Save}
              className="text-xs bg-success hover:bg-success-hover"
            >
              {isEditMode ? 'Update Asset' : 'Save Asset'}
            </Button>
          )}
        </div>

      </form>
    </div>
  );
};

export default VehicleForm;
