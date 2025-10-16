import { Request, Response } from "express";
import { userModel } from "../models/userModel";
import UserDetails from "../models/userDetailsModel";
import Constituency from "../models/constituencyModel";
import Panchayat from "../models/panchayatModel";
import Department from "../models/departmentModel";
import DepartmentEmployee from "../models/departmentEmployeeModel";

import {
  generateToken,
  generateGoogleToken,
  hashPassword,
  comparePassword,
} from "../utils/auth";
import { getGoogleUserInfo } from "../utils/googleAuth";
import { AuthenticatedRequest } from "../middleware/auth";
import { JWTPayload, RoleTypes } from "../utils/types";
import {
  validateRequiredFields,
  validatePassword,
  checkUserExists,
  checkPhoneExists,
} from "../utils/validation";
import {
  createSuccessResponse,
  createErrorResponse,
  createValidationErrorResponse,
  createAuthErrorResponse,
  createNotFoundErrorResponse,
  createInternalErrorResponse,
  createCreatedResponse,
} from "../utils/response";

// ============================================================================
// INTERFACES & TYPES
// ============================================================================

interface User {
  id: string;
  name: string;
  email: string;
  phone_number: string;
  role: RoleTypes;
  is_verified: boolean;
  hasPassword: boolean;
  created_at?: string;
  updated_at?: string;
  constituency_id?: string;
  constituency_name?: string;
  panchayat_id?: string;
  panchayat_name?: string;
  ward_no?: string;
  ward_name?: string;
  department_id?: string;
  department_name?: string;
}

interface UserDetailsResponse {
  user_id: string;
  constituency: {
    name: string;
    constituency_id: string;
  };
  panchayat_id: {
    name: string;
    panchayat_id: string;
  };
  ward_no: string;
}

interface HierarchyValidationResult {
  isValid: boolean;
  error?: string;
}

interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Format user data for API response
 */
const formatUserData = async (user: any, userDetails?: any): Promise<User> => {
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
    constituency_id:
      userDetails?.constituency?._id || userDetails?.constituency || "",
    constituency_name: userDetails?.constituency?.name || "",
    panchayat_id:
      userDetails?.panchayat_id?._id || userDetails?.panchayat_id || "",
    panchayat_name: userDetails?.panchayat_id?.name || "",
    ward_no: userDetails?.ward_no || "",
    ward_name: userDetails?.ward_name || "",
    department_id:
      userDetails?.department?._id || userDetails?.department || "",
    department_name: userDetails?.department?.name || "",
  };
};

/**
 * Format user details for API response
 */
const formatUserDetails = (userDetails: any): UserDetailsResponse => {
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
const validateHierarchy = async (
  constituency_id: string,
  panchayat_id: string,
  ward_no: string
): Promise<HierarchyValidationResult> => {
  try {
    // Check if constituency exists
    const constituency = await Constituency.findById(constituency_id);
    if (!constituency) {
      return { isValid: false, error: "Constituency not found" };
    }

    // Check if panchayat exists and belongs to the constituency
    const panchayat = await Panchayat.findById(panchayat_id);
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
    const wardExists = panchayat.ward_list.some(
      (ward: any) => ward.ward_id === ward_no
    );
    if (!wardExists) {
      return {
        isValid: false,
        error: "Ward not found in the specified panchayat",
      };
    }

    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: "Error validating hierarchy" };
  }
};

/**
 * Fetch and populate user details
 */
const fetchUserDetails = async (userId: string) => {
  // First get the user to check their role
  const user = await userModel.findById(userId);
  if (!user) return null;

  let userDetails = await UserDetails.findOne({ user_id: userId }).populate([
    { path: "constituency", select: "name constituency_id" },
    { path: "panchayat_id", select: "name panchayat_id" },
  ]);

  if (!userDetails) return null;

  // Add department information based on user role
  if (user.role === RoleTypes.DEPT) {
    const department = await Department.findOne({ head_id: userId });
    if (department) {
      userDetails = userDetails.toObject();
      userDetails.department = department;
    }
  } else if (user.role === RoleTypes.DEPT_STAFF) {
    // For dept_staff role, find department through DepartmentEmployee

    const deptEmployee = await DepartmentEmployee.findOne({ user_id: userId });
    if (deptEmployee) {
      const department = await Department.findById(deptEmployee.dept_id);
      if (department) {
        userDetails = userDetails.toObject();
        userDetails.department = department;
      }
    }
  }
  return userDetails;
};

