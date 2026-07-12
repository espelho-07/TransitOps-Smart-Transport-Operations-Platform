import { fuel, saveCollection } from '../data/db';
import { makeThenable } from './thenable';
import { activityService } from './activityService';
import { notificationService } from './notificationService';

export const fuelService = {
  getAll: () => {
    return makeThenable([...fuel]);
  },
  getById: (id) => {
    const item = fuel.find((f) => f.id === id);
    if (!item) throw new Error("Fuel log not found");
    return makeThenable({ ...item });
  },
  create: (data) => {
    const nextId = `F${String(fuel.length + 1).padStart(3, '0')}`;
    const newLog = {
      id: nextId,
      receiptNumber: `RCP-${9900 + fuel.length + 1}`,
      ...data,
      quantity: Number(data.quantity) || 0,
      cost: Number(data.cost) || 0,
      odometer: Number(data.odometer) || 0
    };
    fuel.push(newLog);
    saveCollection('fuel', fuel);

    activityService.create('Log Fuel', `Registered refuel receipt ${newLog.receiptNumber} for vehicle ${data.vehicleId}`);
    notificationService.create('Fuel Added', `Logged refuel receipt of ${newLog.quantity}L for ${data.vehicleId}.`, 'Info', 'Fuel');

    return makeThenable({ ...newLog });
  },
  update: (id, data) => {
    const index = fuel.findIndex((f) => f.id === id);
    if (index !== -1) {
      fuel[index] = { ...fuel[index], ...data };
      saveCollection('fuel', fuel);

      activityService.create('Update Fuel Log', `Modified refuel receipt details for ID ${id}`);
      return makeThenable({ ...fuel[index] });
    }
    throw new Error("Fuel log not found");
  },
  delete: (id) => {
    const index = fuel.findIndex((f) => f.id === id);
    if (index !== -1) {
      const receipt = fuel[index].receiptNumber;
      fuel.splice(index, 1);
      saveCollection('fuel', fuel);

      activityService.create('Delete Fuel Log', `Removed fuel receipt record ${receipt}`);
      notificationService.create('Fuel Log Removed', `Refuel receipt ${receipt} was deleted.`, 'Warning', 'Fuel');

      return makeThenable({ success: true, id });
    }
    throw new Error("Fuel log not found");
  }
};

export const FuelService = fuelService;
export const FuelLogService = fuelService;
export default fuelService;
