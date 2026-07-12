import { Router } from "express";
import { authenticate } from "../../middlewares/auth";
import { TripController } from "./controller";

const router = Router();

router.use(authenticate as any);

router.get("/", TripController.getAll as any);
router.get("/:id", TripController.getById as any);
router.post("/", TripController.create as any);
router.put("/:id", TripController.update as any);
router.delete("/:id", TripController.delete as any);

export const tripRouter = router;
export default router;
