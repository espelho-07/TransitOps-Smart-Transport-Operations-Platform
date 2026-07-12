import { mockExpenses } from '../data/expenses';

let expenses = [...mockExpenses];

export const expenseService = {
  getAll: () => {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...expenses]), 400);
    });
  },
  getById: (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const item = expenses.find((e) => e.id === id);
        if (item) resolve({ ...item });
        else reject(new Error("Expense record not found"));
      }, 250);
    });
  },
  create: (data) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const nextId = `E${String(expenses.length + 1).padStart(3, '0')}`;
        const newExpense = {
          id: nextId,
          date: new Date().toISOString().split('T')[0],
          status: 'Pending',
          amount: Number(data.amount) || 0,
          ...data
        };
        expenses.push(newExpense);
        resolve({ ...newExpense });
      }, 400);
    });
  },
  update: (id, data) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = expenses.findIndex((e) => e.id === id);
        if (index !== -1) {
          expenses[index] = { ...expenses[index], ...data };
          resolve({ ...expenses[index] });
        } else {
          reject(new Error("Expense record not found"));
        }
      }, 400);
    });
  },
  delete: (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = expenses.findIndex((e) => e.id === id);
        if (index !== -1) {
          expenses = expenses.filter((e) => e.id !== id);
          resolve({ success: true, id });
        } else {
          reject(new Error("Expense record not found"));
        }
      }, 300);
    });
  }
};
