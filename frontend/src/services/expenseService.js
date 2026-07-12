import { expenses, saveCollection } from '../data/db';
import { makeThenable } from './thenable';
import { activityService } from './activityService';
import { notificationService } from './notificationService';

export const expenseService = {
  getAll: () => {
    return makeThenable([...expenses]);
  },
  getById: (id) => {
    const item = expenses.find((e) => e.id === id);
    if (!item) throw new Error("Expense not found");
    return makeThenable({ ...item });
  },
  create: (data) => {
    const nextId = `E${String(expenses.length + 1).padStart(3, '0')}`;
    const newExpense = {
      id: nextId,
      status: 'Pending',
      merchant: data.merchant || 'Operations Cash Pool',
      ...data,
      amount: Number(data.amount) || 0
    };
    expenses.push(newExpense);
    saveCollection('expenses', expenses);

    activityService.create('Log Expense', `Created expense entry ${newExpense.id} for vehicle ${data.vehicleId}`);
    notificationService.create('Expense Logged', `New expense ${newExpense.id} for INR ${newExpense.amount?.toLocaleString()} has been logged and awaits review.`, 'Info', 'Expenses');

    return makeThenable({ ...newExpense });
  },
  update: (id, data) => {
    const index = expenses.findIndex((e) => e.id === id);
    if (index !== -1) {
      const prevStatus = expenses[index].status;
      expenses[index] = { ...expenses[index], ...data };
      saveCollection('expenses', expenses);

      const nextStatus = expenses[index].status;
      if (nextStatus && nextStatus !== prevStatus) {
        activityService.create('Update Expense Status', `Expense ${id} status moved from ${prevStatus} to ${nextStatus}`);
        notificationService.create('Expense Audited', `Expense ${id} has been ${nextStatus}.`, 'Info', 'Expenses');
      } else {
        activityService.create('Update Expense', `Modified details for expense ${id}`);
      }

      return makeThenable({ ...expenses[index] });
    }
    throw new Error("Expense not found");
  },
  delete: (id) => {
    const index = expenses.findIndex((e) => e.id === id);
    if (index !== -1) {
      expenses.splice(index, 1);
      saveCollection('expenses', expenses);

      activityService.create('Delete Expense', `Removed expense ledger entry ${id}`);
      notificationService.create('Expense Removed', `Expense entry ${id} was deleted.`, 'Warning', 'Expenses');

      return makeThenable({ success: true, id });
    }
    throw new Error("Expense not found");
  }
};

export const ExpenseService = expenseService;
export default expenseService;
