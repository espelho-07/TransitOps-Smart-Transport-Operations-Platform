import React from 'react';

const Expenses = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-main">Expenses</h1>
        <p className="text-sm text-text-secondary">Track tolls, driver payroll, insurance, and miscellaneous operational costs.</p>
      </div>
      <div className="bg-card border border-border p-8 rounded-lg shadow-sm text-center">
        <p className="text-text-secondary">Expense approval workflows, category structures, invoice receipts, and statements will render here in Phase 2.</p>
      </div>
    </div>
  );
};

export default Expenses;
