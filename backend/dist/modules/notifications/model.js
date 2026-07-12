"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationModel = void 0;
const mongoose_1 = require("mongoose");
const NotificationSchema = new mongoose_1.Schema({
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    type: { type: String, default: "Info" }, // alias for priority
    priority: { type: String, enum: ["Info", "Warning", "Critical", "Success"], default: "Info" },
    category: { type: String, default: "Fleet" },
    time: { type: String, required: true },
    unread: { type: Boolean, default: true },
    organization_id: { type: mongoose_1.Schema.Types.ObjectId, required: true }
}, {
    timestamps: true
});
NotificationSchema.index({ id: 1 }, { unique: true });
NotificationSchema.index({ organization_id: 1, createdAt: -1 });
exports.NotificationModel = (0, mongoose_1.model)("Notification", NotificationSchema, "notifications");
