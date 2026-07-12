"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DriverModel = void 0;
const mongoose_1 = require("mongoose");
const DriverSchema = new mongoose_1.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    licenseNumber: { type: String, required: true, unique: true },
    status: {
        type: String,
        enum: ["Available", "On Trip", "Inactive"],
        default: "Available",
    },
    ratings: { type: Number, default: 5.0 },
    hireDate: { type: String },
    avatar: { type: String },
    organization_id: { type: mongoose_1.Schema.Types.ObjectId, required: true },
}, {
    timestamps: true,
});
DriverSchema.index({ id: 1 }, { unique: true });
DriverSchema.index({ licenseNumber: 1 }, { unique: true });
DriverSchema.index({ organization_id: 1, status: 1 });
exports.DriverModel = (0, mongoose_1.model)("Driver", DriverSchema, "drivers");
