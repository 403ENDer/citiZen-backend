import { userModel } from "../models/userModel";

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Validate required fields in a request body
 * @param fields - Object containing the fields to validate
 * @param requiredFields - Array of field names that are required
 * @returns Error message if validation fails, null if successful
 */
export const validateRequiredFields = (
  fields: Record<string, any>, 
  requiredFields: string[]
): string | null => {
  for (const field of requiredFields) {
    if (!fields[field]) {
      return `${field} is required`;
    }
  }
  return null;
};

/**
 * Validate password strength
 * @param password - Password to validate
 * @returns Error message if validation fails, null if successful
 */
export const validatePassword = (password: string): string | null => {
  if (password.length < 6) {
    return "Password must be at least 6 characters long";
  }
  return null;
};

/**
 * Validate email format
 * @param email - Email to validate
 * @returns Error message if validation fails, null if successful
 */
export const validateEmail = (email: string): string | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Invalid email format";
  }
  return null;
};

/**
 * Validate phone number format
 * @param phone - Phone number to validate
 * @returns Error message if validation fails, null if successful
 */
export const validatePhoneNumber = (phone: string): string | null => {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,15}$/;
  if (!phoneRegex.test(phone)) {
    return "Invalid phone number format";
  }
  return null;
};

/**
 * Check if user exists by email
 * @param email - Email to check
 * @returns Promise<boolean> - True if user exists, false otherwise
 */
export const checkUserExists = async (email: string): Promise<boolean> => {
  const existingUser = await userModel.findOne({ email });
  return !!existingUser;
};

/**
 * Check if phone number is already registered
 * @param phone_number - Phone number to check
 * @returns Promise<boolean> - True if phone exists, false otherwise
 */
export const checkPhoneExists = async (phone_number: string): Promise<boolean> => {
  const existingPhone = await userModel.findOne({ phone_number });
  return !!existingPhone;
};

/**
 * Validate string length
 * @param value - String to validate
 * @param minLength - Minimum length
 * @param maxLength - Maximum length
 * @param fieldName - Name of the field for error message
 * @returns Error message if validation fails, null if successful
 */
export const validateStringLength = (
  value: string, 
  minLength: number, 
  maxLength: number, 
  fieldName: string
): string | null => {
  if (value.length < minLength) {
    return `${fieldName} must be at least ${minLength} characters long`;
  }
  if (value.length > maxLength) {
    return `${fieldName} must be at most ${maxLength} characters long`;
  }
  return null;
};

/**
 * Validate MongoDB ObjectId format
 * @param id - ID to validate
 * @returns Error message if validation fails, null if successful
 */
export const validateObjectId = (id: string): string | null => {
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  if (!objectIdRegex.test(id)) {
    return "Invalid ID format";
  }
  return null;
};

/**
 * Validate MongoDB ObjectId parameter from request
 * @param id - ID to validate
 * @param paramName - Name of the parameter for error message
 * @returns Error message if validation fails, null if successful
 */
export const validateObjectIdParam = (id: string, paramName: string): string | null => {
  if (!id) {
    return `${paramName} is required`;
  }
  
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  if (!objectIdRegex.test(id)) {
    return `Invalid ${paramName} format`;
  }
  
  return null;
};

/**
 * Validate enum values
 * @param value - Value to validate
 * @param allowedValues - Array of allowed values
 * @param fieldName - Name of the field for error message
 * @returns Error message if validation fails, null if successful
 */
export const validateEnum = (
  value: string, 
  allowedValues: string[], 
  fieldName: string
): string | null => {
  if (!allowedValues.includes(value)) {
    return `${fieldName} must be one of: ${allowedValues.join(', ')}`;
  }
  return null;
};

/**
 * Validate numeric range
 * @param value - Number to validate
 * @param min - Minimum value
 * @param max - Maximum value
 * @param fieldName - Name of the field for error message
 * @returns Error message if validation fails, null if successful
 */
export const validateNumericRange = (
  value: number, 
  min: number, 
  max: number, 
  fieldName: string
): string | null => {
  if (value < min || value > max) {
    return `${fieldName} must be between ${min} and ${max}`;
  }
  return null;
};

/**
 * Validate date format and range
 * @param dateString - Date string to validate
 * @param fieldName - Name of the field for error message
 * @returns Error message if validation fails, null if successful
 */
export const validateDate = (dateString: string, fieldName: string): string | null => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return `${fieldName} must be a valid date`;
  }
  return null;
};

/**
 * Validate array length
 * @param array - Array to validate
 * @param minLength - Minimum length
 * @param maxLength - Maximum length
 * @param fieldName - Name of the field for error message
 * @returns Error message if validation fails, null if successful
 */
export const validateArrayLength = (
  array: any[], 
  minLength: number, 
  maxLength: number, 
  fieldName: string
): string | null => {
  if (array.length < minLength) {
    return `${fieldName} must have at least ${minLength} items`;
  }
  if (array.length > maxLength) {
    return `${fieldName} must have at most ${maxLength} items`;
  }
  return null;
};
