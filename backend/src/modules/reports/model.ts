import { Schema, model } from "mongoose";

const ReportSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    type: { type: String, required: true },
    status: { type: String, enum: ["Generated", "Processing", "Failed"], default: "Generated" },
    date: { type: String, required: true },
    fileSize: { type: String, default: "N/A" },
    generatedBy: { type: String, default: "System" },
    format: { type: String, default: "PDF" },
    organization_id: { type: Schema.Types.ObjectId, required: true }
  },
  {
    timestamps: true
  }
);

ReportSchema.index({ id: 1 }, { unique: true });
ReportSchema.index({ organization_id: 1, createdAt: -1 });

export const ReportModel = model("Report", ReportSchema, "reports");
