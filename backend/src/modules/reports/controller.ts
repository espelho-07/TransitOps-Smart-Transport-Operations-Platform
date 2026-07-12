import { Response, NextFunction } from "express";
import mongoose from "mongoose";
import { AuthenticatedRequest } from "../../middlewares/auth";
import { ReportModel } from "./model";

export class ReportController {
  static async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.user?.organization_id;
      const reports = await ReportModel.find({ organization_id: orgId }).sort({ createdAt: -1 });
      res.json(reports);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.user?.organization_id;
      const report = await ReportModel.findOne({ id: req.params.id, organization_id: orgId });
      if (!report) {
        res.status(404).json({ error: "Report not found" });
        return;
      }
      res.json(report);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.user?.organization_id;
      const count = await ReportModel.countDocuments();
      const nextId = `R${String(count + 1).padStart(3, "0")}`;

      const fileSizeKB = Math.floor(Math.random() * 200) + 10;

      const newReport = await ReportModel.create({
        id: nextId,
        title: req.body.title || "Fleet Report",
        type: req.body.type || "General",
        status: "Generated",
        date: new Date().toISOString().split("T")[0],
        fileSize: `${fileSizeKB} KB`,
        generatedBy: req.user?.name || "System",
        format: req.body.format || "PDF",
        organization_id: new mongoose.Types.ObjectId(orgId as string),
        ...req.body,
      });

      res.status(201).json(newReport);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.user?.organization_id;
      const deleted = await ReportModel.findOneAndDelete({ id: req.params.id, organization_id: orgId });
      if (!deleted) {
        res.status(404).json({ error: "Report not found" });
        return;
      }
      res.json({ success: true, id: req.params.id });
    } catch (error) {
      next(error);
    }
  }
}
