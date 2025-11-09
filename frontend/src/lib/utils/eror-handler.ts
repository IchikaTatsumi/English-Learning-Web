// frontend/src/lib/utils/error-handler.ts

import { ServerResponseModel } from '../typedefs/server-response';

/**
 * API Error class
 */
export class ApiError extends Error {
  statusCode: number;
  data?: any;

  constructor(message: string, statusCode: number = 500, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.data = data;
  }
}

/**
 * Handle API errors consistently
 */
export function handleApiError(error: unknown): ServerResponseModel<never> {
  console.error('API Error:', error);

  if (error instanceof ApiError) {
    return {
      success: false,
      statusCode: error.statusCode,
      message: error.message,
    };
  }

  if (error instanceof Error) {
    return {
      success: false,
      statusCode: 500,
      message: error.message,
    };
  }

  return {
    success: false,
    statusCode: 500,
    message: 'An unknown error occurred',
  };
}

/**
 * Check if response is successful
 */
export function isSuccessResponse<T>(
  response: ServerResponseModel<T>
): response is ServerResponseModel<T> & { success: true; data: T } {
  return response.success && response.data !== undefined;
}

/**
 * Extract error message from response
 */
export function getErrorMessage(response: ServerResponseModel<any>): string {
  return response.message || 'An error occurred';
}

/**
 * HTTP Status codes
 */
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  INTERNAL_SERVER_ERROR = 500,
}

/**
 * Check if status code is error
 */
export function isErrorStatus(statusCode?: number): boolean {
  if (!statusCode) return true;
  return statusCode >= 400;
}

/**
 * Get user-friendly error message based on status code
 */
export function getUserFriendlyError(statusCode?: number): string {
  switch (statusCode) {
    case HttpStatus.UNAUTHORIZED:
      return 'Please log in to continue';
    case HttpStatus.FORBIDDEN:
      return 'You do not have permission to perform this action';
    case HttpStatus.NOT_FOUND:
      return 'The requested resource was not found';
    case HttpStatus.CONFLICT:
      return 'This action conflicts with existing data';
    case HttpStatus.INTERNAL_SERVER_ERROR:
      return 'An internal server error occurred';
    default:
      return 'An error occurred. Please try again';
  }
}