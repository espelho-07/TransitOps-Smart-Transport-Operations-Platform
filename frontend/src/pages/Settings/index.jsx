import React from 'react';

const Settings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-main">Settings</h1>
        <p className="text-sm text-text-secondary">Configure platform preferences, default thresholds, and account parameters.</p>
      </div>
      <div className="bg-card border border-border p-8 rounded-lg shadow-sm text-center">
        <p className="text-text-secondary">Tenant settings, alert thresholds, integration configs, and localized formats will render here in Phase 2.</p>
      </div>
    </div>
  );
};

export default Settings;
