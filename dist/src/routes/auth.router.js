"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_1 = require("../middleware/auth");
const auth_validator_1 = require("../validators/auth.validator");
const router = (0, express_1.Router)();
// Validation middleware
const validateGoogleSignup = (req, res, next) => {
    const { error } = auth_validator_1.googleSignupSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: "Validation error",
            error: error.details[0].message,
        });
    }
    next();
};
const validateEmailSignup = (req, res, next) => {
    const { error } = auth_validator_1.emailSignupSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: "Validation error",
            error: error.details[0].message,
        });
    }
    next();
};
const validateGoogleLogin = (req, res, next) => {
    const { error } = auth_validator_1.googleLoginSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: "Validation error",
            error: error.details[0].message,
        });
    }
    next();
};
const validateEmailLogin = (req, res, next) => {
    const { error } = auth_validator_1.emailLoginSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: "Validation error",
            error: error.details[0].message,
        });
    }
    next();
};
const validateSetPassword = (req, res, next) => {
    const { error } = auth_validator_1.setPasswordSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: "Validation error",
            error: error.details[0].message,
        });
    }
    next();
};
const validateChangePassword = (req, res, next) => {
    const { error } = auth_validator_1.changePasswordSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: "Validation error",
            error: error.details[0].message,
        });
    }
    next();
};
const validateUpdateUserDetails = (req, res, next) => {
    const { error } = auth_validator_1.updateUserDetailsSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: "Validation error",
            error: error.details[0].message,
        });
    }
    next();
};
/**
 * @swagger
 * tags:
 *   - name: Authentication
 *     description: User authentication and authorization endpoints
 */
/**
 * @swagger
 * /api/auth/signup/email:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Sign up with email and password
 *     description: Create a new user account using email and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *               - phone_number
 *               - constituency_id
 *               - panchayat_id
 *               - ward_no
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *                 example: "john.doe@example.com"
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: User's password (minimum 6 characters)
 *                 example: "password123"
 *               name:
 *                 type: string
 *                 description: User's full name
 *                 example: "John Doe"
 *               phone_number:
 *                 type: string
 *                 description: User's phone number
 *                 example: "+1234567890"
 *               constituency_id:
 *                 type: string
 *                 description: Constituency ID where user is located
 *                 example: "507f1f77bcf86cd799439011"
 *               panchayat_id:
 *                 type: string
 *                 description: Panchayat ID where user is located
 *                 example: "507f1f77bcf86cd799439012"
 *               ward_no:
 *                 type: string
 *                 description: Ward number where user is located
 *                 example: "W001"
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User created successfully"
 *                 token:
 *                   type: string
 *                   description: JWT authentication token
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "507f1f77bcf86cd799439011"
 *                     name:
 *                       type: string
 *                       example: "John Doe"
 *                     email:
 *                       type: string
 *                       example: "john.doe@example.com"
 *                     role:
 *                       type: string
 *                       enum: [citizen, mlastaff, dept, dept_staff]
 *                       example: "citizen"
 *                     is_verified:
 *                       type: boolean
 *                       example: false
 *                     hasPassword:
 *                       type: boolean
 *                       example: true
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Email, password, name, and phone number are required"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */
// 3. Signup with Email and Password
router.post("/signup/email", validateEmailSignup, auth_controller_1.AuthController.signupWithEmail);
/**
 * @swagger
 * /api/auth/login/google:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Login with Google OAuth
 *     description: Authenticate user using Google OAuth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - accessToken
 *               - email
 *             properties:
 *               accessToken:
 *                 type: string
 *                 description: Google OAuth access token
 *                 example: "ya29.a0AfH6SMC..."
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *                 example: "john.doe@example.com"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Login successful"
 *                 token:
 *                   type: string
 *                   description: JWT authentication token
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "507f1f77bcf86cd799439011"
 *                     name:
 *                       type: string
 *                       example: "John Doe"
 *                     email:
 *                       type: string
 *                       example: "john.doe@example.com"
 *                     role:
 *                       type: string
 *                       enum: [citizen, mlastaff, dept, dept_staff]
 *                       example: "citizen"
 *                     is_verified:
 *                       type: boolean
 *                       example: true
 *                     hasPassword:
 *                       type: boolean
 *                       example: true
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Access token and email are required"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "User not found. Please sign up first."
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */
// 4. Login with Google
router.post("/login/google", validateGoogleLogin, auth_controller_1.AuthController.loginWithGoogle);
/**
 * @swagger
 * /api/auth/login/email:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Login with email and password
 *     description: Authenticate user using email and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *                 example: "john.doe@example.com"
 *               password:
 *                 type: string
 *                 description: User's password
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Login successful"
 *                 token:
 *                   type: string
 *                   description: JWT authentication token
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "507f1f77bcf86cd799439011"
 *                     name:
 *                       type: string
 *                       example: "John Doe"
 *                     email:
 *                       type: string
 *                       example: "john.doe@example.com"
 *                     role:
 *                       type: string
 *                       enum: [citizen, mlastaff, dept, dept_staff]
 *                       example: "citizen"
 *                     is_verified:
 *                       type: boolean
 *                       example: true
 *                     hasPassword:
 *                       type: boolean
 *                       example: true
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Email and password are required"
 *       401:
 *         description: Unauthorized - invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid password"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */
