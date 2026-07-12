import { Schema, model } from "mongoose";

const FuelLogSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    vehicleId: { type: String, required: true },
    driverId: { type: String, required: true },
    date: { type: String, required: true },
    quantity: { type: Number, required: true, min: 0 },
    cost: { type: Number, required: true, min: 0 },
    odometer: { type: Number, required: true, min: 0 },
    stationName: { type: String, required: true },
    receiptNumber: { type: String, required: true },
    organization_id: { type: Schema.Types.ObjectId, required: true }
  },
  {
    timestamps: true
  }
);

FuelLogSchema.index({ id: 1 }, { unique: true });
FuelLogSchema.index({ vehicleId: 1, date: -1 });
FuelLogSchema.index({ organization_id: 1, date: -1 });

export const FuelLogModel = model("FuelLog", FuelLogSchema, "fuel_logs");
