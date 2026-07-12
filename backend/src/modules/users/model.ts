import { Schema, model } from "mongoose";

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password_hash: { type: String, required: true },
    name: { type: String, required: true },
    roles: {
      type: [String],
      enum: ["Fleet Manager", "Dispatcher", "Safety Officer", "Financial Analyst"],
      required: true,
    },
    organization_id: { type: Schema.Types.ObjectId, required: true, ref: "Organization" },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ organization_id: 1 });

export const UserModel = model("User", UserSchema, "users");
