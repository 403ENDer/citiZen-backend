import { Response } from "express";

// ============================================================================
// RESPONSE UTILITIES
// ============================================================================

/**
 * Create a success response
 * @param res - Express response object
 * @param statusCode - HTTP status code
 * @param data - Response data
 */
export const createSuccessResponse = (res: Response, statusCode: number, data: any) => {
  res.status(statusCode).json(data);
};

/**
 * Create an error response
 * @param res - Express response object
 * @param statusCode - HTTP status code
 * @param message - Error message
 */
export const createErrorResponse = (res: Response, statusCode: number, message: string) => {
  res.status(statusCode).json({ error: message });
};

/**
 * Create a validation error response
 * @param res - Express response object
 * @param message - Validation error message
 */
export const createValidationErrorResponse = (res: Response, message: string) => {
  createErrorResponse(res, 400, message);
};

/**
 * Create an authentication error response
 * @param res - Express response object
 * @param message - Authentication error message
 */
export const createAuthErrorResponse = (res: Response, message: string) => {
  createErrorResponse(res, 401, message);
};

/**
 * Create a not found error response
 * @param res - Express response object
 * @param message - Not found error message
 */
export const createNotFoundErrorResponse = (res: Response, message: string) => {
  createErrorResponse(res, 404, message);
};

/**
 * Create an internal server error response
 * @param res - Express response object
 * @param message - Internal server error message
 */
export const createInternalErrorResponse = (res: Response, message: string = "Internal server error") => {
  createErrorResponse(res, 500, message);
};

/**
 * Create a paginated response
 * @param res - Express response object
 * @param data - Array of data items
 * @param total - Total number of items
 * @param page - Current page number
 * @param limit - Items per page
 */
export const createPaginatedResponse = (
  res: Response,
  data: any[],
  total: number,
  page: number,
  limit: number
) => {
  const totalPages = Math.ceil(total / limit);
  createSuccessResponse(res, 200, {
    data,
    total,
    page,
    limit,
    totalPages,
  });
};

/**
 * Create a success response with message
 * @param res - Express response object
 * @param message - Success message
 * @param data - Optional response data
 */
export const createSuccessMessageResponse = (res: Response, message: string, data?: any) => {
  const response: any = { message };
  if (data) {
    response.data = data;
  }
  createSuccessResponse(res, 200, response);
};

/**
 * Create a created response (201)
 * @param res - Express response object
 * @param data - Response data
 */
export const createCreatedResponse = (res: Response, data: any) => {
  createSuccessResponse(res, 201, data);
};

/**
 * Create a no content response (204)
 * @param res - Express response object
 */
export const createNoContentResponse = (res: Response) => {
  res.status(204).send();
};
