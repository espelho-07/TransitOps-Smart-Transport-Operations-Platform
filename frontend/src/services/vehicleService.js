import { vehicles, saveCollection } from '../data/db';
import { makeThenable } from './thenable';
import { activityService } from './activityService';
import { notificationService } from './notificationService';

export const vehicleService = {
  getAll: () => {
    return makeThenable([...vehicles]);
  },
  getById: (id) => {
    const item = vehicles.find((v) => v.id === id);
    if (!item) throw new Error("Vehicle not found");
    return makeThenable({ ...item });
  },
  create: (data) => {
    // Unique check
    const isDup = vehicles.some(v => v.registrationNo?.toLowerCase() === data.registrationNo?.toLowerCase() || v.plateNumber?.toLowerCase() === data.registrationNo?.toLowerCase());
    if (isDup) throw new Error("Vehicle Registration Number must be unique!");

    const nextId = `V${String(vehicles.length + 1).padStart(3, '0')}`;
    const newVehicle = {
      id: nextId,
      ...data,
      plateNumber: data.registrationNo,
      fuelLevel: data.fuel || 80,
      odometer: Number(data.odometer) || 0,
      status: data.status || 'Pending Approval', // Default to Pending Approval for approvals center simulation
      isArchived: false,
      image: data.image || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=400&q=80'
    };
    vehicles.push(newVehicle);
    saveCollection('vehicles', vehicles);
    
    // Auto logging and notification
    activityService.create('Create Vehicle', `Registered vehicle asset ${newVehicle.registrationNo}`);
    notificationService.create('Vehicle Registered', `New vehicle ${newVehicle.registrationNo} has been registered and awaits authorization.`, 'Info', 'Fleet');

    return makeThenable({ ...newVehicle });
  },
  update: (id, data) => {
    const index = vehicles.findIndex((v) => v.id === id);
    if (index !== -1) {
      // Unique check if registrationNo changes
      if (data.registrationNo && data.registrationNo !== vehicles[index].registrationNo) {
        const isDup = vehicles.some(v => v.id !== id && (v.registrationNo?.toLowerCase() === data.registrationNo?.toLowerCase() || v.plateNumber?.toLowerCase() === data.registrationNo?.toLowerCase()));
        if (isDup) throw new Error("Vehicle Registration Number must be unique!");
      }

      const prevStatus = vehicles[index].status;
      vehicles[index] = { 
        ...vehicles[index], 
        ...data,
        plateNumber: data.registrationNo || vehicles[index].plateNumber || data.plateNumber,
        fuelLevel: data.fuel !== undefined ? data.fuel : vehicles[index].fuelLevel,
        fuel: data.fuel !== undefined ? data.fuel : vehicles[index].fuel
      };
      saveCollection('vehicles', vehicles);

      // Auto log and notification on status shift
      if (data.status && data.status !== prevStatus) {
        activityService.create('Update Vehicle Status', `Vehicle ${id} status moved from ${prevStatus} to ${data.status}`);
        notificationService.create('Vehicle Status Updated', `Vehicle ${vehicles[index].registrationNo} is now ${data.status}.`, 'Info', 'Fleet');
      } else {
        activityService.create('Update Vehicle', `Modified details for vehicle asset ${vehicles[index].registrationNo}`);
      }

      return makeThenable({ ...vehicles[index] });
    }
    throw new Error("Vehicle not found");
  },
  delete: (id) => {
    const index = vehicles.findIndex((v) => v.id === id);
    if (index !== -1) {
      const reg = vehicles[index].registrationNo;
      vehicles.splice(index, 1);
      saveCollection('vehicles', vehicles);

      activityService.create('Delete Vehicle', `Removed vehicle asset ${reg}`);
      notificationService.create('Vehicle Removed', `Vehicle asset ${reg} was deleted from active registry.`, 'Warning', 'Fleet');

      return makeThenable({ success: true, id });
    }
    throw new Error("Vehicle not found");
  },
  duplicate: (id) => {
    const source = vehicles.find((v) => v.id === id);
    if (source) {
      const nextId = `V${String(vehicles.length + 1).padStart(3, '0')}`;
      const clonedVehicle = {
        ...source,
        id: nextId,
        registrationNo: `TX-NEW-${nextId}`,
        plateNumber: `TX-NEW-${nextId}`,
        model: `${source.model} (Copy)`,
        assignedDriverId: null,
        assignedTripId: null,
        status: 'Available',
        isArchived: false
      };
      vehicles.push(clonedVehicle);
      saveCollection('vehicles', vehicles);

      activityService.create('Duplicate Vehicle', `Cloned vehicle asset ${source.registrationNo} as ${clonedVehicle.registrationNo}`);
      return makeThenable({ ...clonedVehicle });
    }
    throw new Error("Vehicle not found");
  },
  archive: (id) => {
    const index = vehicles.findIndex((v) => v.id === id);
    if (index !== -1) {
      const state = !vehicles[index].isArchived;
      vehicles[index] = { ...vehicles[index], isArchived: state };
      saveCollection('vehicles', vehicles);

      activityService.create('Archive Vehicle', `${state ? 'Archived' : 'Restored'} vehicle asset ${vehicles[index].registrationNo}`);
      return makeThenable({ ...vehicles[index] });
    }
    throw new Error("Vehicle not found");
  }
};

export const VehicleService = vehicleService;
export default vehicleService;
