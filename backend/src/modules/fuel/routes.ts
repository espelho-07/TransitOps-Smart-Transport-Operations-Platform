import { Router } from "express";
import { authenticate } from "../../middlewares/auth";
import { FuelController } from "./controller";

const router = Router();

router.use(authenticate as any);

router.get("/", FuelController.getAll as any);
router.get("/:id", FuelController.getById as any);
router.post("/", FuelController.create as any);
router.put("/:id", FuelController.update as any);
router.delete("/:id", FuelController.delete as any);

export const fuelRouter = router;
export default router;
