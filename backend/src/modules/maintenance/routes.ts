import { Router } from "express";
import { authenticate } from "../../middlewares/auth";
import { MaintenanceController } from "./controller";

const router = Router();

router.use(authenticate as any);

router.get("/", MaintenanceController.getAll as any);
router.get("/:id", MaintenanceController.getById as any);
router.post("/", MaintenanceController.create as any);
router.put("/:id", MaintenanceController.update as any);
router.delete("/:id", MaintenanceController.delete as any);

export const maintenanceRouter = router;
export default router;
