import type { BaseErrorResponse } from '../schemas';
import { ERROR_CODES, HTTP_STATUS } from '../constants';

export function createErrorResponse(
  error: string,
  code?: string,
  details?: any
): BaseErrorResponse {
  return {
    success: false,
    error,
    code,
    details,
  };
}

export function createValidationErrorResponse(
  errors: Record<string, string[]> | string
): BaseErrorResponse {
  if (typeof errors === 'string') {
    return createErrorResponse(errors, ERROR_CODES.VALIDATION_ERROR);
  }
  
  const errorMessage = Object.entries(errors)
    .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
    .join('; ');
  
  return createErrorResponse(
    errorMessage,
    ERROR_CODES.VALIDATION_ERROR,
    errors
  );
}

export function getHttpStatusFromErrorCode(code?: string): number {
  switch (code) {
    case ERROR_CODES.VALIDATION_ERROR:
      return HTTP_STATUS.BAD_REQUEST;
    case ERROR_CODES.NOT_FOUND:
      return HTTP_STATUS.NOT_FOUND;
    case ERROR_CODES.UNAUTHORIZED:
      return HTTP_STATUS.UNAUTHORIZED;
    case ERROR_CODES.FORBIDDEN:
      return HTTP_STATUS.FORBIDDEN;
    case ERROR_CODES.RATE_LIMIT_EXCEEDED:
      return HTTP_STATUS.TOO_MANY_REQUESTS;
    case ERROR_CODES.DATABASE_ERROR:
    case ERROR_CODES.INTERNAL_ERROR:
    default:
      return HTTP_STATUS.INTERNAL_SERVER_ERROR;
  }
}

export function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function parseQueryParams(url: string): Record<string, string> {
  const searchParams = new URL(url).searchParams;
  const params: Record<string, string> = {};
  
  searchParams.forEach((value, key) => {
    params[key] = value;
  });
  
  return params;
}

export function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });
  
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}