import { Router } from "express";
import { authenticate } from "../../middlewares/auth";
import { UserController } from "./controller";

const router = Router();

router.use(authenticate as any);

router.get("/", UserController.getAll as any);
router.get("/:id", UserController.getById as any);
router.post("/", UserController.create as any);
router.put("/:id", UserController.update as any);
router.delete("/:id", UserController.delete as any);

export const usersRouter = router;
export default router;
