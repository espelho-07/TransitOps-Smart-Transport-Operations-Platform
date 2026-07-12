"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FuelController = void 0;
const model_1 = require("./model");
const model_2 = require("../vehicles/model");
const model_3 = require("../expenses/model");
class FuelController {
    static async getAll(req, res, next) {
        try {
            const orgId = req.user?.organization_id;
            const logs = await model_1.FuelLogModel.find({ organization_id: orgId });
            res.json(logs);
        }
        catch (error) {
            next(error);
        }
    }
    static async getById(req, res, next) {
        try {
            const orgId = req.user?.organization_id;
            const log = await model_1.FuelLogModel.findOne({ id: req.params.id, organization_id: orgId });
            if (!log) {
                res.status(404).json({ error: "Fuel log not found" });
                return;
            }
            res.json(log);
        }
        catch (error) {
            next(error);
        }
    }
    static async create(req, res, next) {
        try {
            const orgId = req.user?.organization_id;
            const { vehicleId, driverId, quantity, cost, odometer, stationName, receiptNumber, date } = req.body;
            const vehicle = await model_2.VehicleModel.findOne({ id: vehicleId, organization_id: orgId });
            if (!vehicle) {
                res.status(404).json({ error: `Vehicle ${vehicleId} not found.` });
                return;
            }
            const count = await model_1.FuelLogModel.countDocuments();
            const nextId = `F${String(count + 1).padStart(3, "0")}`;
            const newLog = await model_1.FuelLogModel.create({
                id: nextId,
                vehicleId,
                driverId: driverId || "D001",
                date: date || new Date().toISOString().split("T")[0],
                quantity: Number(quantity) || 0,
                cost: Number(cost) || 0,
                odometer: Number(odometer) || vehicle.odometer,
                stationName,
                receiptNumber,
                organization_id: orgId,
            });
            // 1. Update vehicle odometer & total_fuel_cost
            await model_2.VehicleModel.updateOne({ id: vehicleId, organization_id: orgId }, {
                $set: { odometer: Number(odometer) || vehicle.odometer },
                $inc: { total_fuel_cost: Number(cost) || 0 }
            });
            // 2. Also log as a fuel expense for bookkeeping consistency
            const expenseCount = await model_3.ExpenseModel.countDocuments();
            await model_3.ExpenseModel.create({
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
        }
        catch (error) {
            next(error);
        }
    }
    static async update(req, res, next) {
        try {
            const orgId = req.user?.organization_id;
            const originalLog = await model_1.FuelLogModel.findOne({ id: req.params.id, organization_id: orgId });
            if (!originalLog) {
                res.status(404).json({ error: "Fuel log not found" });
                return;
            }
            const updated = await model_1.FuelLogModel.findOneAndUpdate({ id: req.params.id, organization_id: orgId }, { $set: req.body }, { new: true });
            // Update vehicle's running fuel costs
            if (updated && req.body.cost !== undefined) {
                const diff = Number(req.body.cost) - originalLog.cost;
                await model_2.VehicleModel.updateOne({ id: originalLog.vehicleId, organization_id: orgId }, { $inc: { total_fuel_cost: diff } });
            }
            res.json(updated);
        }
        catch (error) {
            next(error);
        }
    }
    static async delete(req, res, next) {
        try {
            const orgId = req.user?.organization_id;
            const log = await model_1.FuelLogModel.findOne({ id: req.params.id, organization_id: orgId });
            if (!log) {
                res.status(404).json({ error: "Fuel log not found" });
                return;
            }
            await model_2.VehicleModel.updateOne({ id: log.vehicleId, organization_id: orgId }, { $inc: { total_fuel_cost: -log.cost } });
            await model_1.FuelLogModel.deleteOne({ id: req.params.id, organization_id: orgId });
            res.json({ success: true, id: req.params.id });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.FuelController = FuelController;
