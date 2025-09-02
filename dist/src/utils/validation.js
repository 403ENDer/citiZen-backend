"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateArrayLength = exports.validateDate = exports.validateNumericRange = exports.validateEnum = exports.validateObjectIdParam = exports.validateObjectId = exports.validateStringLength = exports.checkPhoneExists = exports.checkUserExists = exports.validatePhoneNumber = exports.validateEmail = exports.validatePassword = exports.validateRequiredFields = void 0;
const userModel_1 = require("../models/userModel");
// ============================================================================
// VALIDATION UTILITIES
// ============================================================================
/**
 * Validate required fields in a request body
 * @param fields - Object containing the fields to validate
 * @param requiredFields - Array of field names that are required
 * @returns Error message if validation fails, null if successful
 */
const validateRequiredFields = (fields, requiredFields) => {
    for (const field of requiredFields) {
        if (!fields[field]) {
            return `${field} is required`;
        }
    }
    return null;
};
exports.validateRequiredFields = validateRequiredFields;
/**
 * Validate password strength
 * @param password - Password to validate
 * @returns Error message if validation fails, null if successful
 */
const validatePassword = (password) => {
    if (password.length < 6) {
        return "Password must be at least 6 characters long";
    }
    return null;
};
exports.validatePassword = validatePassword;
/**
 * Validate email format
 * @param email - Email to validate
 * @returns Error message if validation fails, null if successful
 */
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return "Invalid email format";
    }
    return null;
};
exports.validateEmail = validateEmail;
/**
 * Validate phone number format
 * @param phone - Phone number to validate
 * @returns Error message if validation fails, null if successful
 */
const validatePhoneNumber = (phone) => {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,15}$/;
    if (!phoneRegex.test(phone)) {
        return "Invalid phone number format";
    }
    return null;
};
exports.validatePhoneNumber = validatePhoneNumber;
/**
 * Check if user exists by email
 * @param email - Email to check
 * @returns Promise<boolean> - True if user exists, false otherwise
 */
const checkUserExists = async (email) => {
    const existingUser = await userModel_1.userModel.findOne({ email });
    return !!existingUser;
};
exports.checkUserExists = checkUserExists;
/**
 * Check if phone number is already registered
 * @param phone_number - Phone number to check
 * @returns Promise<boolean> - True if phone exists, false otherwise
 */
const checkPhoneExists = async (phone_number) => {
    const existingPhone = await userModel_1.userModel.findOne({ phone_number });
    return !!existingPhone;
};
exports.checkPhoneExists = checkPhoneExists;
/**
 * Validate string length
 * @param value - String to validate
 * @param minLength - Minimum length
 * @param maxLength - Maximum length
 * @param fieldName - Name of the field for error message
 * @returns Error message if validation fails, null if successful
 */
const validateStringLength = (value, minLength, maxLength, fieldName) => {
    if (value.length < minLength) {
        return `${fieldName} must be at least ${minLength} characters long`;
    }
    if (value.length > maxLength) {
        return `${fieldName} must be at most ${maxLength} characters long`;
    }
    return null;
};
exports.validateStringLength = validateStringLength;
/**
 * Validate MongoDB ObjectId format
 * @param id - ID to validate
 * @returns Error message if validation fails, null if successful
 */
const validateObjectId = (id) => {
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    if (!objectIdRegex.test(id)) {
        return "Invalid ID format";
    }
    return null;
};
exports.validateObjectId = validateObjectId;
/**
 * Validate MongoDB ObjectId parameter from request
 * @param id - ID to validate
 * @param paramName - Name of the parameter for error message
 * @returns Error message if validation fails, null if successful
 */
const validateObjectIdParam = (id, paramName) => {
    if (!id) {
        return `${paramName} is required`;
    }
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    if (!objectIdRegex.test(id)) {
        return `Invalid ${paramName} format`;
    }
    return null;
};
exports.validateObjectIdParam = validateObjectIdParam;
/**
 * Validate enum values
 * @param value - Value to validate
 * @param allowedValues - Array of allowed values
 * @param fieldName - Name of the field for error message
 * @returns Error message if validation fails, null if successful
 */
const validateEnum = (value, allowedValues, fieldName) => {
    if (!allowedValues.includes(value)) {
        return `${fieldName} must be one of: ${allowedValues.join(', ')}`;
    }
    return null;
};
exports.validateEnum = validateEnum;
/**
 * Validate numeric range
 * @param value - Number to validate
 * @param min - Minimum value
 * @param max - Maximum value
 * @param fieldName - Name of the field for error message
 * @returns Error message if validation fails, null if successful
 */
const validateNumericRange = (value, min, max, fieldName) => {
    if (value < min || value > max) {
        return `${fieldName} must be between ${min} and ${max}`;
    }
    return null;
};
exports.validateNumericRange = validateNumericRange;
/**
 * Validate date format and range
 * @param dateString - Date string to validate
 * @param fieldName - Name of the field for error message
 * @returns Error message if validation fails, null if successful
 */
const validateDate = (dateString, fieldName) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        return `${fieldName} must be a valid date`;
    }
    return null;
};
exports.validateDate = validateDate;
/**
 * Validate array length
 * @param array - Array to validate
 * @param minLength - Minimum length
 * @param maxLength - Maximum length
 * @param fieldName - Name of the field for error message
 * @returns Error message if validation fails, null if successful
 */
const validateArrayLength = (array, minLength, maxLength, fieldName) => {
    if (array.length < minLength) {
        return `${fieldName} must have at least ${minLength} items`;
    }
    if (array.length > maxLength) {
        return `${fieldName} must have at most ${maxLength} items`;
    }
    return null;
};
exports.validateArrayLength = validateArrayLength;
