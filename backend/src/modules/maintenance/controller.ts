import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../middlewares/auth";
import { MaintenanceModel } from "./model";
import { VehicleModel } from "../vehicles/model";

export class MaintenanceController {
  static async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.user?.organization_id;
      const records = await MaintenanceModel.find({ organization_id: orgId });
      res.json(records);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.user?.organization_id;
      const record = await MaintenanceModel.findOne({ id: req.params.id, organization_id: orgId });
      if (!record) {
        res.status(404).json({ error: "Maintenance record not found" });
        return;
      }
      res.json(record);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.user?.organization_id;
      const { vehicleId, type, cost, description, priority, mechanic } = req.body;

      const vehicle = await VehicleModel.findOne({ id: vehicleId, organization_id: orgId });
      if (!vehicle) {
        res.status(404).json({ error: `Vehicle ${vehicleId} not found.` });
        return;
      }

      const count = await MaintenanceModel.countDocuments();
      const nextId = `M${String(count + 1).padStart(3, "0")}`;

      const newRecord = await MaintenanceModel.create({
        id: nextId,
        vehicleId,
        type,
        cost: Number(cost) || 0,
        description,
        status: "In Progress",
        date: new Date().toISOString().split("T")[0],
        priority: priority || "Medium",
        mechanic,
        organization_id: orgId,
      });

      // Automatically change vehicle status to Maintenance
      await VehicleModel.updateOne({ id: vehicleId, organization_id: orgId }, { $set: { status: "Maintenance" } });

      res.status(201).json(newRecord);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.user?.organization_id;
      const { status } = req.body;

      const record = await MaintenanceModel.findOne({ id: req.params.id, organization_id: orgId });
      if (!record) {
        res.status(404).json({ error: "Maintenance record not found" });
        return;
      }

      const updated = await MaintenanceModel.findOneAndUpdate(
        { id: req.params.id, organization_id: orgId },
        { $set: req.body },
        { new: true }
      );

      // If marked Completed, release vehicle back to Available
      if (status === "Completed" && record.status !== "Completed") {
        await VehicleModel.updateOne(
          { id: record.vehicleId, organization_id: orgId },
          { 
            $set: { status: "Available" },
            $inc: { total_maintenance_cost: record.cost } 
          }
        );
      }

      res.json(updated);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.user?.organization_id;
      const record = await MaintenanceModel.findOne({ id: req.params.id, organization_id: orgId });
      if (!record) {
        res.status(404).json({ error: "Maintenance record not found" });
        return;
      }

      // If active, release vehicle back to Available
      if (record.status !== "Completed") {
        await VehicleModel.updateOne({ id: record.vehicleId, organization_id: orgId }, { $set: { status: "Available" } });
      }

      await MaintenanceModel.deleteOne({ id: req.params.id, organization_id: orgId });
      res.json({ success: true, id: req.params.id });
    } catch (error) {
      next(error);
    }
  }
}
