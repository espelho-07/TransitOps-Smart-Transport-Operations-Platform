"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vehicleRouter = void 0;
const express_1 = require("express");
const auth_1 = require("../../middlewares/auth");
const controller_1 = require("./controller");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get("/", controller_1.VehicleController.getAll);
router.get("/:id", controller_1.VehicleController.getById);
router.post("/", controller_1.VehicleController.create);
router.put("/:id", controller_1.VehicleController.update);
router.delete("/:id", controller_1.VehicleController.delete);
// Extra operations
router.post("/:id/duplicate", controller_1.VehicleController.duplicate);
router.patch("/:id/archive", controller_1.VehicleController.archive);
exports.vehicleRouter = router;
exports.default = router;
