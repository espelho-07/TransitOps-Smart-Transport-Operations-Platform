import { Schema, model } from "mongoose";

const NotificationSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    time: { type: String, required: true },
    organization_id: { type: Schema.Types.ObjectId, required: true }
  },
  {
    timestamps: true
  }
);

NotificationSchema.index({ id: 1 }, { unique: true });
NotificationSchema.index({ organization_id: 1 });

export const NotificationModel = model("Notification", NotificationSchema, "notifications");
