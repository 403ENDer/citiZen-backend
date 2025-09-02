"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userModel_1 = require("../models/userModel");
const types_1 = require("../utils/types");
const adminAuth = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Access token is required",
            });
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // Check if user exists and has admin or department head role
        const user = await userModel_1.userModel.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found",
            });
        }
        // Allow admin and department heads
        if (user.role !== types_1.RoleTypes.ADMIN && user.role !== types_1.RoleTypes.DEPT) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Admin or department head role required.",
            });
        }
        req.user = {
            userId: decoded.userId,
            email: user.email,
            role: user.role,
        };
        next();
    }
    catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token",
        });
    }
};
exports.adminAuth = adminAuth;
