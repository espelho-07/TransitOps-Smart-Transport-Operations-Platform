import React from 'react';

const FuelLogs = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-main">Fuel Logs</h1>
        <p className="text-sm text-text-secondary">Monitor fuel card refills, consumption statistics, and cost efficiency.</p>
      </div>
      <div className="bg-card border border-border p-8 rounded-lg shadow-sm text-center">
        <p className="text-text-secondary">Fuel efficiency metrics, transaction histories, odometer checks, and refill updates will render here in Phase 2.</p>
      </div>
    </div>
  );
};

export default FuelLogs;
