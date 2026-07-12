"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationRouter = void 0;
const express_1 = require("express");
const auth_1 = require("../../middlewares/auth");
const model_1 = require("./model");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get("/", (async (req, res, next) => {
    try {
        const orgId = req.user?.organization_id;
        const notifications = await model_1.NotificationModel.find({ organization_id: orgId });
        res.json(notifications);
    }
    catch (error) {
        next(error);
    }
}));
exports.notificationRouter = router;
exports.default = router;
