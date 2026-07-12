"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationRouter = void 0;
const express_1 = require("express");
const auth_1 = require("../../middlewares/auth");
const model_1 = require("./model");
const mongoose_1 = __importDefault(require("mongoose"));
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
// GET all notifications for org
router.get("/", (async (req, res, next) => {
    try {
        const orgId = req.user?.organization_id;
        const notifications = await model_1.NotificationModel.find({ organization_id: orgId }).sort({ createdAt: -1 });
        res.json(notifications);
    }
    catch (error) {
        next(error);
    }
}));
// POST create new notification
router.post("/", (async (req, res, next) => {
    try {
        const orgId = req.user?.organization_id;
        const { title, description, priority, category } = req.body;
        const count = await model_1.NotificationModel.countDocuments();
        const nextId = `N${String(count + 1).padStart(3, "0")}`;
        const notification = await model_1.NotificationModel.create({
            id: nextId,
            title: title || "Notification",
            description: description || "",
            type: priority || "Info",
            priority: priority || "Info",
            category: category || "Fleet",
            time: new Date().toLocaleTimeString(),
            unread: true,
            organization_id: new mongoose_1.default.Types.ObjectId(orgId),
        });
        res.status(201).json(notification);
    }
    catch (error) {
        next(error);
    }
}));
// PATCH mark single notification as read
router.patch("/:id/read", (async (req, res, next) => {
    try {
        const orgId = req.user?.organization_id;
        const updated = await model_1.NotificationModel.findOneAndUpdate({ id: req.params.id, organization_id: orgId }, { $set: { unread: false } }, { new: true });
        if (!updated) {
            res.status(404).json({ error: "Notification not found" });
            return;
        }
        res.json(updated);
    }
    catch (error) {
        next(error);
    }
}));
// PATCH mark ALL notifications as read
router.patch("/read-all", (async (req, res, next) => {
    try {
        const orgId = req.user?.organization_id;
        await model_1.NotificationModel.updateMany({ organization_id: orgId }, { $set: { unread: false } });
        res.json({ success: true });
    }
    catch (error) {
        next(error);
    }
}));
// DELETE clear all notifications for org
router.delete("/", (async (req, res, next) => {
    try {
        const orgId = req.user?.organization_id;
        await model_1.NotificationModel.deleteMany({ organization_id: orgId });
        res.json({ success: true });
    }
    catch (error) {
        next(error);
    }
}));
// DELETE archive (remove) a notification
router.delete("/:id", (async (req, res, next) => {
    try {
        const orgId = req.user?.organization_id;
        const deleted = await model_1.NotificationModel.findOneAndDelete({ id: req.params.id, organization_id: orgId });
        if (!deleted) {
            res.status(404).json({ error: "Notification not found" });
            return;
        }
        res.json({ success: true, id: req.params.id });
    }
    catch (error) {
        next(error);
    }
}));
exports.notificationRouter = router;
exports.default = router;