// 5. Login with Email and Password
router.post("/login/email", validateEmailLogin, auth_controller_1.AuthController.loginWithEmail);
/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Change user password
 *     description: Change the current user's password
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 description: Current password
 *                 example: "oldpassword123"
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *                 description: New password (minimum 6 characters)
 *                 example: "newpassword123"
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Password changed successfully"
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Current password and new password are required"
 *       401:
 *         description: Unauthorized - invalid credentials or token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Current password is incorrect"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */
// 6. Change Password
router.post("/change-password", auth_1.auth, validateChangePassword, auth_controller_1.AuthController.changePassword);
/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Get current user profile
 *     description: Retrieve the current authenticated user's profile information
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "507f1f77bcf86cd799439011"
 *                     name:
 *                       type: string
 *                       example: "John Doe"
 *                     email:
 *                       type: string
 *                       example: "john.doe@example.com"
 *                     role:
 *                       type: string
 *                       enum: [citizen, mlastaff, dept, dept_staff]
 *                       example: "citizen"
 *                     is_verified:
 *                       type: boolean
 *                       example: true
 *                     hasPassword:
 *                       type: boolean
 *                       example: true
 *       401:
 *         description: Unauthorized - invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "User not authenticated"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */
// 7. Get Current User
router.get("/me", auth_1.auth, auth_controller_1.AuthController.getCurrentUserProfile);
// 8. Update User Details
router.put("/user-details", auth_1.auth, validateUpdateUserDetails, auth_controller_1.AuthController.updateUserDetails);
/**
 * @swagger
 * /api/auth/user-details:
 *   put:
 *     tags:
 *       - Authentication
 *     summary: Update user details
 *     description: Update the current user's location details (constituency, panchayat, ward)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               constituency_id:
 *                 type: string
 *                 description: Constituency ID where user is located
 *                 example: "507f1f77bcf86cd799439011"
 *               panchayat_id:
 *                 type: string
 *                 description: Panchayat ID where user is located
 *                 example: "507f1f77bcf86cd799439012"
 *               ward_no:
 *                 type: string
 *                 description: Ward number where user is located
 *                 example: "W001"
 *     responses:
 *       200:
 *         description: User details updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User details updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user_id:
 *                       type: string
 *                       example: "507f1f77bcf86cd799439011"
 *                     constituency:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                           example: "Sample Constituency"
 *                         constituency_id:
 *                           type: string
 *                           example: "CONST001"
 *                     panchayat_id:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                           example: "Sample Panchayat"
 *                         panchayat_id:
 *                           type: string
 *                           example: "PANCH001"
 *                     ward_no:
 *                       type: string
 *                       example: "W001"
 *       400:
 *         description: Bad request - validation error or hierarchy validation failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Constituency not found"
 *       401:
 *         description: Unauthorized - invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "User not authenticated"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */
exports.default = router;