/**
 * Generate JWT token for user
 */
const generateUserToken = (user: any): string => {
  const payload: JWTPayload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  };

  return user.google_access_token
    ? generateGoogleToken(payload, user.google_access_token)
    : generateToken(payload);
};

// ============================================================================
// AUTH CONTROLLER CLASS
// ============================================================================

export class AuthController {
  /**
   * Sign up with email and password
   */
  static async signupWithEmail(req: Request, res: Response): Promise<void> {
    try {
      const {
        email,
        password,
        name,
        phone_number,
        constituency_id,
        panchayat_id,
        ward_no,
      } = req.body;

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
      const missingField = validateRequiredFields(req.body, requiredFields);

      if (missingField) {
        return createValidationErrorResponse(res, missingField);
      }

      // Validate password
      const passwordError = validatePassword(password);
      if (passwordError) {
        return createValidationErrorResponse(res, passwordError);
      }

      // Check if user already exists
      if (await checkUserExists(email)) {
        return createValidationErrorResponse(
          res,
          "User with this email already exists"
        );
      }

      // Check if phone number is already taken (skip in test environment)
      if (process.env.NODE_ENV !== "test") {
        if (await checkPhoneExists(phone_number)) {
          return createValidationErrorResponse(
            res,
            "Phone number already registered"
          );
        }
      }
      // Validate hierarchy (skip in test environment)
      if (process.env.NODE_ENV !== "test") {
        const hierarchyValidation = await validateHierarchy(
          constituency_id,
          panchayat_id,
          ward_no
        );
        if (!hierarchyValidation.isValid) {
          return createValidationErrorResponse(res, hierarchyValidation.error!);
        }
      }

      // Create new user
      const hashedPassword = await hashPassword(password);
      const newUser = new userModel({
        name,
        email,
        password_hash: hashedPassword,
        phone_number,
      });
      await newUser.save();

      // Create user details
      const userDetails = new UserDetails({
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
      const response: AuthResponse = {
        message: "User created successfully",
        token,
        user: await formatUserData(newUser, userDetails),
      };

      createCreatedResponse(res, response);
    } catch (error) {
      console.error("Email signup error:", error);
      createInternalErrorResponse(res);
    }
  }

  /**
   * Login with Google OAuth
   */
  static async loginWithGoogle(req: Request, res: Response): Promise<void> {
    try {
      const { accessToken, email } = req.body;

      // Validate required fields
      const missingField = validateRequiredFields(req.body, [
        "accessToken",
        "email",
      ]);
      if (missingField) {
        return createValidationErrorResponse(res, missingField);
      }

      // Verify Google access token
      const googleUserInfo = await getGoogleUserInfo(accessToken);
      if (!googleUserInfo || googleUserInfo.email !== email) {
        return createValidationErrorResponse(
          res,
          "Invalid Google access token or email mismatch"
        );
      }

      // Find user
      const user = await userModel.findOne({ email });
      if (!user) {
        return createNotFoundErrorResponse(
          res,
          "User not found. Please sign up first."
        );
      }

      // Update Google access token
      user.google_access_token = accessToken;
      await user.save();

      // Fetch user details
      const userDetails = await fetchUserDetails(user._id);

      // Generate token and create response
      const token = generateUserToken(user);
      const response: AuthResponse = {
        message: "Login successful",
        token,
        user: await formatUserData(user, userDetails),
      };

      createSuccessResponse(res, 200, response);
    } catch (error) {
      console.error("Google login error:", error);
      createInternalErrorResponse(res);
    }
  }

  /**
   * Login with email and password
   */
  static async loginWithEmail(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // Validate required fields
      const missingField = validateRequiredFields(req.body, [
        "email",
        "password",
      ]);
      if (missingField) {
        return createValidationErrorResponse(res, missingField);
      }

      // Find user
      const user = await userModel.findOne({ email });
      if (!user) {
        return createNotFoundErrorResponse(res, "User not found");
      }

      // Check if user has password set
      if (!user.password_hash) {
        return createValidationErrorResponse(
          res,
          "No password set for this account. Please login with Google first and set a password."
        );
      }

      // Verify password
      const isValidPassword = await comparePassword(
        password,
        user.password_hash
      );
      if (!isValidPassword) {
        return createAuthErrorResponse(res, "Invalid password");
      }

      // Fetch user details
      const userDetails = await fetchUserDetails(user._id);

      // Generate token and create response
      const token = generateUserToken(user);
      const response: AuthResponse = {
        message: "Login successful",
        token,
        user: await formatUserData(user, userDetails),
      };
      createSuccessResponse(res, 200, response);
    } catch (error) {
      console.error("Email login error:", error);
      createInternalErrorResponse(res);
    }
  }

  /**
   * Change user password
   */
  static async changePassword(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user?.userId;

      // Validate authentication
      if (!userId) {
        return createAuthErrorResponse(res, "User not authenticated");
      }

      // Validate required fields
      const missingField = validateRequiredFields(req.body, [
        "currentPassword",
        "newPassword",
      ]);
      if (missingField) {
        return createValidationErrorResponse(res, missingField);
      }

      // Validate new password
      const passwordError = validatePassword(newPassword);
      if (passwordError) {
        return createValidationErrorResponse(res, passwordError);
      }

      // Find user
      const user = await userModel.findById(userId);
      if (!user) {
        return createNotFoundErrorResponse(res, "User not found");
      }

      // Check if user has password set
      if (!user.password_hash) {
        return createValidationErrorResponse(
          res,
          "No password set for this account. Please set a password first."
        );
      }

      // Verify current password
      const isValidPassword = await comparePassword(
        currentPassword,
        user.password_hash
      );
      if (!isValidPassword) {
        return createAuthErrorResponse(res, "Current password is incorrect");
      }

      // Update password
      const hashedNewPassword = await hashPassword(newPassword);
      user.password_hash = hashedNewPassword;
      await user.save();

      createSuccessResponse(res, 200, {
        message: "Password changed successfully",
      });
    } catch (error) {
      console.error("Change password error:", error);
      createInternalErrorResponse(res);
    }
  }

