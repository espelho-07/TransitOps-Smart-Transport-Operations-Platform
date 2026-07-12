import api from './api';

export const expenseService = {
  getAll: async () => {
    const res = await api.get('/expenses');
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/expenses/${id}`);
    return res.data;
  },
  create: async (data) => {
    const payload = { ...data, amount: Number(data.amount) };
    const res = await api.post('/expenses', payload);
    return res.data;
  },
  update: async (id, data) => {
    const res = await api.put(`/expenses/${id}`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/expenses/${id}`);
    return res.data;
  },
};

export const ExpenseService = expenseService;
export default expenseService;
