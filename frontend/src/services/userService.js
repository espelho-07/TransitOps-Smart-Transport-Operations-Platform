import { users, saveCollection } from '../data/db';
import { makeThenable } from './thenable';

export const userService = {
  getAll: () => {
    return makeThenable([...users]);
  },
  getById: (id) => {
    const item = users.find((u) => u.id === id);
    if (item) return makeThenable({ ...item });
    throw new Error("User not found");
  },
  create: (data) => {
    const nextId = `U${String(users.length + 1).padStart(3, '0')}`;
    const newUser = {
      id: nextId,
      status: 'Active',
      ...data,
      avatar: data.avatar || `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80`
    };
    users.push(newUser);
    saveCollection('users', users);
    return makeThenable({ ...newUser });
  },
  update: (id, data) => {
    const index = users.findIndex((u) => u.id === id);
    if (index !== -1) {
      users[index] = { ...users[index], ...data };
      saveCollection('users', users);
      return makeThenable({ ...users[index] });
    }
    throw new Error("User not found");
  },
  delete: (id) => {
    const index = users.findIndex((u) => u.id === id);
    if (index !== -1) {
      users.splice(index, 1);
      saveCollection('users', users);
      return makeThenable({ success: true, id });
    }
    throw new Error("User not found");
  }
};

export const UserService = userService;
export default userService;
