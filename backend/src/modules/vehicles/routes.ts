import { Router } from "express";
import { authenticate } from "../../middlewares/auth";
import { VehicleController } from "./controller";

const router = Router();

router.use(authenticate as any);

router.get("/", VehicleController.getAll as any);
router.get("/:id", VehicleController.getById as any);
router.post("/", VehicleController.create as any);
router.put("/:id", VehicleController.update as any);
router.delete("/:id", VehicleController.delete as any);

// Extra operations
router.post("/:id/duplicate", VehicleController.duplicate as any);
router.patch("/:id/archive", VehicleController.archive as any);

export const vehicleRouter = router;
export default router;
