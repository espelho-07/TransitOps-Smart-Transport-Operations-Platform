import { Router } from "express";
import { authenticate } from "../../middlewares/auth";
import { DashboardController } from "./controller";

const router = Router();

router.use(authenticate as any);

router.get("/kpis", DashboardController.getKPIs as any);
router.get("/charts", DashboardController.getChartsData as any);
router.get("/insights", DashboardController.getInsights as any);

export const dashboardRouter = router;
export default router;
