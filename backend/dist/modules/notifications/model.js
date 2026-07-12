"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationModel = void 0;
const mongoose_1 = require("mongoose");
const NotificationSchema = new mongoose_1.Schema({
    id: { type: String, required: true, unique: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    time: { type: String, required: true },
    organization_id: { type: mongoose_1.Schema.Types.ObjectId, required: true }
}, {
    timestamps: true
});
NotificationSchema.index({ id: 1 }, { unique: true });
NotificationSchema.index({ organization_id: 1 });
exports.NotificationModel = (0, mongoose_1.model)("Notification", NotificationSchema, "notifications");
