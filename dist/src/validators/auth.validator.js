"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserDetailsSchema = exports.changePasswordSchema = exports.setPasswordSchema = exports.emailLoginSchema = exports.googleLoginSchema = exports.emailSignupSchema = exports.googleSignupSchema = void 0;
const joi_1 = __importDefault(require("joi"));
// User signup with Google OAuth (including user details)
exports.googleSignupSchema = joi_1.default.object({
    accessToken: joi_1.default.string().required(),
    email: joi_1.default.string().email().required(),
    name: joi_1.default.string().required().min(2).max(100),
    phone_number: joi_1.default.string().required().min(10).max(15),
    constituency_id: joi_1.default.string().required(),
    panchayat_id: joi_1.default.string().required(),
    ward_no: joi_1.default.string().required().min(1).max(50),
});
// User signup with email and password (including user details)
exports.emailSignupSchema = joi_1.default.object({
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().required().min(6),
    name: joi_1.default.string().required().min(2).max(100),
    phone_number: joi_1.default.string().required().min(10).max(15),
    constituency_id: joi_1.default.string().required(),
    panchayat_id: joi_1.default.string().required(),
    ward_no: joi_1.default.string().required().min(1).max(50),
});
// Google login
exports.googleLoginSchema = joi_1.default.object({
    accessToken: joi_1.default.string().required(),
    email: joi_1.default.string().email().required(),
});
// Email login
exports.emailLoginSchema = joi_1.default.object({
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().required(),
});
// Set password for Google users
exports.setPasswordSchema = joi_1.default.object({
    password: joi_1.default.string().required().min(6),
});
// Change password
exports.changePasswordSchema = joi_1.default.object({
    currentPassword: joi_1.default.string().required(),
    newPassword: joi_1.default.string().required().min(6),
});
// Update user details
exports.updateUserDetailsSchema = joi_1.default.object({
    constituency_id: joi_1.default.string().optional(),
    panchayat_id: joi_1.default.string().optional(),
    ward_no: joi_1.default.string().optional().min(1).max(50),
});
