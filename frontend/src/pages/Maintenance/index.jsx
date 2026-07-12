import React from 'react';

const Maintenance = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-main">Maintenance Logs</h1>
        <p className="text-sm text-text-secondary">Track fleet servicing schedules, breakdowns, and maintenance expenses.</p>
      </div>
      <div className="bg-card border border-border p-8 rounded-lg shadow-sm text-center">
        <p className="text-text-secondary">Work orders, scheduling calendars, preventive plans, and mechanics assignments will render here in Phase 2.</p>
      </div>
    </div>
  );
};

export default Maintenance;
