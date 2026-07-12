"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityModel = void 0;
const mongoose_1 = require("mongoose");
const ActivitySchema = new mongoose_1.Schema({
    id: { type: String, required: true, unique: true },
    action: { type: String, required: true },
    user: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: String, required: true },
    status: { type: String, default: "success" },
    organization_id: { type: mongoose_1.Schema.Types.ObjectId, required: true }
}, {
    timestamps: true
});
ActivitySchema.index({ id: 1 }, { unique: true });
ActivitySchema.index({ organization_id: 1 });
exports.ActivityModel = (0, mongoose_1.model)("Activity", ActivitySchema, "activities");
