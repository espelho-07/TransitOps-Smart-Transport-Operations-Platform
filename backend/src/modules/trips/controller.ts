import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../middlewares/auth";
import { TripModel } from "./model";
import { VehicleModel } from "../vehicles/model";
import { DriverModel } from "../drivers/model";

export class TripController {
  static async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.user?.organization_id;
      const trips = await TripModel.find({ organization_id: orgId });
      res.json(trips);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.user?.organization_id;
      const trip = await TripModel.findOne({ id: req.params.id, organization_id: orgId });
      if (!trip) {
        res.status(404).json({ error: "Trip not found" });
        return;
      }
      res.json(trip);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.user?.organization_id;
      const { vehicleId, driverId, cargoWeight, origin, destination, distance } = req.body;

      // 1. Fetch Vehicle and Driver
      const vehicle = (await VehicleModel.findOne({ id: vehicleId, organization_id: orgId })) as any;
      const driver = (await DriverModel.findOne({ id: driverId, organization_id: orgId })) as any;

      if (!vehicle) {
        res.status(404).json({ error: `Vehicle ${vehicleId} not found.` });
        return;
      }
      if (!driver) {
        res.status(404).json({ error: `Driver ${driverId} not found.` });
        return;
      }

      // 2. Validate Vehicle Status
      if (vehicle.status === "Retired" || vehicle.status === "Maintenance") {
        res.status(400).json({ error: "Cannot dispatch a retired vehicle or a vehicle currently in maintenance." });
        return;
      }
      if (vehicle.status === "On Trip") {
        res.status(400).json({ error: "Vehicle is already assigned to an active trip." });
        return;
      }

      // 3. Validate Driver Status & License
      if (driver.status === "Inactive") {
        res.status(400).json({ error: "Driver is suspended or inactive." });
        return;
      }
      if (driver.status === "On Trip") {
        res.status(400).json({ error: "Driver is already assigned to an active trip." });
        return;
      }

      const expiryDate = new Date(driver.licenseExpiryDate || driver.hireDate); // fallback
      if (expiryDate < new Date()) {
        res.status(400).json({ error: "Driver license has expired." });
        return;
      }

      // 4. Validate Capacity Limit
      const maxWeightTons = vehicle.max_load_capacity 
        ? vehicle.max_load_capacity / 1000 
        : parseFloat(vehicle.carrierCap || "0") || 10;
      
      const cargoTons = parseFloat(cargoWeight) || 0;
      if (cargoTons > maxWeightTons) {
        res.status(400).json({ error: `Cargo weight (${cargoTons} Tons) exceeds vehicle maximum capacity (${maxWeightTons} Tons).` });
        return;
      }

      // 5. Generate IDs
      const count = await TripModel.countDocuments();
      const nextId = `T${String(count + 1).padStart(3, "0")}`;
      const tripNumber = `TRIP-2026-${String(count + 1).padStart(3, "0")}`;

      // 6. Create Trip
      const newTrip = await TripModel.create({
        id: nextId,
        tripNumber,
        vehicleId,
        driverId,
        origin,
        destination,
        status: "Active", // Dispatch automatically sets status to Active/Dispatched
        startDate: new Date().toISOString(),
        endDate: null,
        distance: Number(distance) || 300,
        fuelConsumed: null,
        cargoWeight: typeof cargoWeight === "string" ? cargoWeight : `${cargoWeight} Tons`,
        organization_id: orgId
      });

      // 7. Atomically lock Vehicle and Driver status to "On Trip"
      await VehicleModel.updateOne({ id: vehicleId, organization_id: orgId }, { $set: { status: "On Trip" } });
      await DriverModel.updateOne({ id: driverId, organization_id: orgId }, { $set: { status: "On Trip" } });

      res.status(201).json(newTrip);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.user?.organization_id;
      const { status, fuelConsumed, endDate } = req.body;

      const trip = await TripModel.findOne({ id: req.params.id, organization_id: orgId });
      if (!trip) {
        res.status(404).json({ error: "Trip not found" });
        return;
      }

      const originalStatus = trip.status;

      // Update document
      const updatedTrip = await TripModel.findOneAndUpdate(
        { id: req.params.id, organization_id: orgId },
        { $set: req.body },
        { new: true }
      );

      // Handle status transition side-effects
      if (updatedTrip && originalStatus !== status) {
        if (status === "Completed") {
          // Reset status to Available
          await VehicleModel.updateOne({ id: trip.vehicleId, organization_id: orgId }, { 
            $set: { status: "Available" },
            $inc: { 
              total_distance_traveled: trip.distance, 
              total_revenue: trip.distance * 2,
              total_fuel_consumed_liters: Number(fuelConsumed) || 0
            } 
          });
          await DriverModel.updateOne({ id: trip.driverId, organization_id: orgId }, { $set: { status: "Available" } });
        } else if (status === "Cancelled") {
          await VehicleModel.updateOne({ id: trip.vehicleId, organization_id: orgId }, { $set: { status: "Available" } });
          await DriverModel.updateOne({ id: trip.driverId, organization_id: orgId }, { $set: { status: "Available" } });
        }
      }

      res.json(updatedTrip);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.user?.organization_id;
      const trip = await TripModel.findOne({ id: req.params.id, organization_id: orgId });
      if (!trip) {
        res.status(404).json({ error: "Trip not found" });
        return;
      }

      // If active, restore vehicle & driver
      if (trip.status === "Active") {
        await VehicleModel.updateOne({ id: trip.vehicleId, organization_id: orgId }, { $set: { status: "Available" } });
        await DriverModel.updateOne({ id: trip.driverId, organization_id: orgId }, { $set: { status: "Available" } });
      }

      await TripModel.deleteOne({ id: req.params.id, organization_id: orgId });
      res.json({ success: true, id: req.params.id });
    } catch (error) {
      next(error);
    }
  }
}
