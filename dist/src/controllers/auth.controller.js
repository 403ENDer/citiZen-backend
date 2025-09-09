"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const userModel_1 = require("../models/userModel");
const userDetailsModel_1 = __importDefault(require("../models/userDetailsModel"));
const constituencyModel_1 = __importDefault(require("../models/constituencyModel"));
const panchayatModel_1 = __importDefault(require("../models/panchayatModel"));
const auth_1 = require("../utils/auth");
const googleAuth_1 = require("../utils/googleAuth");
const validation_1 = require("../utils/validation");
const response_1 = require("../utils/response");
// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
/**
 * Format user data for API response
 */
const formatUserData = async (user, userDetails) => {
    return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone_number: user.phone_number,
        role: user.role,
        is_verified: user.is_verified,
        hasPassword: !!user.password_hash,
        created_at: user.createdAt?.toISOString(),
        updated_at: user.updatedAt?.toISOString(),
        constituency_id: userDetails?.constituency?._id || userDetails?.constituency || "",
        constituency_name: userDetails?.constituency?.name || "",
        panchayat_id: userDetails?.panchayat_id?._id || userDetails?.panchayat_id || "",
        panchayat_name: userDetails?.panchayat_id?.name || "",
        ward_id: userDetails?._id || "",
        ward_name: userDetails?.ward_no || "",
    };
};
/**
 * Format user details for API response
 */
const formatUserDetails = (userDetails) => {
    return {
        user_id: userDetails.user_id.toString(),
        constituency: {
            name: userDetails.constituency?.name || "",
            constituency_id: userDetails.constituency?.constituency_id || "",
        },
        panchayat_id: {
            name: userDetails.panchayat_id?.name || "",
            panchayat_id: userDetails.panchayat_id?.panchayat_id || "",
        },
        ward_no: userDetails.ward_no || "",
    };
};
/**
 * Validate constituency, panchayat, and ward hierarchy
 */
const validateHierarchy = async (constituency_id, panchayat_id, ward_no) => {
    try {
        // Check if constituency exists
        const constituency = await constituencyModel_1.default.findById(constituency_id);
        if (!constituency) {
            return { isValid: false, error: "Constituency not found" };
        }
        // Check if panchayat exists and belongs to the constituency
        const panchayat = await panchayatModel_1.default.findById(panchayat_id);
        if (!panchayat) {
            return { isValid: false, error: "Panchayat not found" };
        }
        // Check if panchayat belongs to the constituency
        if (panchayat.constituency_id.toString() !== constituency._id.toString()) {
            return {
                isValid: false,
                error: "Panchayat does not belong to the specified constituency",
            };
        }
        // Check if ward exists in the panchayat
        const wardExists = panchayat.ward_list.some((ward) => ward.ward_id === ward_no);
        if (!wardExists) {
            return {
                isValid: false,
                error: "Ward not found in the specified panchayat",
            };
        }
        return { isValid: true };
    }
    catch (error) {
        return { isValid: false, error: "Error validating hierarchy" };
    }
};
/**
 * Fetch and populate user details
 */
const fetchUserDetails = async (userId) => {
    return await userDetailsModel_1.default.findOne({ user_id: userId }).populate([
        { path: "constituency", select: "name constituency_id" },
        { path: "panchayat_id", select: "name panchayat_id" },
    ]);
};
/**
 * Generate JWT token for user
 */
