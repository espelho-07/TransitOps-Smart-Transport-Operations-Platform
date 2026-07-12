import { Router, Response, NextFunction } from "express";
import { authenticate, AuthenticatedRequest } from "../../middlewares/auth";
import { ActivityModel } from "./model";
import mongoose from "mongoose";

const router = Router();

router.use(authenticate as any);

// GET all activities for org (sorted newest first)
router.get("/", (async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const orgId = req.user?.organization_id;
    const activities = await ActivityModel.find({ organization_id: orgId }).sort({ createdAt: -1 });
    res.json(activities);
  } catch (error) {
    next(error);
  }
}) as any);

// POST create new activity log entry
router.post("/", (async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const orgId = req.user?.organization_id;
    const { action, description, user: actorName } = req.body;

    const count = await ActivityModel.countDocuments();
    const nextId = `A${String(count + 1).padStart(3, "0")}`;

    const activity = await ActivityModel.create({
      id: nextId,
      action: action || "System Action",
      description: description || "",
      user: actorName || req.user?.name || "System",
      date: new Date().toLocaleString(),
      status: "success",
      organization_id: new mongoose.Types.ObjectId(orgId as string),
    });

    res.status(201).json(activity);
  } catch (error) {
    next(error);
  }
}) as any);

export const activityRouter = router;
export default router;
