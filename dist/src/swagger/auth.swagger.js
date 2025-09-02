"use strict";
/**
 * @swagger
 * components:
 *   schemas:
 *     GoogleSignupRequest:
 *       type: object
 *       required:
 *         - accessToken
 *         - email
 *         - name
 *         - phone_number
 *         - constituency_id
 *         - panchayat_id
 *         - ward_no
 *       properties:
 *         accessToken:
 *           type: string
 *           description: Google OAuth access token
 *           example: "ya29.a0AfH6SMC..."
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *           example: "john.doe@example.com"
 *         name:
 *           type: string
 *           description: User's full name
 *           minLength: 2
 *           maxLength: 100
 *           example: "John Doe"
 *         phone_number:
 *           type: string
 *           description: User's phone number
 *           minLength: 10
 *           maxLength: 15
 *           example: "+1234567890"
 *         constituency_id:
 *           type: string
 *           description: Constituency ID where user is located
 *           example: "507f1f77bcf86cd799439011"
 *         panchayat_id:
 *           type: string
 *           description: Panchayat ID where user is located
 *           example: "507f1f77bcf86cd799439012"
 *         ward_no:
 *           type: string
 *           description: Ward number where user is located
 *           minLength: 1
 *           maxLength: 50
 *           example: "W001"
 *
 *     EmailSignupRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - name
 *         - phone_number
 *         - constituency_id
 *         - panchayat_id
 *         - ward_no
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *           example: "john.doe@example.com"
 *         password:
 *           type: string
 *           description: User's password
 *           minLength: 6
 *           example: "password123"
 *         name:
 *           type: string
 *           description: User's full name
 *           minLength: 2
 *           maxLength: 100
 *           example: "John Doe"
 *         phone_number:
 *           type: string
 *           description: User's phone number
 *           minLength: 10
 *           maxLength: 15
 *           example: "+1234567890"
 *         constituency_id:
 *           type: string
 *           description: Constituency ID where user is located
 *           example: "507f1f77bcf86cd799439011"
 *         panchayat_id:
 *           type: string
 *           description: Panchayat ID where user is located
 *           example: "507f1f77bcf86cd799439012"
 *         ward_no:
 *           type: string
 *           description: Ward number where user is located
 *           minLength: 1
 *           maxLength: 50
 *           example: "W001"
 *
 *     GoogleLoginRequest:
 *       type: object
 *       required:
 *         - accessToken
 *         - email
 *       properties:
 *         accessToken:
 *           type: string
 *           description: Google OAuth access token
 *           example: "ya29.a0AfH6SMC..."
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *           example: "john.doe@example.com"
 *
 *     EmailLoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *           example: "john.doe@example.com"
 *         password:
 *           type: string
 *           description: User's password
 *           example: "password123"
 *
 *     ChangePasswordRequest:
 *       type: object
 *       required:
 *         - currentPassword
 *         - newPassword
 *       properties:
 *         currentPassword:
 *           type: string
 *           description: Current password
 *           example: "oldpassword123"
 *         newPassword:
 *           type: string
 *           description: New password
 *           minLength: 6
 *           example: "newpassword123"
 *
 *     UpdateUserDetailsRequest:
 *       type: object
 *       properties:
 *         constituency_id:
 *           type: string
 *           description: Constituency ID where user is located
 *           example: "507f1f77bcf86cd799439011"
 *         panchayat_id:
 *           type: string
 *           description: Panchayat ID where user is located
 *           example: "507f1f77bcf86cd799439012"
 *         ward_no:
 *           type: string
 *           description: Ward number where user is located
 *           minLength: 1
 *           maxLength: 50
 *           example: "W001"
 *
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: User's unique identifier
 *           example: "507f1f77bcf86cd799439011"
 *         name:
 *           type: string
 *           description: User's full name
 *           example: "John Doe"
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *           example: "john.doe@example.com"
 *         phone_number:
 *           type: string
 *           description: User's phone number
 *           example: "+1234567890"
 *         role:
 *           type: string
 *           enum: [citizen, mlastaff, dept, dept_staff, admin]
 *           description: User's role in the system
 *           example: "citizen"
 *         is_verified:
 *           type: boolean
 *           description: Whether the user's email is verified
 *           example: true
 *         hasPassword:
 *           type: boolean
 *           description: Whether the user has set a password
 *           example: true
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: User creation timestamp
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: User last update timestamp
 *         constituency_id:
 *           type: string
 *           description: User's constituency ID
 *           example: "CONST001"
 *         constituency_name:
 *           type: string
 *           description: User's constituency name
 *           example: "Sample Constituency"
 *         panchayat_id:
 *           type: string
 *           description: User's panchayat ID
 *           example: "PANCH001"
 *         panchayat_name:
 *           type: string
 *           description: User's panchayat name
 *           example: "Sample Panchayat"
 *         ward_id:
 *           type: string
 *           description: User's ward ID
 *           example: "W001"
 *         ward_name:
 *           type: string
 *           description: User's ward name
 *           example: "W001"
 *
 *     UserDetails:
 *       type: object
 *       properties:
 *         user_id:
 *           type: string
 *           description: User's unique identifier
 *           example: "507f1f77bcf86cd799439011"
 *         constituency:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *               description: Constituency name
 *               example: "Sample Constituency"
 *             constituency_id:
 *               type: string
 *               description: Constituency ID
 *               example: "CONST001"
 *         panchayat_id:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *               description: Panchayat name
 *               example: "Sample Panchayat"
 *             panchayat_id:
 *               type: string
 *               description: Panchayat ID
 *               example: "PANCH001"
 *         ward_no:
 *           type: string
 *           description: Ward number
 *           example: "W001"
 *
 *     AuthResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           description: Success message
 *           example: "Login successful"
 *         token:
 *           type: string
 *           description: JWT authentication token
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         user:
 *           $ref: '#/components/schemas/User'
 *
 *     UserDetailsResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Success message
 *           example: "User details updated successfully"
 *         data:
 *           $ref: '#/components/schemas/UserDetails'
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           description: Error message
 *           example: "Validation error"
 *         error:
 *           type: string
 *           description: Detailed error message
 *           example: "\"email\" is required"
 *
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication and authorization endpoints
 */
