import { Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { AuthenticatedRequest } from "../../middlewares/auth";
import { UserModel } from "./model";

export class UserController {
  static async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const isSuperAdmin = req.user?.roles.includes("Super Admin");
      const users = isSuperAdmin
        ? await UserModel.find({}).select("-password_hash")
        : await UserModel.find({ organization_id: req.user?.organization_id }).select("-password_hash");
      res.json(users);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const isSuperAdmin = req.user?.roles.includes("Super Admin");
      const query = isSuperAdmin
        ? { $or: [{ id: req.params.id }, { _id: mongoose.isValidObjectId(req.params.id) ? req.params.id : undefined }] }
        : {
            $or: [{ id: req.params.id }, { _id: mongoose.isValidObjectId(req.params.id) ? req.params.id : undefined }],
            organization_id: req.user?.organization_id
          };

      const user = await UserModel.findOne(query).select("-password_hash");
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }
      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.user?.organization_id;
      const { email, name, role, roles, phone, company, avatar, status } = req.body;

      // Check duplicate
      const existing = await UserModel.findOne({ email });
      if (existing) {
        res.status(400).json({ error: "User with this email already exists." });
        return;
      }

      const count = await UserModel.countDocuments({ organization_id: orgId });
      const nextId = `U${String(count + 1).padStart(3, "0")}`;

      // Automatically generate a temporary password for new staff added by Admin
      const generatedPassword = `TransitOps@${Math.floor(100000 + Math.random() * 900000)}`;
      const password_hash = bcrypt.hashSync(generatedPassword, 10);
      const resolvedRoles = roles || (role ? [role] : ["Fleet Manager"]);

      const newUser = await new UserModel({
        id: nextId,
        email,
        password_hash,
        name,
        role: resolvedRoles[0],
        roles: resolvedRoles,
        phone: phone || null,
        company: company || (req.user as any)?.company || "TransitOps Logistics",
        status: status || "Active",
        avatar: avatar || null,
        organization_id: new mongoose.Types.ObjectId(orgId as string),
      }).save();

      const userObj = newUser.toObject() as any;
      delete userObj.password_hash;
      // Return the generated plaintext password so the Admin can copy it in the UI
      userObj.generatedPassword = generatedPassword;
      res.status(201).json(userObj);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const isSuperAdmin = req.user?.roles.includes("Super Admin");
      const query = isSuperAdmin
        ? { $or: [{ id: req.params.id }, { _id: mongoose.isValidObjectId(req.params.id) ? req.params.id : undefined }] }
        : {
            $or: [{ id: req.params.id }, { _id: mongoose.isValidObjectId(req.params.id) ? req.params.id : undefined }],
            organization_id: req.user?.organization_id
          };

      const updateData = { ...req.body };
      // Never allow direct password update through this route
      delete updateData.password_hash;
      delete updateData.password;

      // Sync role/roles fields
      if (updateData.role && !updateData.roles) updateData.roles = [updateData.role];
      if (updateData.roles && !updateData.role) updateData.role = updateData.roles[0];

      const updated = await UserModel.findOneAndUpdate(
        query,
        { $set: updateData },
        { new: true }
      ).select("-password_hash");

      if (!updated) {
        res.status(404).json({ error: "User not found" });
        return;
      }
      res.json(updated);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const isSuperAdmin = req.user?.roles.includes("Super Admin");
      const query = isSuperAdmin
        ? { $or: [{ id: req.params.id }, { _id: mongoose.isValidObjectId(req.params.id) ? req.params.id : undefined }] }
        : {
            $or: [{ id: req.params.id }, { _id: mongoose.isValidObjectId(req.params.id) ? req.params.id : undefined }],
            organization_id: req.user?.organization_id
          };

      const deleted = await UserModel.findOneAndDelete(query);
      if (!deleted) {
        res.status(404).json({ error: "User not found" });
        return;
      }
      res.json({ success: true, id: req.params.id });
    } catch (error) {
      next(error);
    }
  }
}
