import { Router, Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { env } from "../../config/env";
import { UserModel } from "../users/model";

const router = Router();

router.post("/login", (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required." });
      return;
    }

    // Find user by email
    const user = (await UserModel.findOne({ email })) as any;
    if (!user) {
      res.status(401).json({ error: "Invalid credentials: User not found." });
      return;
    }

    // Verify password hash
    const isPasswordValid = bcrypt.compareSync(password, user.password_hash);
    if (!isPasswordValid) {
      res.status(401).json({ error: "Invalid credentials: Incorrect password." });
      return;
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        roles: user.roles,
        organization_id: user.organization_id.toString(),
      },
      env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role || (user.roles && user.roles[0]) || "Fleet Manager",
        roles: user.roles,
        phone: user.phone || null,
        company: user.company || "TransitOps Logistics",
        avatar: user.avatar || null,
        status: user.status || "Active",
        organization_id: user.organization_id.toString()
      }
    });
  } catch (error) {
    next(error);
  }
}) as any);

router.post("/register", (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password || !name) {
      res.status(400).json({ error: "Name, email, and password are required." });
      return;
    }

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      res.status(400).json({ error: "User already registered with this email." });
      return;
    }

    // Hash password
    const password_hash = bcrypt.hashSync(password, 10);

    // Default mock organization ID
    const orgId = new mongoose.Types.ObjectId("60c72b2f9b1d8b3a7c8c8c8c");

    // Create user in DB
    const newUser = (await new UserModel({
      email,
      password_hash,
      name,
      roles: role ? [role] : ["Fleet Manager"],
      organization_id: orgId
    }).save()) as any;

    // Generate JWT token
    const token = jwt.sign(
      {
        id: newUser._id.toString(),
        email: newUser.email,
        name: newUser.name,
        roles: newUser.roles,
        organization_id: newUser.organization_id.toString(),
      },
      env.JWT_SECRET,
      { expiresIn: "7d" }
    );

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
  } catch (error) {
    next(error);
  }
}) as any);

export const authRouter = router;
export default router;