/**
 * @swagger
 * /api/auth/signup/email:
 *   post:
 *     summary: Sign up with email and password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmailSignupRequest'
 *           example:
 *             email: "john.doe@example.com"
 *             password: "password123"
 *             name: "John Doe"
 *             phone_number: "+1234567890"
 *             constituency_id: "507f1f77bcf86cd799439011"
 *             panchayat_id: "507f1f77bcf86cd799439012"
 *             ward_no: "W001"
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
/**
 * @swagger
 * /api/auth/login/google:
 *   post:
 *     summary: Login with Google OAuth
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GoogleLoginRequest'
 *           example:
 *             accessToken: "ya29.a0AfH6SMC..."
 *             email: "john.doe@example.com"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
/**
 * @swagger
 * /api/auth/login/email:
 *   post:
 *     summary: Login with email and password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmailLoginRequest'
 *           example:
 *             email: "john.doe@example.com"
 *             password: "password123"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     summary: Change user password
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePasswordRequest'
 *           example:
 *             currentPassword: "oldpassword123"
 *             newPassword: "newpassword123"
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Password changed successfully"
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - invalid credentials or token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized - invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
/**
 * @swagger
 * /api/auth/user-details:
 *   put:
 *     summary: Update user details
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserDetailsRequest'
 *           example:
 *             constituency_id: "507f1f77bcf86cd799439011"
 *             panchayat_id: "507f1f77bcf86cd799439012"
 *             ward_no: "W001"
 *     responses:
 *       200:
 *         description: User details updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserDetailsResponse'
 *       400:
 *         description: Validation error or hierarchy validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
