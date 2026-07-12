import { Router, Response, NextFunction } from "express";
import { authenticate, AuthenticatedRequest } from "../../middlewares/auth";
import { ActivityModel } from "./model";

const router = Router();

router.use(authenticate as any);

router.get("/", (async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const orgId = req.user?.organization_id;
    const activities = await ActivityModel.find({ organization_id: orgId });
    res.json(activities);
  } catch (error) {
    next(error);
  }
}) as any);

export const activityRouter = router;
export default router;
