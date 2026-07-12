"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DriverController = void 0;
const model_1 = require("./model");
class DriverController {
    static async getAll(req, res, next) {
        try {
            const orgId = req.user?.organization_id;
            const drivers = await model_1.DriverModel.find({ organization_id: orgId });
            res.json(drivers);
        }
        catch (error) {
            next(error);
        }
    }
    static async getById(req, res, next) {
        try {
            const orgId = req.user?.organization_id;
            const driver = await model_1.DriverModel.findOne({ id: req.params.id, organization_id: orgId });
            if (!driver) {
                res.status(404).json({ error: "Driver not found" });
                return;
            }
            res.json(driver);
        }
        catch (error) {
            next(error);
        }
    }
    static async create(req, res, next) {
        try {
            const orgId = req.user?.organization_id;
            const count = await model_1.DriverModel.countDocuments();
            const nextId = `D${String(count + 1).padStart(3, "0")}`;
            const avatar = req.body.name
                ? req.body.name.split(" ").map((n) => n[0]).join("").toUpperCase()
                : "DR";
            const newDriver = await model_1.DriverModel.create({
                ...req.body,
                id: nextId,
                avatar,
                ratings: req.body.ratings || 5.0,
                hireDate: req.body.hireDate || new Date().toISOString().split("T")[0],
                organization_id: orgId,
            });
            res.status(201).json(newDriver);
        }
        catch (error) {
            next(error);
        }
    }
    static async update(req, res, next) {
        try {
            const orgId = req.user?.organization_id;
            const updated = await model_1.DriverModel.findOneAndUpdate({ id: req.params.id, organization_id: orgId }, { $set: req.body }, { new: true });
            if (!updated) {
                res.status(404).json({ error: "Driver not found" });
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
            const deleted = await model_1.DriverModel.findOneAndDelete({ id: req.params.id, organization_id: orgId });
            if (!deleted) {
                res.status(404).json({ error: "Driver not found" });
                return;
            }
            res.json({ success: true, id: req.params.id });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.DriverController = DriverController;
