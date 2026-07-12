import { Response, NextFunction } from "express";
import mongoose from "mongoose";
import { AuthenticatedRequest } from "../../middlewares/auth";
import { VehicleModel } from "./model";

export class VehicleController {
  static async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.user?.organization_id;
      const vehicles = await VehicleModel.find({ organization_id: orgId });
      res.json(vehicles);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.user?.organization_id;
      const vehicle = await VehicleModel.findOne({ id: req.params.id, organization_id: orgId });
      if (!vehicle) {
        res.status(404).json({ error: "Vehicle not found" });
        return;
      }
      res.json(vehicle);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.user?.organization_id;

      // Auto-increment custom ID
      const count = await VehicleModel.countDocuments();
      const nextId = `V${String(count + 1).padStart(3, "0")}`;

      // Normalize registrationNo → plateNumber
      const plateNumber = req.body.registrationNo || req.body.plateNumber;

      const newVehicle = await VehicleModel.create({
        ...req.body,
        id: nextId,
        plateNumber,
        registrationNo: plateNumber,
        status: req.body.status || "Available",
        isArchived: false,
        organization_id: orgId,
      });

      res.status(201).json(newVehicle);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.user?.organization_id;

      const updateData = { ...req.body };
      // Keep registrationNo + plateNumber in sync
      if (updateData.registrationNo) updateData.plateNumber = updateData.registrationNo;
      if (updateData.plateNumber) updateData.registrationNo = updateData.plateNumber;

      const updated = await VehicleModel.findOneAndUpdate(
        { id: req.params.id, organization_id: orgId },
        { $set: updateData },
        { new: true }
      );
      if (!updated) {
        res.status(404).json({ error: "Vehicle not found" });
        return;
      }
      res.json(updated);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.user?.organization_id;
      const deleted = await VehicleModel.findOneAndDelete({ id: req.params.id, organization_id: orgId });
      if (!deleted) {
        res.status(404).json({ error: "Vehicle not found" });
        return;
      }
      res.json({ success: true, id: req.params.id });
    } catch (error) {
      next(error);
    }
  }

  static async duplicate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.user?.organization_id;
      const source = await VehicleModel.findOne({ id: req.params.id, organization_id: orgId });
      if (!source) {
        res.status(404).json({ error: "Vehicle not found" });
        return;
      }

      const count = await VehicleModel.countDocuments();
      const nextId = `V${String(count + 1).padStart(3, "0")}`;
      const newPlate = `TX-NEW-${nextId}`;

      const sourceObj = source.toObject() as any;
      delete sourceObj._id;
      delete sourceObj.__v;
      delete sourceObj.createdAt;
      delete sourceObj.updatedAt;

      const cloned = await VehicleModel.create({
        ...sourceObj,
        id: nextId,
        plateNumber: newPlate,
        registrationNo: newPlate,
        model: `${sourceObj.model} (Copy)`,
        assignedDriverId: null,
        assignedTripId: null,
        status: "Available",
        isArchived: false,
        total_fuel_cost: 0,
        total_maintenance_cost: 0,
        total_revenue: 0,
        total_distance_traveled: 0,
        total_fuel_consumed_liters: 0,
      });

      res.status(201).json(cloned);
    } catch (error) {
      next(error);
    }
  }

  static async archive(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.user?.organization_id;
      const vehicle = await VehicleModel.findOne({ id: req.params.id, organization_id: orgId });
      if (!vehicle) {
        res.status(404).json({ error: "Vehicle not found" });
        return;
      }

      const newArchivedState = !(vehicle as any).isArchived;
      const updated = await VehicleModel.findOneAndUpdate(
        { id: req.params.id, organization_id: orgId },
        { $set: { isArchived: newArchivedState } },
        { new: true }
      );
      res.json(updated);
    } catch (error) {
      next(error);
    }
  }
}