  /**
   * Get current user profile
   */
  static async getCurrentUserProfile(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user?.userId;

      // Validate authentication
      if (!userId) {
        return createAuthErrorResponse(res, "User not authenticated");
      }

      // Fetch user
      const user = await userModel.findById(userId).select("-password_hash");
      if (!user) {
        return createNotFoundErrorResponse(res, "User not found");
      }

      // Fetch user details
      const userDetails = await fetchUserDetails(userId);

      createSuccessResponse(res, 200, {
        user: await formatUserData(user, userDetails),
      });
    } catch (error) {
      console.error("Get user profile error:", error);
      createInternalErrorResponse(res);
    }
  }

  /**
   * Update user details
   */
  static async updateUserDetails(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { constituency_id, panchayat_id, ward_no } = req.body;

      // Validate authentication
      if (!userId) {
        return createAuthErrorResponse(res, "User not authenticated");
      }

      // Check if user exists
      const user = await userModel.findById(userId);
      if (!user) {
        return createNotFoundErrorResponse(res, "User not found");
      }

      // Validate hierarchy if location fields are provided
      if (constituency_id || panchayat_id || ward_no) {
        const hierarchyValidation = await validateHierarchy(
          constituency_id,
          panchayat_id,
          ward_no
        );
        if (!hierarchyValidation.isValid) {
          return createValidationErrorResponse(res, hierarchyValidation.error!);
        }
      }

      // Find or create user details
      let userDetails = await UserDetails.findOne({ user_id: userId });

      if (!userDetails) {
        userDetails = new UserDetails({
          user_id: userId,
          constituency: constituency_id,
          panchayat_id,
          ward_no,
        });
      } else {
        // Update existing user details
        if (constituency_id) userDetails.constituency = constituency_id;
        if (panchayat_id) userDetails.panchayat_id = panchayat_id;
        if (ward_no) userDetails.ward_no = ward_no;
      }

      await userDetails.save();

      // Populate references for response
      await userDetails.populate([
        { path: "constituency", select: "name constituency_id" },
        { path: "panchayat_id", select: "name panchayat_id" },
      ]);

      createSuccessResponse(res, 200, {
        message: "User details updated successfully",
        data: formatUserDetails(userDetails),
      });
    } catch (error) {
      console.error("Update user details error:", error);
      createInternalErrorResponse(res);
    }
  }
}
