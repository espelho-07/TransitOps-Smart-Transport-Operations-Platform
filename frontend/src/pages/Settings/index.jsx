import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Save,
  Globe,
  Bell,
  Palette,
  Shield,
  Building,
  CheckCircle
} from 'lucide-react';
import PageContainer from '../../components/ui/PageContainer';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { showToast } from '../../components/ui/Toast';

const Settings = () => {
  const { currentUser } = useAuth();
  const { theme, changeTheme } = useTheme();

  const [companyInfo, setCompanyInfo] = useState({
    name: 'TransitOps Logistics Ltd',
    timezone: 'UTC +05:30 (India Standard Time)',
    currency: 'USD ($)',
    unit: 'Kilometers (km)'
  });

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    tripDispatches: true,
    maintenanceAlerts: true,
    fuelReports: false
  });

  const handleCompanyChange = (field, val) => {
    setCompanyInfo(prev => ({ ...prev, [field]: val }));
  };

  const handleNotifToggle = (field) => {
    setNotifications(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSave = () => {
    showToast.success('System settings saved successfully!');
  };

  return (
    <PageContainer>
      <div className="space-y-6 select-none text-left max-w-4xl">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Settings Left Column */}
          <div className="md:col-span-1 space-y-4">
            <div className="bg-card border border-border rounded-xl p-4">
              <h4 className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-3">Settings Panel</h4>
              <p className="text-xs text-text-secondary leading-relaxed">
                Configure tenant company structures, active local formats, default alert triggers, and display layouts.
              </p>
            </div>
          </div>

          {/* Settings Right Form Blocks */}
          <div className="md:col-span-2 space-y-6">
            
            {/* 1. Company Settings */}
            <div className="bg-card border border-border rounded-xl p-5 space-y-4">
              <h4 className="text-[11px] font-black text-text-main uppercase tracking-wider flex items-center gap-2 border-b border-border/60 pb-2">
                <Building size={15} className="text-info" /> Company Information
              </h4>

              <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-text-secondary">
                <div className="flex flex-col gap-1.5 col-span-2">
                  <label className="text-[10px] uppercase font-bold text-text-secondary">Organization name</label>
                  <input
                    type="text"
                    value={companyInfo.name}
                    onChange={e => handleCompanyChange('name', e.target.value)}
                    className="bg-background text-text-main border border-border rounded-lg px-3.5 py-1.5 focus:outline-none focus:border-info font-bold"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold text-text-secondary">System timezone</label>
                  <input
                    type="text"
                    value={companyInfo.timezone}
                    onChange={e => handleCompanyChange('timezone', e.target.value)}
                    className="bg-background text-text-main border border-border rounded-lg px-3.5 py-1.5 focus:outline-none focus:border-info"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold text-text-secondary">Currency standard</label>
                  <select
                    value={companyInfo.currency}
                    onChange={e => handleCompanyChange('currency', e.target.value)}
                    className="bg-background text-text-main border border-border rounded-lg px-3 py-1.5 focus:outline-none focus:border-info"
                  >
                    <option value="USD ($)">USD ($)</option>
                    <option value="EUR (€)">EUR (€)</option>
                    <option value="INR (₹)">INR (₹)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 2. Theme Customization */}
            <div className="bg-card border border-border rounded-xl p-5 space-y-4">
              <h4 className="text-[11px] font-black text-text-main uppercase tracking-wider flex items-center gap-2 border-b border-border/60 pb-2">
                <Palette size={15} className="text-info" /> Display Theme preferences
              </h4>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { key: 'light', label: 'Light Mode' },
                  { key: 'dark', label: 'Dark Mode' },
                  { key: 'system', label: 'System Default' }
                ].map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => changeTheme(opt.key)}
                    className={`border px-4 py-3 rounded-lg text-xs font-bold transition-all text-center flex flex-col items-center justify-center gap-1.5 ${
                      theme === opt.key 
                        ? 'border-info bg-info/10 text-info font-black shadow-sm' 
                        : 'border-border text-text-secondary bg-card hover:bg-hover hover:text-text-main'
                    }`}
                  >
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Alerts & Notifications */}
            <div className="bg-card border border-border rounded-xl p-5 space-y-4">
              <h4 className="text-[11px] font-black text-text-main uppercase tracking-wider flex items-center gap-2 border-b border-border/60 pb-2">
                <Bell size={15} className="text-info" /> Operations Notifications Settings
              </h4>

              <div className="space-y-3.5 text-xs font-bold text-text-main">
                <label className="flex items-center justify-between cursor-pointer">
                  <span>Send operational summary alerts via Email</span>
                  <input
                    type="checkbox"
                    checked={notifications.emailAlerts}
                    onChange={() => handleNotifToggle('emailAlerts')}
                    className="h-4 w-4 text-info rounded border-border"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span>Active trip dispatch trigger alerts</span>
                  <input
                    type="checkbox"
                    checked={notifications.tripDispatches}
                    onChange={() => handleNotifToggle('tripDispatches')}
                    className="h-4 w-4 text-info rounded border-border"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span>Urgent preventive maintenance thresholds alerts</span>
                  <input
                    type="checkbox"
                    checked={notifications.maintenanceAlerts}
                    onChange={() => handleNotifToggle('maintenanceAlerts')}
                    className="h-4 w-4 text-info rounded border-border"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span>Generate quarterly fuel summary digests</span>
                  <input
                    type="checkbox"
                    checked={notifications.fuelReports}
                    onChange={() => handleNotifToggle('fuelReports')}
                    className="h-4 w-4 text-info rounded border-border"
                  />
                </label>
              </div>
            </div>

            {/* Submit Action */}
            <div className="flex justify-end pt-2">
              <Button variant="info" className="font-bold flex items-center gap-2 px-6" onClick={handleSave}>
                <Save size={15} /> Save Configuration
              </Button>
            </div>

          </div>

        </div>

      </div>
    </PageContainer>
  );
};

export default Settings;
