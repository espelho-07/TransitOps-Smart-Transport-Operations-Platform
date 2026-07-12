import { Schema, model } from "mongoose";

const ExpenseSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    date: { type: String, required: true },
    description: { type: String },
    status: { type: String, enum: ["Approved", "Pending", "Rejected"], default: "Pending" },
    merchant: { type: String },
    organization_id: { type: Schema.Types.ObjectId, required: true }
  },
  {
    timestamps: true
  }
);

ExpenseSchema.index({ id: 1 }, { unique: true });
ExpenseSchema.index({ organization_id: 1, date: -1 });

export const ExpenseModel = model("Expense", ExpenseSchema, "expenses");