const generateUserToken = (user) => {
    const payload = {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
    };
    return user.google_access_token
        ? (0, auth_1.generateGoogleToken)(payload, user.google_access_token)
        : (0, auth_1.generateToken)(payload);
};
// ============================================================================
// AUTH CONTROLLER CLASS
// ============================================================================
class AuthController {
    /**
     * Sign up with email and password
     */
    static async signupWithEmail(req, res) {
        try {
            const { email, password, name, phone_number, constituency_id, panchayat_id, ward_no, } = req.body;
            // Validate required fields
            const requiredFields = [
                "email",
                "password",
                "name",
                "phone_number",
                "constituency_id",
                "panchayat_id",
                "ward_no",
            ];
            const missingField = (0, validation_1.validateRequiredFields)(req.body, requiredFields);
            if (missingField) {
                return (0, response_1.createValidationErrorResponse)(res, missingField);
            }
            // Validate password
            const passwordError = (0, validation_1.validatePassword)(password);
            if (passwordError) {
                return (0, response_1.createValidationErrorResponse)(res, passwordError);
            }
            // Check if user already exists
            if (await (0, validation_1.checkUserExists)(email)) {
                return (0, response_1.createValidationErrorResponse)(res, "User with this email already exists");
            }
            // Check if phone number is already taken
            if (await (0, validation_1.checkPhoneExists)(phone_number)) {
                return (0, response_1.createValidationErrorResponse)(res, "Phone number already registered");
            }
            // Validate hierarchy
            const hierarchyValidation = await validateHierarchy(constituency_id, panchayat_id, ward_no);
            if (!hierarchyValidation.isValid) {
                return (0, response_1.createValidationErrorResponse)(res, hierarchyValidation.error);
            }
            // Create new user
            const hashedPassword = await (0, auth_1.hashPassword)(password);
            const newUser = new userModel_1.userModel({
                name,
                email,
                password_hash: hashedPassword,
                phone_number,
            });
            await newUser.save();
            // Create user details
            const userDetails = new userDetailsModel_1.default({
                user_id: newUser._id,
                constituency: constituency_id,
                panchayat_id,
                ward_no,
            });
            await userDetails.save();
            // Populate user details for response
            await userDetails.populate([
                { path: "constituency", select: "name constituency_id" },
                { path: "panchayat_id", select: "name panchayat_id" },
            ]);
            // Generate token and create response
            const token = generateUserToken(newUser);
            const response = {
                message: "User created successfully",
                token,
                user: await formatUserData(newUser, userDetails),
            };
            (0, response_1.createCreatedResponse)(res, response);
        }
        catch (error) {
            console.error("Email signup error:", error);
            (0, response_1.createInternalErrorResponse)(res);
        }
    }
    /**
     * Login with Google OAuth
     */
    static async loginWithGoogle(req, res) {
        try {
            const { accessToken, email } = req.body;
            // Validate required fields
            const missingField = (0, validation_1.validateRequiredFields)(req.body, [
                "accessToken",
                "email",
            ]);
            if (missingField) {
                return (0, response_1.createValidationErrorResponse)(res, missingField);
            }
            // Verify Google access token
            const googleUserInfo = await (0, googleAuth_1.getGoogleUserInfo)(accessToken);
            if (!googleUserInfo || googleUserInfo.email !== email) {
                return (0, response_1.createValidationErrorResponse)(res, "Invalid Google access token or email mismatch");
            }
            // Find user
            const user = await userModel_1.userModel.findOne({ email });
            if (!user) {
                return (0, response_1.createNotFoundErrorResponse)(res, "User not found. Please sign up first.");
            }
            // Update Google access token
            user.google_access_token = accessToken;
            await user.save();
            // Fetch user details
            const userDetails = await fetchUserDetails(user._id);
            // Generate token and create response
            const token = generateUserToken(user);
            const response = {
                message: "Login successful",
                token,
                user: await formatUserData(user, userDetails),
            };
            (0, response_1.createSuccessResponse)(res, 200, response);
        }
        catch (error) {
            console.error("Google login error:", error);
            (0, response_1.createInternalErrorResponse)(res);
        }
    }
    /**
     * Login with email and password
     */
    static async loginWithEmail(req, res) {
        try {
            const { email, password } = req.body;
            // Validate required fields
            const missingField = (0, validation_1.validateRequiredFields)(req.body, [
                "email",
                "password",
            ]);
            if (missingField) {
                return (0, response_1.createValidationErrorResponse)(res, missingField);
            }
            // Find user
            const user = await userModel_1.userModel.findOne({ email });
            if (!user) {
                return (0, response_1.createNotFoundErrorResponse)(res, "User not found");
            }
            // Check if user has password set
            if (!user.password_hash) {
                return (0, response_1.createValidationErrorResponse)(res, "No password set for this account. Please login with Google first and set a password.");
            }
            // Verify password
            const isValidPassword = await (0, auth_1.comparePassword)(password, user.password_hash);
            if (!isValidPassword) {
                return (0, response_1.createAuthErrorResponse)(res, "Invalid password");
            }
            // Fetch user details
            const userDetails = await fetchUserDetails(user._id);
            // Generate token and create response
            const token = generateUserToken(user);
            const response = {
                message: "Login successful",
                token,
                user: await formatUserData(user, userDetails),
            };
            (0, response_1.createSuccessResponse)(res, 200, response);
        }
        catch (error) {
            console.error("Email login error:", error);
            (0, response_1.createInternalErrorResponse)(res);
        }
    }
    /**
     * Change user password
     */
    static async changePassword(req, res) {
        try {
            const { currentPassword, newPassword } = req.body;
            const userId = req.user?.userId;
            // Validate authentication
            if (!userId) {
                return (0, response_1.createAuthErrorResponse)(res, "User not authenticated");
            }
            // Validate required fields
            const missingField = (0, validation_1.validateRequiredFields)(req.body, [
                "currentPassword",
                "newPassword",
            ]);
            if (missingField) {
                return (0, response_1.createValidationErrorResponse)(res, missingField);
            }
            // Validate new password
            const passwordError = (0, validation_1.validatePassword)(newPassword);
            if (passwordError) {
                return (0, response_1.createValidationErrorResponse)(res, passwordError);
            }
            // Find user
            const user = await userModel_1.userModel.findById(userId);
            if (!user) {
                return (0, response_1.createNotFoundErrorResponse)(res, "User not found");
            }
            // Check if user has password set
            if (!user.password_hash) {
                return (0, response_1.createValidationErrorResponse)(res, "No password set for this account. Please set a password first.");
            }
            // Verify current password
            const isValidPassword = await (0, auth_1.comparePassword)(currentPassword, user.password_hash);
            if (!isValidPassword) {
                return (0, response_1.createAuthErrorResponse)(res, "Current password is incorrect");
            }
            // Update password
            const hashedNewPassword = await (0, auth_1.hashPassword)(newPassword);
            user.password_hash = hashedNewPassword;
            await user.save();
            (0, response_1.createSuccessResponse)(res, 200, {
                message: "Password changed successfully",
            });
        }
        catch (error) {
            console.error("Change password error:", error);
            (0, response_1.createInternalErrorResponse)(res);
        }
    }
    /**
     * Get current user profile
     */
    static async getCurrentUserProfile(req, res) {
        try {
            const userId = req.user?.userId;
            // Validate authentication
            if (!userId) {
                return (0, response_1.createAuthErrorResponse)(res, "User not authenticated");
            }
            // Fetch user
            const user = await userModel_1.userModel.findById(userId).select("-password_hash");
            if (!user) {
                return (0, response_1.createNotFoundErrorResponse)(res, "User not found");
            }
            // Fetch user details
            const userDetails = await fetchUserDetails(userId);
            (0, response_1.createSuccessResponse)(res, 200, {
                user: await formatUserData(user, userDetails),
            });
        }
        catch (error) {
            console.error("Get user profile error:", error);
            (0, response_1.createInternalErrorResponse)(res);
        }
    }
    /**
     * Update user details
     */
    static async updateUserDetails(req, res) {
        try {
            const userId = req.user?.userId;
            const { constituency_id, panchayat_id, ward_no } = req.body;
            // Validate authentication
            if (!userId) {
                return (0, response_1.createAuthErrorResponse)(res, "User not authenticated");
            }
            // Check if user exists
            const user = await userModel_1.userModel.findById(userId);
            if (!user) {
                return (0, response_1.createNotFoundErrorResponse)(res, "User not found");
            }
            // Validate hierarchy if location fields are provided
            if (constituency_id || panchayat_id || ward_no) {
                const hierarchyValidation = await validateHierarchy(constituency_id, panchayat_id, ward_no);
                if (!hierarchyValidation.isValid) {
                    return (0, response_1.createValidationErrorResponse)(res, hierarchyValidation.error);
                }
            }
            // Find or create user details
            let userDetails = await userDetailsModel_1.default.findOne({ user_id: userId });
            if (!userDetails) {
                userDetails = new userDetailsModel_1.default({
                    user_id: userId,
                    constituency: constituency_id,
                    panchayat_id,
                    ward_no,
                });
            }
            else {
                // Update existing user details
                if (constituency_id)
                    userDetails.constituency = constituency_id;
                if (panchayat_id)
                    userDetails.panchayat_id = panchayat_id;
                if (ward_no)
                    userDetails.ward_no = ward_no;
            }
            await userDetails.save();
            // Populate references for response
            await userDetails.populate([
                { path: "constituency", select: "name constituency_id" },
                { path: "panchayat_id", select: "name panchayat_id" },
            ]);
            (0, response_1.createSuccessResponse)(res, 200, {
                message: "User details updated successfully",
                data: formatUserDetails(userDetails),
            });
        }
        catch (error) {
            console.error("Update user details error:", error);
            (0, response_1.createInternalErrorResponse)(res);
        }
    }
}
exports.AuthController = AuthController;
