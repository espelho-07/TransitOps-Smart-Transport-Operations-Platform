"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpenseModel = void 0;
const mongoose_1 = require("mongoose");
const ExpenseSchema = new mongoose_1.Schema({
    id: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    date: { type: String, required: true },
    description: { type: String },
    status: { type: String, enum: ["Approved", "Pending", "Rejected"], default: "Pending" },
    merchant: { type: String },
    organization_id: { type: mongoose_1.Schema.Types.ObjectId, required: true }
}, {
    timestamps: true
});
ExpenseSchema.index({ id: 1 }, { unique: true });
ExpenseSchema.index({ organization_id: 1, date: -1 });
exports.ExpenseModel = (0, mongoose_1.model)("Expense", ExpenseSchema, "expenses");
