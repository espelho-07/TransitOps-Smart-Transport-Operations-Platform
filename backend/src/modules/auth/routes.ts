import { Router, Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
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
        roles: user.roles,
        organization_id: user.organization_id.toString()
      }
    });
  } catch (error) {
    next(error);
  }
}) as any);

export const authRouter = router;
export default router;
