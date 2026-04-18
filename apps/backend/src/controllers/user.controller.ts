import { Request, Response } from "express";
import { userService } from "../services/user.service.js";
import { UserRole } from "@csirs/shared/types";

export class UserController {
  static async getAllUsers(req: Request, res: Response) {
    try {
      const users = await userService.getAllUsers();
      const response = {
        success: true,
        message: "Users retrieved successfully",
        data: users,
      };
      res.status(200).json(response);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async updateUserRole(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { role } = req.body;

      if (!id || typeof id !== "string") {
        return res
          .status(400)
          .json({ success: false, message: "Valid user ID is required" });
      }

      if (!["REPORTER", "ADMIN"].includes(role)) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Invalid role. Must be REPORTER or ADMIN",
          });
      }

      const updatedUser = await userService.updateUserRole(
        id,
        role as UserRole,
      );

      const response = {
        success: true,
        message: "User role updated successfully",
        data: updatedUser,
      };

      res.status(200).json(response);
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}
