import { Router, Response, NextFunction } from "express";
import { authenticate, AuthenticatedRequest } from "../../middlewares/auth";
import { NotificationModel } from "./model";

const router = Router();

router.use(authenticate as any);

router.get("/", (async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const orgId = req.user?.organization_id;
    const notifications = await NotificationModel.find({ organization_id: orgId });
    res.json(notifications);
  } catch (error) {
    next(error);
  }
}) as any);

export const notificationRouter = router;
export default router;
