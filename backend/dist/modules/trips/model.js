"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TripModel = void 0;
const mongoose_1 = require("mongoose");
const TripSchema = new mongoose_1.Schema({
    id: { type: String, required: true, unique: true },
    tripNumber: { type: String, required: true, unique: true },
    vehicleId: { type: String, required: true },
    driverId: { type: String, required: true },
    origin: { type: String, required: true },
    destination: { type: String, required: true },
    status: {
        type: String,
        enum: ["Active", "Completed", "Scheduled", "Cancelled"],
        default: "Scheduled",
    },
    startDate: { type: String, required: true },
    endDate: { type: String, default: null },
    distance: { type: Number, required: true, min: 0 },
    fuelConsumed: { type: Number, default: null },
    cargoWeight: { type: String, required: true },
    organization_id: { type: mongoose_1.Schema.Types.ObjectId, required: true }
}, {
    timestamps: true
});
TripSchema.index({ id: 1 }, { unique: true });
TripSchema.index({ tripNumber: 1 }, { unique: true });
TripSchema.index({ organization_id: 1, status: 1 });
exports.TripModel = (0, mongoose_1.model)("Trip", TripSchema, "trips");
