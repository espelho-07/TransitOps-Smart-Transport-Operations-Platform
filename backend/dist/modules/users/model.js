"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongoose_1 = require("mongoose");
const UserSchema = new mongoose_1.Schema({
    email: { type: String, required: true, unique: true },
    password_hash: { type: String, required: true },
    name: { type: String, required: true },
    roles: {
        type: [String],
        enum: ["Fleet Manager", "Dispatcher", "Safety Officer", "Financial Analyst"],
        required: true,
    },
    organization_id: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: "Organization" },
}, {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
});
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ organization_id: 1 });
exports.UserModel = (0, mongoose_1.model)("User", UserSchema, "users");
