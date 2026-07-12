import { Router, Response, NextFunction } from "express";
import { authenticate, AuthenticatedRequest } from "../../middlewares/auth";
import { NotificationModel } from "./model";
import mongoose from "mongoose";

const router = Router();

router.use(authenticate as any);

// GET all notifications for org
router.get("/", (async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const orgId = req.user?.organization_id;
    const notifications = await NotificationModel.find({ organization_id: orgId }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    next(error);
  }
}) as any);

// POST create new notification
router.post("/", (async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const orgId = req.user?.organization_id;
    const { title, description, priority, category } = req.body;

    const count = await NotificationModel.countDocuments();
    const nextId = `N${String(count + 1).padStart(3, "0")}`;

    const notification = await NotificationModel.create({
      id: nextId,
      title: title || "Notification",
      description: description || "",
      type: priority || "Info",
      priority: priority || "Info",
      category: category || "Fleet",
      time: new Date().toLocaleTimeString(),
      unread: true,
      organization_id: new mongoose.Types.ObjectId(orgId as string),
    });

    res.status(201).json(notification);
  } catch (error) {
    next(error);
  }
}) as any);

// PATCH mark single notification as read
router.patch("/:id/read", (async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const orgId = req.user?.organization_id;
    const updated = await NotificationModel.findOneAndUpdate(
      { id: req.params.id, organization_id: orgId },
      { $set: { unread: false } },
      { new: true }
    );
    if (!updated) {
      res.status(404).json({ error: "Notification not found" });
      return;
    }
    res.json(updated);
  } catch (error) {
    next(error);
  }
}) as any);

// PATCH mark ALL notifications as read
router.patch("/read-all", (async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const orgId = req.user?.organization_id;
    await NotificationModel.updateMany({ organization_id: orgId }, { $set: { unread: false } });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
}) as any);

// DELETE clear all notifications for org
router.delete("/", (async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const orgId = req.user?.organization_id;
    await NotificationModel.deleteMany({ organization_id: orgId });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
}) as any);

// DELETE archive (remove) a notification
router.delete("/:id", (async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const orgId = req.user?.organization_id;
    const deleted = await NotificationModel.findOneAndDelete({ id: req.params.id, organization_id: orgId });
    if (!deleted) {
      res.status(404).json({ error: "Notification not found" });
      return;
    }
    res.json({ success: true, id: req.params.id });
  } catch (error) {
    next(error);
  }
}) as any);

export const notificationRouter = router;
export default router;
