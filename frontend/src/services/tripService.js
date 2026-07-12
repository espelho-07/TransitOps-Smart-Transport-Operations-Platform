import { trips, saveCollection, vehicles, drivers } from '../data/db';
import { makeThenable } from './thenable';
import { activityService } from './activityService';
import { notificationService } from './notificationService';

export const tripService = {
  getAll: () => {
    return makeThenable([...trips]);
  },
  getById: (id) => {
    const item = trips.find((t) => t.id === id);
    if (!item) throw new Error("Trip not found");
    return makeThenable({ ...item });
  },
  create: (data) => {
    const nextId = `T${String(trips.length + 1).padStart(3, '0')}`;
    const newTrip = {
      id: nextId,
      tripNumber: `TRP-${100 + trips.length + 1}`,
      status: data.status || 'Scheduled',
      startDate: data.startDate || new Date().toISOString().split('T')[0],
      endDate: data.endDate || null,
      cargoWeight: data.cargoWeight || '5 Tons',
      ...data
    };
    trips.push(newTrip);
    saveCollection('trips', trips);

    // Business Rule: Dispatching changes Vehicle and Driver to On Trip
    if (newTrip.status === 'Active') {
      const vIdx = vehicles.findIndex(v => v.id === newTrip.vehicleId);
      if (vIdx !== -1) {
        vehicles[vIdx].status = 'On Trip';
        vehicles[vIdx].assignedDriverId = newTrip.driverId;
        vehicles[vIdx].assignedTripId = newTrip.id;
      }
      const dIdx = drivers.findIndex(d => d.id === newTrip.driverId);
      if (dIdx !== -1) {
        drivers[dIdx].status = 'On Trip';
        drivers[dIdx].currentTrip = newTrip.tripNumber;
        drivers[dIdx].assignedVehicleId = newTrip.vehicleId;
      }
      saveCollection('vehicles', vehicles);
      saveCollection('drivers', drivers);
    }

    // Auto logging and notifications
    activityService.create('Create Trip', `Dispatched cargo route ${newTrip.tripNumber} to ${newTrip.destination}`);
    notificationService.create('Trip Dispatched', `Logistics route ${newTrip.tripNumber} has been dispatched.`, 'Info', 'Trips');

    return makeThenable({ ...newTrip });
  },
  update: (id, data) => {
    const index = trips.findIndex((t) => t.id === id);
    if (index !== -1) {
      const prevStatus = trips[index].status;
      const prevVehicle = trips[index].vehicleId;
      const prevDriver = trips[index].driverId;

      trips[index] = { ...trips[index], ...data };
      saveCollection('trips', trips);

      const nextStatus = trips[index].status;

      // Business Rule: If status shifts to Active, set vehicle and driver status to On Trip
      if (nextStatus === 'Active' && prevStatus !== 'Active') {
        const vIdx = vehicles.findIndex(v => v.id === trips[index].vehicleId);
        if (vIdx !== -1) {
          vehicles[vIdx].status = 'On Trip';
          vehicles[vIdx].assignedDriverId = trips[index].driverId;
          vehicles[vIdx].assignedTripId = trips[index].id;
        }
        const dIdx = drivers.findIndex(d => d.id === trips[index].driverId);
        if (dIdx !== -1) {
          drivers[dIdx].status = 'On Trip';
          drivers[dIdx].currentTrip = trips[index].tripNumber;
          drivers[dIdx].assignedVehicleId = trips[index].vehicleId;
        }
        saveCollection('vehicles', vehicles);
        saveCollection('drivers', drivers);
      }
      // Business Rule: If status shifts to Completed or Cancelled, return vehicle & driver to Available pool
      else if ((nextStatus === 'Completed' || nextStatus === 'Cancelled') && prevStatus === 'Active') {
        const vIdx = vehicles.findIndex(v => v.id === prevVehicle);
        if (vIdx !== -1) {
          vehicles[vIdx].status = 'Available';
          vehicles[vIdx].assignedDriverId = null;
          vehicles[vIdx].assignedTripId = null;
        }
        const dIdx = drivers.findIndex(d => d.id === prevDriver);
        if (dIdx !== -1) {
          drivers[dIdx].status = 'Available';
          drivers[dIdx].currentTrip = '';
          drivers[dIdx].assignedVehicleId = '';
        }
        saveCollection('vehicles', vehicles);
        saveCollection('drivers', drivers);
      }

      // Auto logging
      activityService.create('Update Trip', `Moved trip ${trips[index].tripNumber} status to ${nextStatus}`);
      notificationService.create('Trip Status Updated', `Logistics route ${trips[index].tripNumber} status is now ${nextStatus}.`, 'Info', 'Trips');

      return makeThenable({ ...trips[index] });
    }
    throw new Error("Trip not found");
  },
  delete: (id) => {
    const index = trips.findIndex((t) => t.id === id);
    if (index !== -1) {
      const tripNum = trips[index].tripNumber;
      const prevStatus = trips[index].status;
      const prevVehicle = trips[index].vehicleId;
      const prevDriver = trips[index].driverId;

      trips.splice(index, 1);
      saveCollection('trips', trips);

      // Release driver and vehicle if deleting an active trip
      if (prevStatus === 'Active') {
        const vIdx = vehicles.findIndex(v => v.id === prevVehicle);
        if (vIdx !== -1) {
          vehicles[vIdx].status = 'Available';
          vehicles[vIdx].assignedDriverId = null;
          vehicles[vIdx].assignedTripId = null;
        }
        const dIdx = drivers.findIndex(d => d.id === prevDriver);
        if (dIdx !== -1) {
          drivers[dIdx].status = 'Available';
          drivers[dIdx].currentTrip = '';
          drivers[dIdx].assignedVehicleId = '';
        }
        saveCollection('vehicles', vehicles);
        saveCollection('drivers', drivers);
      }

      activityService.create('Delete Trip', `Removed route dispatch record ${tripNum}`);
      notificationService.create('Trip Removed', `Logistics route ${tripNum} was deleted.`, 'Warning', 'Trips');

      return makeThenable({ success: true, id });
    }
    throw new Error("Trip not found");
  }
};

export const TripService = tripService;
export default tripService;
