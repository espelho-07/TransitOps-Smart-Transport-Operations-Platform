"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpenseController = void 0;
const model_1 = require("./model");
class ExpenseController {
    static async getAll(req, res, next) {
        try {
            const orgId = req.user?.organization_id;
            const expenses = await model_1.ExpenseModel.find({ organization_id: orgId });
            res.json(expenses);
        }
        catch (error) {
            next(error);
        }
    }
    static async getById(req, res, next) {
        try {
            const orgId = req.user?.organization_id;
            const expense = await model_1.ExpenseModel.findOne({ id: req.params.id, organization_id: orgId });
            if (!expense) {
                res.status(404).json({ error: "Expense record not found" });
                return;
            }
            res.json(expense);
        }
        catch (error) {
            next(error);
        }
    }
    static async create(req, res, next) {
        try {
            const orgId = req.user?.organization_id;
            const { category, amount, date, description, status, merchant } = req.body;
            const count = await model_1.ExpenseModel.countDocuments();
            const nextId = `E${String(count + 1).padStart(3, "0")}`;
            const newExpense = await model_1.ExpenseModel.create({
                id: nextId,
                category,
                amount: Number(amount) || 0,
                date: date || new Date().toISOString().split("T")[0],
                description,
                status: status || "Pending",
                merchant,
                organization_id: orgId,
            });
            res.status(201).json(newExpense);
        }
        catch (error) {
            next(error);
        }
    }
    static async update(req, res, next) {
        try {
            const orgId = req.user?.organization_id;
            const updated = await model_1.ExpenseModel.findOneAndUpdate({ id: req.params.id, organization_id: orgId }, { $set: req.body }, { new: true });
            if (!updated) {
                res.status(404).json({ error: "Expense record not found" });
                return;
            }
            res.json(updated);
        }
        catch (error) {
            next(error);
        }
    }
    static async delete(req, res, next) {
        try {
            const orgId = req.user?.organization_id;
            const deleted = await model_1.ExpenseModel.findOneAndDelete({ id: req.params.id, organization_id: orgId });
            if (!deleted) {
                res.status(404).json({ error: "Expense record not found" });
                return;
            }
            res.json({ success: true, id: req.params.id });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ExpenseController = ExpenseController;
