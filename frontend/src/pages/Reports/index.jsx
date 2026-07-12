import React from 'react';

const Reports = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-main">Reports</h1>
        <p className="text-sm text-text-secondary">Generate and inspect fleet analytics, dispatch reports, and profit summaries.</p>
      </div>
      <div className="bg-card border border-border p-8 rounded-lg shadow-sm text-center">
        <p className="text-text-secondary">Custom report generation pipelines, CSV/PDF exporting interfaces, and charts will render here in Phase 2.</p>
      </div>
    </div>
  );
};

export default Reports;
