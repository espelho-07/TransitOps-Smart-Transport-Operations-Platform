import api from './api';

export const vehicleService = {
  getAll: () => api.get('/vehicles').then((res) => res.data),
  getById: (id) => api.get(`/vehicles/${id}`).then((res) => res.data),
  create: (data) => api.post('/vehicles', data).then((res) => res.data),
  update: (id, data) => api.put(`/vehicles/${id}`, data).then((res) => res.data),
  delete: (id) => api.delete(`/vehicles/${id}`).then((res) => res.data),

  duplicate: async (id) => {
    const source = await vehicleService.getById(id);
    const randNum = () => Math.floor(Math.random() * (999 - 100 + 1)) + 100;
    const randChar = () => String.fromCharCode(65 + Math.floor(Math.random() * 26));
    const newPlate = `TX-${randNum()}-${randChar()}${randChar()}`;
    const newVin = `1FM${randChar()}${randNum().toString().slice(0, 2)}${randChar()}H${Math.floor(Math.random() * 900000) + 100000}`;

    const clonedVehicle = {
      ...source,
      plateNumber: newPlate,
      vin: newVin,
      model: `${source.model} (Copy)`,
      assignedDriverId: null,
      assignedTripId: null,
      status: 'Available',
      isArchived: false
    };

    delete clonedVehicle._id;
    delete clonedVehicle.id;
    delete clonedVehicle.createdAt;
    delete clonedVehicle.updatedAt;
    delete clonedVehicle.__v;
    delete clonedVehicle.organization_id;

    return vehicleService.create(clonedVehicle);
  },

  archive: async (id) => {
    const source = await vehicleService.getById(id);
    return vehicleService.update(id, { isArchived: !source.isArchived });
  }
};
