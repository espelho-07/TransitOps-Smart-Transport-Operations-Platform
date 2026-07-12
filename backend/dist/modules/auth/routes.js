"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("../../config/env");
const model_1 = require("../users/model");
const router = (0, express_1.Router)();
router.post("/login", (async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ error: "Email and password are required." });
            return;
        }
        // Find user by email
        const user = (await model_1.UserModel.findOne({ email }));
        if (!user) {
            res.status(401).json({ error: "Invalid credentials: User not found." });
            return;
        }
        // Verify password hash
        const isPasswordValid = bcryptjs_1.default.compareSync(password, user.password_hash);
        if (!isPasswordValid) {
            res.status(401).json({ error: "Invalid credentials: Incorrect password." });
            return;
        }
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            roles: user.roles,
            organization_id: user.organization_id.toString(),
        }, env_1.env.JWT_SECRET, { expiresIn: "7d" });
        res.json({
            success: true,
            token,
            user: {
                id: user._id.toString(),
                email: user.email,
                name: user.name,
                roles: user.roles,
                organization_id: user.organization_id.toString()
            }
        });
    }
    catch (error) {
        next(error);
    }
}));
router.post("/register", (async (req, res, next) => {
    try {
        const { email, password, name, role } = req.body;
        if (!email || !password || !name) {
            res.status(400).json({ error: "Name, email, and password are required." });
            return;
        }
        // Check if user already exists
        const existingUser = await model_1.UserModel.findOne({ email });
        if (existingUser) {
            res.status(400).json({ error: "User already registered with this email." });
            return;
        }
        // Hash password
        const password_hash = bcryptjs_1.default.hashSync(password, 10);
        // Default mock organization ID
        const orgId = new mongoose_1.default.Types.ObjectId("60c72b2f9b1d8b3a7c8c8c8c");
        // Create user in DB
        const newUser = (await new model_1.UserModel({
            email,
            password_hash,
            name,
            roles: role ? [role] : ["Fleet Manager"],
            organization_id: orgId
        }).save());
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({
            id: newUser._id.toString(),
            email: newUser.email,
            name: newUser.name,
            roles: newUser.roles,
            organization_id: newUser.organization_id.toString(),
        }, env_1.env.JWT_SECRET, { expiresIn: "7d" });
        res.status(201).json({
            success: true,
            token,
            user: {
                id: newUser._id.toString(),
                email: newUser.email,
                name: newUser.name,
                roles: newUser.roles,
                organization_id: newUser.organization_id.toString()
            }
        });
    }
    catch (error) {
        next(error);
    }
}));
exports.authRouter = router;
exports.default = router;
