import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../middlewares/auth";
import { DriverModel } from "./model";

export class DriverController {
  static async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.user?.organization_id;
      const drivers = await DriverModel.find({ organization_id: orgId });
      res.json(drivers);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.user?.organization_id;
      const driver = await DriverModel.findOne({ id: req.params.id, organization_id: orgId });
      if (!driver) {
        res.status(404).json({ error: "Driver not found" });
        return;
      }
      res.json(driver);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.user?.organization_id;
      
      const count = await DriverModel.countDocuments();
      const nextId = `D${String(count + 1).padStart(3, "0")}`;

      const avatar = req.body.name 
        ? req.body.name.split(" ").map((n: string) => n[0]).join("").toUpperCase()
        : "DR";

      const newDriver = await DriverModel.create({
        ...req.body,
        id: nextId,
        avatar,
        ratings: req.body.ratings || 5.0,
        hireDate: req.body.hireDate || new Date().toISOString().split("T")[0],
        organization_id: orgId,
      });

      res.status(201).json(newDriver);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.user?.organization_id;
      const updated = await DriverModel.findOneAndUpdate(
        { id: req.params.id, organization_id: orgId },
        { $set: req.body },
        { new: true }
      );
      if (!updated) {
        res.status(404).json({ error: "Driver not found" });
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
      const deleted = await DriverModel.findOneAndDelete({ id: req.params.id, organization_id: orgId });
      if (!deleted) {
        res.status(404).json({ error: "Driver not found" });
        return;
      }
      res.json({ success: true, id: req.params.id });
    } catch (error) {
      next(error);
    }
  }
}
