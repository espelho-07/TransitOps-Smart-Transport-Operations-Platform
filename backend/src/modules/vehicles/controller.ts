import { Response, NextFunction } from "express";
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

      const newVehicle = await VehicleModel.create({
        ...req.body,
        id: nextId,
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
      const updated = await VehicleModel.findOneAndUpdate(
        { id: req.params.id, organization_id: orgId },
        { $set: req.body },
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
}
