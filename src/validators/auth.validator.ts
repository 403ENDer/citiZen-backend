import Joi from "joi";

// User signup with Google OAuth (including user details)
export const googleSignupSchema = Joi.object({
  accessToken: Joi.string().required(),
  email: Joi.string().email().required(),
  name: Joi.string().required().min(2).max(100),
  phone_number: Joi.string().required().min(10).max(15),
  constituency_id: Joi.string().required(),
  panchayat_id: Joi.string().required(),
  ward_no: Joi.string().required().min(1).max(50),
});

// User signup with email and password (including user details)
export const emailSignupSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required().min(6),
  name: Joi.string().required().min(2).max(100),
  phone_number: Joi.string().required().min(10).max(15),
  constituency_id: Joi.string().required(),
  panchayat_id: Joi.string().required(),
  ward_no: Joi.string().required().min(1).max(50),
});

// Google login
export const googleLoginSchema = Joi.object({
  accessToken: Joi.string().required(),
  email: Joi.string().email().required(),
});

// Email login
export const emailLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// Set password for Google users
export const setPasswordSchema = Joi.object({
  password: Joi.string().required().min(6),
});

// Change password
export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().required().min(6),
});

// Update user details
export const updateUserDetailsSchema = Joi.object({
  constituency_id: Joi.string().optional(),
  panchayat_id: Joi.string().optional(),
  ward_no: Joi.string().optional().min(1).max(50),
});
