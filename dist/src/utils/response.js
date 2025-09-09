"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNoContentResponse = exports.createCreatedResponse = exports.createSuccessMessageResponse = exports.createPaginatedResponse = exports.createInternalErrorResponse = exports.createNotFoundErrorResponse = exports.createAuthErrorResponse = exports.createValidationErrorResponse = exports.createErrorResponse = exports.createSuccessResponse = void 0;
// ============================================================================
// RESPONSE UTILITIES
// ============================================================================
/**
 * Create a success response
 * @param res - Express response object
 * @param statusCode - HTTP status code
 * @param data - Response data
 */
const createSuccessResponse = (res, statusCode, data) => {
    res.status(statusCode).json(data);
};
exports.createSuccessResponse = createSuccessResponse;
/**
 * Create an error response
 * @param res - Express response object
 * @param statusCode - HTTP status code
 * @param message - Error message
 */
const createErrorResponse = (res, statusCode, message) => {
    res.status(statusCode).json({ error: message });
};
exports.createErrorResponse = createErrorResponse;
/**
 * Create a validation error response
 * @param res - Express response object
 * @param message - Validation error message
 */
const createValidationErrorResponse = (res, message) => {
    (0, exports.createErrorResponse)(res, 400, message);
};
exports.createValidationErrorResponse = createValidationErrorResponse;
/**
 * Create an authentication error response
 * @param res - Express response object
 * @param message - Authentication error message
 */
const createAuthErrorResponse = (res, message) => {
    (0, exports.createErrorResponse)(res, 401, message);
};
exports.createAuthErrorResponse = createAuthErrorResponse;
/**
 * Create a not found error response
 * @param res - Express response object
 * @param message - Not found error message
 */
const createNotFoundErrorResponse = (res, message) => {
    (0, exports.createErrorResponse)(res, 404, message);
};
exports.createNotFoundErrorResponse = createNotFoundErrorResponse;
/**
 * Create an internal server error response
 * @param res - Express response object
 * @param message - Internal server error message
 */
const createInternalErrorResponse = (res, message = "Internal server error") => {
    (0, exports.createErrorResponse)(res, 500, message);
};
exports.createInternalErrorResponse = createInternalErrorResponse;
/**
 * Create a paginated response
 * @param res - Express response object
 * @param data - Array of data items
 * @param total - Total number of items
 * @param page - Current page number
 * @param limit - Items per page
 */
const createPaginatedResponse = (res, data, total, page, limit) => {
    const totalPages = Math.ceil(total / limit);
    (0, exports.createSuccessResponse)(res, 200, {
        data,
        total,
        page,
        limit,
        totalPages,
    });
};
exports.createPaginatedResponse = createPaginatedResponse;
/**
 * Create a success response with message
 * @param res - Express response object
 * @param message - Success message
 * @param data - Optional response data
 */
const createSuccessMessageResponse = (res, message, data) => {
    const response = { message };
    if (data) {
        response.data = data;
    }
    (0, exports.createSuccessResponse)(res, 200, response);
};
exports.createSuccessMessageResponse = createSuccessMessageResponse;
/**
 * Create a created response (201)
 * @param res - Express response object
 * @param data - Response data
 */
const createCreatedResponse = (res, data) => {
    (0, exports.createSuccessResponse)(res, 201, data);
};
exports.createCreatedResponse = createCreatedResponse;
/**
 * Create a no content response (204)
 * @param res - Express response object
 */
const createNoContentResponse = (res) => {
    res.status(204).send();
};
exports.createNoContentResponse = createNoContentResponse;
