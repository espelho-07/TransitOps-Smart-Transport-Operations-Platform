"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaintenanceController = void 0;
const model_1 = require("./model");
const model_2 = require("../vehicles/model");
class MaintenanceController {
    static async getAll(req, res, next) {
        try {
            const orgId = req.user?.organization_id;
            const records = await model_1.MaintenanceModel.find({ organization_id: orgId });
            res.json(records);
        }
        catch (error) {
            next(error);
        }
    }
    static async getById(req, res, next) {
        try {
            const orgId = req.user?.organization_id;
            const record = await model_1.MaintenanceModel.findOne({ id: req.params.id, organization_id: orgId });
            if (!record) {
                res.status(404).json({ error: "Maintenance record not found" });
                return;
            }
            res.json(record);
        }
        catch (error) {
            next(error);
        }
    }
    static async create(req, res, next) {
        try {
            const orgId = req.user?.organization_id;
            const { vehicleId, type, cost, description, priority, mechanic } = req.body;
            const vehicle = await model_2.VehicleModel.findOne({ id: vehicleId, organization_id: orgId });
            if (!vehicle) {
                res.status(404).json({ error: `Vehicle ${vehicleId} not found.` });
                return;
            }
            const count = await model_1.MaintenanceModel.countDocuments();
            const nextId = `M${String(count + 1).padStart(3, "0")}`;
            const newRecord = await model_1.MaintenanceModel.create({
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
            await model_2.VehicleModel.updateOne({ id: vehicleId, organization_id: orgId }, { $set: { status: "Maintenance" } });
            res.status(201).json(newRecord);
        }
        catch (error) {
            next(error);
        }
    }
    static async update(req, res, next) {
        try {
            const orgId = req.user?.organization_id;
            const { status } = req.body;
            const record = await model_1.MaintenanceModel.findOne({ id: req.params.id, organization_id: orgId });
            if (!record) {
                res.status(404).json({ error: "Maintenance record not found" });
                return;
            }
            const updated = await model_1.MaintenanceModel.findOneAndUpdate({ id: req.params.id, organization_id: orgId }, { $set: req.body }, { new: true });
            // If marked Completed, release vehicle back to Available
            if (status === "Completed" && record.status !== "Completed") {
                await model_2.VehicleModel.updateOne({ id: record.vehicleId, organization_id: orgId }, {
                    $set: { status: "Available" },
                    $inc: { total_maintenance_cost: record.cost }
                });
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
            const record = await model_1.MaintenanceModel.findOne({ id: req.params.id, organization_id: orgId });
            if (!record) {
                res.status(404).json({ error: "Maintenance record not found" });
                return;
            }
            // If active, release vehicle back to Available
            if (record.status !== "Completed") {
                await model_2.VehicleModel.updateOne({ id: record.vehicleId, organization_id: orgId }, { $set: { status: "Available" } });
            }
            await model_1.MaintenanceModel.deleteOne({ id: req.params.id, organization_id: orgId });
            res.json({ success: true, id: req.params.id });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.MaintenanceController = MaintenanceController;
