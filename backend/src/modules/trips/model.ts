import { Schema, model } from "mongoose";

const TripSchema = new Schema(
  {
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
    organization_id: { type: Schema.Types.ObjectId, required: true }
  },
  {
    timestamps: true
  }
);

TripSchema.index({ id: 1 }, { unique: true });
TripSchema.index({ tripNumber: 1 }, { unique: true });
TripSchema.index({ organization_id: 1, status: 1 });

export const TripModel = model("Trip", TripSchema, "trips");
