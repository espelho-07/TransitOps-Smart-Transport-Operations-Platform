import { Schema, model } from "mongoose";

const ActivitySchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    action: { type: String, required: true },
    user: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: String, required: true },
    organization_id: { type: Schema.Types.ObjectId, required: true }
  },
  {
    timestamps: true
  }
);

ActivitySchema.index({ id: 1 }, { unique: true });
ActivitySchema.index({ organization_id: 1 });

export const ActivityModel = model("Activity", ActivitySchema, "activities");
