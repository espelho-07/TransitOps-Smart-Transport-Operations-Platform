import React, { useState, useEffect } from 'react';
import { X, Save, ShieldAlert } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import ImageUpload from '../../../components/ui/ImageUpload';
import { driverService } from '../../../services/driverService';
import { showToast } from '../../../components/ui/Toast';

const STATUSES = ['Available', 'On Trip', 'Suspended'];

const INITIAL_STATE = {
  name: '',
  email: '',
  phone: '',
  licenseNumber: '',
  status: 'Available',
  ratings: '5.0',
  hireDate: new Date().toISOString().split('T')[0],
  avatar: ''
};

/**
 * Centered modal form for creating or editing driver parameters.
 */
const DriverModal = ({ isOpen, onClose, driverId, onSave, driversList = [] }) => {
  const isEdit = !!driverId;
  const [formData, setFormData] = useState(INITIAL_STATE);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setErrors({});
      if (isEdit && driverId) {
        loadDriverData();
      } else {
        setFormData({
          ...INITIAL_STATE,
          hireDate: new Date().toISOString().split('T')[0]
        });
      }
    }
  }, [isOpen, driverId, isEdit]);

  const loadDriverData = async () => {
    setLoading(true);
    try {
      const data = await driverService.getById(driverId);
      setFormData(data);
    } catch {
      showToast.error("Failed to load driver profile parameters");
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
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[0-9\s-()]{7,15}$/;

    if (!formData.name.trim()) tempErrors.name = 'Driver full name is required';
    
    if (!formData.email.trim()) {
      tempErrors.email = 'Email address is required';
    } else if (!emailRegex.test(formData.email)) {
      tempErrors.email = 'Enter a valid email format';
    }

    if (!formData.phone.trim()) {
      tempErrors.phone = 'Phone number is required';
    } else if (!phoneRegex.test(formData.phone)) {
      tempErrors.phone = 'Enter a valid phone format';
    }

    if (!formData.licenseNumber.trim()) {
      tempErrors.licenseNumber = 'Commercial driver license is required';
    } else {
      // Uniqueness check
      const isDuplicate = driversList.some(d => 
        d.licenseNumber.toLowerCase() === formData.licenseNumber.toLowerCase() && d.id !== driverId
      );
      if (isDuplicate) {
        tempErrors.licenseNumber = 'This CDL License Number is already registered';
      }
    }

    if (Number(formData.ratings) < 1.0 || Number(formData.ratings) > 5.0) {
      tempErrors.ratings = 'Rating must be between 1.0 and 5.0';
    }

    if (!formData.hireDate) {
      tempErrors.hireDate = 'Hiring date selection is required';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast.error("Please correct warning validation errors.");
      return;
    }

    setIsSaving(true);
    try {
      if (isEdit) {
        await driverService.update(driverId, formData);
        showToast.success("Driver credentials updated");
      } else {
        await driverService.create(formData);
        showToast.success("New driver profile registered");
      }
      onSave();
      onClose();
    } catch {
      showToast.error("Operation failed");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-[1.5px] select-none text-left">
      <div className="bg-card border border-border w-full max-w-xl rounded-2xl shadow-xl flex flex-col max-h-[85vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/80 bg-hover/10">
          <div>
            <h3 className="text-sm font-black text-text-main uppercase tracking-wider">
              {isEdit ? 'Modify Driver Workspace' : 'Add Commercial Driver'}
            </h3>
            <p className="text-[11px] text-text-secondary font-semibold">
              Register commercial credentials and profile photos
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-text-secondary hover:text-text-main hover:bg-hover transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-info" />
            <span className="text-xs text-text-secondary font-bold uppercase">Loading profiles...</span>
          </div>
        ) : (
          <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
            
            {/* circular avatar uploader */}
            <div className="space-y-2">
              <span className="block text-xs font-bold text-text-main uppercase tracking-wider">Profile Photo</span>
              <div className="flex justify-start">
                <ImageUpload
                  currentUrl={formData.avatar}
                  onUpload={(url) => handleInputChange('avatar', url)}
                  onRemove={() => handleInputChange('avatar', '')}
                  aspectRatioLabel="Upload a clear headshot image. Max 5MB."
                />
              </div>
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-text-secondary font-semibold">Full Name *</label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`text-xs ${errors.name ? 'border-danger' : ''}`}
                  placeholder="e.g. Robert Smith"
                />
                {errors.name && <span className="text-[10px] text-danger font-bold block">{errors.name}</span>}
              </div>

              <div className="space-y-1">
                <label className="text-xs text-text-secondary font-semibold">Email Address *</label>
                <Input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value.toLowerCase())}
                  className={`text-xs ${errors.email ? 'border-danger' : ''}`}
                  placeholder="e.g. robert.smith@transitops.com"
                />
                {errors.email && <span className="text-[10px] text-danger font-bold block">{errors.email}</span>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-text-secondary font-semibold">Phone Number *</label>
                <Input
                  required
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={`text-xs ${errors.phone ? 'border-danger' : ''}`}
                  placeholder="e.g. +1 (555) 019-2834"
                />
                {errors.phone && <span className="text-[10px] text-danger font-bold block">{errors.phone}</span>}
              </div>

              <div className="space-y-1">
                <label className="text-xs text-text-secondary font-semibold">CDL License Number *</label>
                <Input
                  required
                  value={formData.licenseNumber}
                  onChange={(e) => handleInputChange('licenseNumber', e.target.value.toUpperCase())}
                  className={`text-xs ${errors.licenseNumber ? 'border-danger' : ''}`}
                  placeholder="e.g. DL-CA99201"
                />
                {errors.licenseNumber && <span className="text-[10px] text-danger font-bold block">{errors.licenseNumber}</span>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-text-secondary font-semibold">Safety Score (1-5)</label>
                <Input
                  type="number"
                  step="0.1"
                  min="1.0"
                  max="5.0"
                  value={formData.ratings}
                  onChange={(e) => handleInputChange('ratings', e.target.value)}
                  className={`text-xs ${errors.ratings ? 'border-danger' : ''}`}
                />
                {errors.ratings && <span className="text-[9px] text-danger font-bold block">{errors.ratings}</span>}
              </div>

              <div className="space-y-1">
                <label className="text-xs text-text-secondary font-semibold">Hiring Date *</label>
                <Input
                  type="date"
                  required
                  value={formData.hireDate}
                  onChange={(e) => handleInputChange('hireDate', e.target.value)}
                  className={`text-xs ${errors.hireDate ? 'border-danger' : ''}`}
                />
                {errors.hireDate && <span className="text-[10px] text-danger font-bold block">{errors.hireDate}</span>}
              </div>

              <div className="space-y-1">
                <label className="text-xs text-text-secondary font-semibold">Operational Status</label>
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
          <div className="flex items-center gap-1.5 text-text-secondary">
            <ShieldAlert size={14} />
            <span className="text-[9px] uppercase font-bold tracking-wider">* CDL registration is audited</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" type="button" onClick={onClose} className="text-xs px-4">Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleFormSubmit} isLoading={isSaving} className="text-xs px-4">
              {isEdit ? 'Save Changes' : 'Add Driver'}
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DriverModal;
