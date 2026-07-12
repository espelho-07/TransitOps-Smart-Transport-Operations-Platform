import { drivers, saveCollection } from '../data/db';
import { makeThenable } from './thenable';
import { activityService } from './activityService';
import { notificationService } from './notificationService';

export const driverService = {
  getAll: () => {
    return makeThenable([...drivers]);
  },
  getById: (id) => {
    const item = drivers.find((d) => d.id === id);
    if (!item) throw new Error("Driver not found");
    return makeThenable({ ...item });
  },
  create: (data) => {
    // Unique check
    const isDup = drivers.some(d => d.license?.toLowerCase() === data.license?.toLowerCase() || d.licenseNumber?.toLowerCase() === data.license?.toLowerCase());
    if (isDup) throw new Error("Driver License Number must be unique!");

    const nextId = `D${String(drivers.length + 1).padStart(3, '0')}`;
    const newDriver = {
      id: nextId,
      ratings: 5.0,
      safetyScore: 90,
      status: data.status || 'Pending Approval', // Default to Pending Approval for approvals center simulation
      licenseNumber: data.license,
      experienceYears: Number(data.experience) || 1,
      licenseExpiry: data.licenseExpiry || '2028-12-31',
      ...data,
      avatar: data.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80'
    };
    drivers.push(newDriver);
    saveCollection('drivers', drivers);

    // Auto logging and notification
    activityService.create('Create Driver', `Registered operator profile for ${newDriver.name}`);
    notificationService.create('Driver Registered', `New driver ${newDriver.name} has been registered and awaits authorization.`, 'Info', 'Drivers');

    return makeThenable({ ...newDriver });
  },
  update: (id, data) => {
    const index = drivers.findIndex((d) => d.id === id);
    if (index !== -1) {
      // Unique check if license changes
      if (data.license && data.license !== drivers[index].license) {
        const isDup = drivers.some(d => d.id !== id && (d.license?.toLowerCase() === data.license?.toLowerCase() || d.licenseNumber?.toLowerCase() === data.license?.toLowerCase()));
        if (isDup) throw new Error("Driver License Number must be unique!");
      }

      const prevStatus = drivers[index].status;
      drivers[index] = { 
        ...drivers[index], 
        ...data,
        licenseNumber: data.license || drivers[index].licenseNumber || data.licenseNumber,
        experienceYears: data.experience !== undefined ? Number(data.experience) : drivers[index].experienceYears
      };
      saveCollection('drivers', drivers);

      // Auto log and notification on status shift
      if (data.status && data.status !== prevStatus) {
        activityService.create('Update Driver Status', `Driver ${drivers[index].name} status moved from ${prevStatus} to ${data.status}`);
        notificationService.create('Driver Status Updated', `Driver ${drivers[index].name} is now ${data.status}.`, 'Info', 'Drivers');
      } else {
        activityService.create('Update Driver', `Modified details for driver ${drivers[index].name}`);
      }

      return makeThenable({ ...drivers[index] });
    }
    throw new Error("Driver not found");
  },
  delete: (id) => {
    const index = drivers.findIndex((d) => d.id === id);
    if (index !== -1) {
      const name = drivers[index].name;
      drivers.splice(index, 1);
      saveCollection('drivers', drivers);

      activityService.create('Delete Driver', `Removed driver profile for ${name}`);
      notificationService.create('Driver Removed', `Driver profile for ${name} was deleted from active registry.`, 'Warning', 'Drivers');

      return makeThenable({ success: true, id });
    }
    throw new Error("Driver not found");
  }
};

export const DriverService = driverService;
export default driverService;
