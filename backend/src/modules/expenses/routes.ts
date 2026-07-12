import { Router } from "express";
import { authenticate } from "../../middlewares/auth";
import { ExpenseController } from "./controller";

const router = Router();

router.use(authenticate as any);

router.get("/", ExpenseController.getAll as any);
router.get("/:id", ExpenseController.getById as any);
router.post("/", ExpenseController.create as any);
router.put("/:id", ExpenseController.update as any);
router.delete("/:id", ExpenseController.delete as any);

export const expenseRouter = router;
export default router;
