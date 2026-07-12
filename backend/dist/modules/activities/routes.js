"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activityRouter = void 0;
const express_1 = require("express");
const auth_1 = require("../../middlewares/auth");
const model_1 = require("./model");
const mongoose_1 = __importDefault(require("mongoose"));
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
// GET all activities for org (sorted newest first)
router.get("/", (async (req, res, next) => {
    try {
        const orgId = req.user?.organization_id;
        const activities = await model_1.ActivityModel.find({ organization_id: orgId }).sort({ createdAt: -1 });
        res.json(activities);
    }
    catch (error) {
        next(error);
    }
}));
// POST create new activity log entry
router.post("/", (async (req, res, next) => {
    try {
        const orgId = req.user?.organization_id;
        const { action, description, user: actorName } = req.body;
        const count = await model_1.ActivityModel.countDocuments({ organization_id: orgId });
        const nextId = `A${String(count + 1).padStart(3, "0")}`;
        const activity = await model_1.ActivityModel.create({
            id: nextId,
            action: action || "System Action",
            description: description || "",
            user: actorName || req.user?.name || "System",
            date: new Date().toLocaleString(),
            status: "success",
            organization_id: new mongoose_1.default.Types.ObjectId(orgId),
        });
        res.status(201).json(activity);
    }
    catch (error) {
        next(error);
    }
}));
exports.activityRouter = router;
exports.default = router;
