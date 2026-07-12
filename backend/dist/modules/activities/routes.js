"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activityRouter = void 0;
const express_1 = require("express");
const auth_1 = require("../../middlewares/auth");
const model_1 = require("./model");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get("/", (async (req, res, next) => {
    try {
        const orgId = req.user?.organization_id;
        const activities = await model_1.ActivityModel.find({ organization_id: orgId });
        res.json(activities);
    }
    catch (error) {
        next(error);
    }
}));
exports.activityRouter = router;
exports.default = router;
