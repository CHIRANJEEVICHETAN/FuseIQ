import { Response } from 'express';
import { ApiResponse, ApiError } from '../types/api.types';

export function success<T>(res: Response, data: T, message?: string, statusCode: number = 200): Response {
  const response: ApiResponse<T> = {
    success: true,
    data,
    ...(message && { message }),
    timestamp: new Date().toISOString()
  };
  return res.status(statusCode).json(response);
}

export function error(res: Response, error: ApiError, statusCode: number = 400): Response {
  const response: ApiResponse = {
    success: false,
    error,
    timestamp: new Date().toISOString()
  };
  return res.status(statusCode).json(response);
}

export function validationError(res: Response, details: Record<string, unknown>): Response {
  return error(res, {
    code: 'VALIDATION_ERROR',
    message: 'Invalid input data',
    details: JSON.stringify(details)
  }, 400);
}

export function unauthorized(res: Response, message: string = 'Unauthorized'): Response {
  return error(res, {
    code: 'UNAUTHORIZED',
    message
  }, 401);
}

export function forbidden(res: Response, message: string = 'Forbidden'): Response {
  return error(res, {
    code: 'FORBIDDEN',
    message
  }, 403);
}

export function notFound(res: Response, message: string = 'Resource not found'): Response {
  return error(res, {
    code: 'NOT_FOUND',
    message
  }, 404);
}

export function internalError(res: Response, message: string = 'Internal server error'): Response {
  return error(res, {
    code: 'INTERNAL_SERVER_ERROR',
    message
  }, 500);
}

/**
 * Create success response object (without sending response)
 */
export function createSuccessResponse<T>(
  data: T,
  message?: string,
  path?: string
): ApiResponse<T> {
  return {
    success: true,
    data,
    ...(message && { message }),
    timestamp: new Date().toISOString(),
    ...(path && { path })
  };
}

/**
 * Create error response object (without sending response)
 */
export function createErrorResponse(
  code: string,
  message: string,
  path?: string,
  details?: string | Record<string, unknown>
): ApiResponse {
  return {
    success: false,
    error: {
      code,
      message,
      ...(details && { details: typeof details === 'string' ? details : JSON.stringify(details) })
    },
    timestamp: new Date().toISOString(),
    ...(path && { path })
  };
}