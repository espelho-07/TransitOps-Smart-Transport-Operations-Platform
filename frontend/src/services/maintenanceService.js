import { maintenance, saveCollection } from '../data/db';
import { makeThenable } from './thenable';
import { activityService } from './activityService';
import { notificationService } from './notificationService';

export const maintenanceService = {
  getAll: () => {
    return makeThenable([...maintenance]);
  },
  getById: (id) => {
    const item = maintenance.find((m) => m.id === id);
    if (!item) throw new Error("Maintenance record not found");
    return makeThenable({ ...item });
  },
  create: (data) => {
    const nextId = `M${String(maintenance.length + 1).padStart(3, '0')}`;
    const newRecord = {
      id: nextId,
      status: 'Pending',
      priority: data.priority || 'Medium',
      mechanic: data.mechanic || 'Central Depot Workshop',
      ...data,
      cost: Number(data.cost) || 0
    };
    maintenance.push(newRecord);
    saveCollection('maintenance', maintenance);

    activityService.create('Schedule Maintenance', `Created service order ${newRecord.id} for vehicle ${data.vehicleId}`);
    notificationService.create('Maintenance Scheduled', `New service order ${newRecord.id} for vehicle ${data.vehicleId} has been logged and awaits review.`, 'Info', 'Maintenance');

    return makeThenable({ ...newRecord });
  },
  update: (id, data) => {
    const index = maintenance.findIndex((m) => m.id === id);
    if (index !== -1) {
      const prevStatus = maintenance[index].status;
      maintenance[index] = { ...maintenance[index], ...data };
      saveCollection('maintenance', maintenance);

      const nextStatus = maintenance[index].status;
      if (nextStatus && nextStatus !== prevStatus) {
        activityService.create('Update Maintenance Status', `Maintenance ${id} status moved from ${prevStatus} to ${nextStatus}`);
        notificationService.create('Maintenance Status Updated', `Service order ${id} status is now ${nextStatus}.`, 'Info', 'Maintenance');
      } else {
        activityService.create('Update Maintenance', `Modified details for maintenance order ${id}`);
      }

      return makeThenable({ ...maintenance[index] });
    }
    throw new Error("Maintenance record not found");
  },
  delete: (id) => {
    const index = maintenance.findIndex((m) => m.id === id);
    if (index !== -1) {
      maintenance.splice(index, 1);
      saveCollection('maintenance', maintenance);

      activityService.create('Delete Maintenance', `Removed maintenance order record ${id}`);
      notificationService.create('Maintenance Removed', `Service order ${id} was deleted from logs.`, 'Warning', 'Maintenance');

      return makeThenable({ success: true, id });
    }
    throw new Error("Maintenance record not found");
  }
};

export const MaintenanceService = maintenanceService;
export default maintenanceService;
