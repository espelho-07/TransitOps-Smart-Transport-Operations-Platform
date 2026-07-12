import { Schema, model } from "mongoose";

const VehicleSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    plateNumber: { type: String, required: true, unique: true },
    make: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number, required: true },
    type: { type: String, required: true },
    status: {
      type: String,
      enum: ["Available", "On Trip", "Maintenance", "Retired"],
      default: "Available",
    },
    fuelType: { type: String, default: "Diesel" },
    odometer: { type: Number, required: true, min: 0 },
    registrationExpiry: { type: String },
    lastServiceDate: { type: String },
    carrierCap: { type: String },
    organization_id: { type: Schema.Types.ObjectId, required: true },
    isArchived: { type: Boolean, default: false },
    assignedDriverId: { type: String, default: null },
    assignedTripId: { type: String, default: null },
    
    // Denormalized metrics for operational efficiency
    total_fuel_cost: { type: Number, default: 0 },
    total_maintenance_cost: { type: Number, default: 0 },
    total_revenue: { type: Number, default: 0 },
    total_distance_traveled: { type: Number, default: 0 },
    total_fuel_consumed_liters: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

VehicleSchema.index({ id: 1 }, { unique: true });
VehicleSchema.index({ plateNumber: 1 }, { unique: true });
VehicleSchema.index({ organization_id: 1, status: 1 });

export const VehicleModel = model("Vehicle", VehicleSchema, "vehicles");
