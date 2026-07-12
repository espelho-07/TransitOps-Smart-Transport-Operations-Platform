import { Schema, model } from "mongoose";

const DriverSchema = new Schema(
  {
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
    organization_id: { type: Schema.Types.ObjectId, required: true },
  },
  {
    timestamps: true,
  }
);

DriverSchema.index({ id: 1 }, { unique: true });
DriverSchema.index({ licenseNumber: 1 }, { unique: true });
DriverSchema.index({ organization_id: 1, status: 1 });

export const DriverModel = model("Driver", DriverSchema, "drivers");
