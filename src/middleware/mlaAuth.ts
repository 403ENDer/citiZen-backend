import { Request, Response, NextFunction } from "express";
import { userModel } from "../models/userModel";
import { RoleTypes } from "../utils/types";

interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export const mlaAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user_id = req.user?.userId;

    if (!user_id) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    // Check if user exists and has MLA role
    const user = await userModel.findById(user_id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role !== RoleTypes.MLASTAFF) {
      return res.status(403).json({
        success: false,
        message: "Access denied. MLA role required.",
      });
    }

    next();
  } catch (error) {
    console.error("Error in MLA authentication middleware:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during authentication",
    });
  }
};
