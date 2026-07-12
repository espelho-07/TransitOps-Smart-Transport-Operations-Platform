import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../middlewares/auth";
import { FuelLogModel } from "./model";
import { VehicleModel } from "../vehicles/model";
import { ExpenseModel } from "../expenses/model";

export class FuelController {
  static async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.user?.organization_id;
      const logs = await FuelLogModel.find({ organization_id: orgId });
      res.json(logs);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.user?.organization_id;
      const log = await FuelLogModel.findOne({ id: req.params.id, organization_id: orgId });
      if (!log) {
        res.status(404).json({ error: "Fuel log not found" });
        return;
      }
      res.json(log);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.user?.organization_id;
      const { vehicleId, driverId, quantity, cost, odometer, stationName, receiptNumber, date } = req.body;

      const vehicle = await VehicleModel.findOne({ id: vehicleId, organization_id: orgId });
      if (!vehicle) {
        res.status(404).json({ error: `Vehicle ${vehicleId} not found.` });
        return;
      }

      const count = await FuelLogModel.countDocuments();
      const nextId = `F${String(count + 1).padStart(3, "0")}`;

      const newLog = await FuelLogModel.create({
        id: nextId,
        vehicleId,
        driverId: driverId || "D001",
        date: date || new Date().toISOString().split("T")[0],
        quantity: Number(quantity) || 0,
        cost: Number(cost) || 0,
        odometer: Number(odometer) || vehicle.odometer,
        stationName: stationName || "Chevron Station",
        receiptNumber: receiptNumber || `RCPT-${Math.floor(10000 + Math.random() * 90000)}`,
        organization_id: orgId,
      });

      // 1. Update vehicle odometer & total_fuel_cost
      await VehicleModel.updateOne(
        { id: vehicleId, organization_id: orgId },
        { 
          $set: { odometer: Number(odometer) || vehicle.odometer },
          $inc: { total_fuel_cost: Number(cost) || 0 }
        }
      );

      // 2. Also log as a fuel expense for bookkeeping consistency
      const expenseCount = await ExpenseModel.countDocuments();
      await ExpenseModel.create({
        id: `E${String(expenseCount + 1).padStart(3, "0")}`,
        category: "Fuel",
        amount: Number(cost) || 0,
        date: date || new Date().toISOString().split("T")[0],
        description: `Refuel at ${stationName}`,
        status: "Approved",
        merchant: stationName,
        organization_id: orgId,
      });

      res.status(201).json(newLog);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.user?.organization_id;
      const originalLog = await FuelLogModel.findOne({ id: req.params.id, organization_id: orgId });
      if (!originalLog) {
        res.status(404).json({ error: "Fuel log not found" });
        return;
      }

      const updated = await FuelLogModel.findOneAndUpdate(
        { id: req.params.id, organization_id: orgId },
        { $set: req.body },
        { new: true }
      );

      // Update vehicle's running fuel costs
      if (updated && req.body.cost !== undefined) {
        const diff = Number(req.body.cost) - originalLog.cost;
        await VehicleModel.updateOne(
          { id: originalLog.vehicleId, organization_id: orgId },
          { $inc: { total_fuel_cost: diff } }
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
      const log = await FuelLogModel.findOne({ id: req.params.id, organization_id: orgId });
      if (!log) {
        res.status(404).json({ error: "Fuel log not found" });
        return;
      }

      await VehicleModel.updateOne(
        { id: log.vehicleId, organization_id: orgId },
        { $inc: { total_fuel_cost: -log.cost } }
      );

      await FuelLogModel.deleteOne({ id: req.params.id, organization_id: orgId });
      res.json({ success: true, id: req.params.id });
    } catch (error) {
      next(error);
    }
  }
}
