import React from 'react';

const Trips = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-main">Trips</h1>
        <p className="text-sm text-text-secondary">Dispatch, schedule, and live track trip operations.</p>
      </div>
      <div className="bg-card border border-border p-8 rounded-lg shadow-sm text-center">
        <p className="text-text-secondary">Dispatch logs, dynamic tracking, route completions, and schedule maps will render here in Phase 2.</p>
      </div>
    </div>
  );
};

export default Trips;
