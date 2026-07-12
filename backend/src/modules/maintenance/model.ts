import { Schema, model } from "mongoose";

const MaintenanceSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    vehicleId: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, enum: ["Preventive", "Repair", "Routine"], required: true },
    cost: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["In Progress", "Scheduled", "Completed"],
      default: "Scheduled",
    },
    date: { type: String, required: true },
    notes: { type: String },
    priority: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },
    mechanic: { type: String },
    organization_id: { type: Schema.Types.ObjectId, required: true }
  },
  {
    timestamps: true
  }
);

MaintenanceSchema.index({ id: 1 }, { unique: true });
MaintenanceSchema.index({ vehicleId: 1, status: 1 });
MaintenanceSchema.index({ organization_id: 1, date: -1 });

export const MaintenanceModel = model("Maintenance", MaintenanceSchema, "maintenance");
