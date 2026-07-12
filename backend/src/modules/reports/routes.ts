import { Router } from "express";
import { authenticate } from "../../middlewares/auth";
import { ReportController } from "./controller";

const router = Router();

router.use(authenticate as any);

router.get("/", ReportController.getAll as any);
router.get("/:id", ReportController.getById as any);
router.post("/", ReportController.create as any);
router.delete("/:id", ReportController.delete as any);

export const reportsRouter = router;
export default router;
