import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../middlewares/auth";
import { ExpenseModel } from "./model";

export class ExpenseController {
  static async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.user?.organization_id;
      const expenses = await ExpenseModel.find({ organization_id: orgId });
      res.json(expenses);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.user?.organization_id;
      const expense = await ExpenseModel.findOne({ id: req.params.id, organization_id: orgId });
      if (!expense) {
        res.status(404).json({ error: "Expense record not found" });
        return;
      }
      res.json(expense);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.user?.organization_id;
      const { category, amount, date, description, status, merchant } = req.body;

      const count = await ExpenseModel.countDocuments();
      const nextId = `E${String(count + 1).padStart(3, "0")}`;

      const newExpense = await ExpenseModel.create({
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
    } catch (error) {
      next(error);
    }
  }

  static async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.user?.organization_id;
      const updated = await ExpenseModel.findOneAndUpdate(
        { id: req.params.id, organization_id: orgId },
        { $set: req.body },
        { new: true }
      );
      if (!updated) {
        res.status(404).json({ error: "Expense record not found" });
        return;
      }
      res.json(updated);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.user?.organization_id;
      const deleted = await ExpenseModel.findOneAndDelete({ id: req.params.id, organization_id: orgId });
      if (!deleted) {
        res.status(404).json({ error: "Expense record not found" });
        return;
      }
      res.json({ success: true, id: req.params.id });
    } catch (error) {
      next(error);
    }
  }
}
