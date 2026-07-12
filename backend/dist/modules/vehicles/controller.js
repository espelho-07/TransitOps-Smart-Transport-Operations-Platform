"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VehicleController = void 0;
const model_1 = require("./model");
class VehicleController {
    static async getAll(req, res, next) {
        try {
            const orgId = req.user?.organization_id;
            const vehicles = await model_1.VehicleModel.find({ organization_id: orgId });
            res.json(vehicles);
        }
        catch (error) {
            next(error);
        }
    }
    static async getById(req, res, next) {
        try {
            const orgId = req.user?.organization_id;
            const vehicle = await model_1.VehicleModel.findOne({ id: req.params.id, organization_id: orgId });
            if (!vehicle) {
                res.status(404).json({ error: "Vehicle not found" });
                return;
            }
            res.json(vehicle);
        }
        catch (error) {
            next(error);
        }
    }
    static async create(req, res, next) {
        try {
            const orgId = req.user?.organization_id;
            // Auto-increment custom ID
            const count = await model_1.VehicleModel.countDocuments();
            const nextId = `V${String(count + 1).padStart(3, "0")}`;
            const newVehicle = await model_1.VehicleModel.create({
                ...req.body,
                id: nextId,
                organization_id: orgId,
            });
            res.status(201).json(newVehicle);
        }
        catch (error) {
            next(error);
        }
    }
    static async update(req, res, next) {
        try {
            const orgId = req.user?.organization_id;
            const updated = await model_1.VehicleModel.findOneAndUpdate({ id: req.params.id, organization_id: orgId }, { $set: req.body }, { new: true });
            if (!updated) {
                res.status(404).json({ error: "Vehicle not found" });
                return;
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
            const deleted = await model_1.VehicleModel.findOneAndDelete({ id: req.params.id, organization_id: orgId });
            if (!deleted) {
                res.status(404).json({ error: "Vehicle not found" });
                return;
            }
            res.json({ success: true, id: req.params.id });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.VehicleController = VehicleController;
