import { Router } from "express";
import { authenticate } from "../../middlewares/auth";
import { DriverController } from "./controller";

const router = Router();

router.use(authenticate as any);

router.get("/", DriverController.getAll as any);
router.get("/:id", DriverController.getById as any);
router.post("/", DriverController.create as any);
router.put("/:id", DriverController.update as any);
router.delete("/:id", DriverController.delete as any);

export const driverRouter = router;
export default router;
