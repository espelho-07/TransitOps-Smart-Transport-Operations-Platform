import { Schema, model } from "mongoose";

const UserSchema = new Schema(
  {
    id: { type: String, default: null },
    email: { type: String, required: true, unique: true },
    password_hash: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, default: null }, // single role alias
    roles: {
      type: [String],
      enum: ["Admin", "Fleet Manager", "Dispatcher", "Driver", "Safety Officer", "Financial Analyst"],
      required: true,
    },
    phone: { type: String, default: null },
    company: { type: String, default: "TransitOps Logistics" },
    status: { type: String, enum: ["Active", "Inactive", "Pending"], default: "Active" },
    avatar: { type: String, default: null },
    coverImage: { type: String, default: null },
    organization_id: { type: Schema.Types.ObjectId, required: true, ref: "Organization" },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ organization_id: 1 });

export const UserModel = model("User", UserSchema, "users");
