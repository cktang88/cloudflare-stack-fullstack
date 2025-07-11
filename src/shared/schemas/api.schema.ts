import { z } from 'zod';

// Base success response
export const successResponseSchema = z.object({
  success: z.literal(true),
});

// Base error response
export const baseErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  code: z.string().optional(),
  details: z.any().optional(),
});

// Paginated response schema factory
export function createPaginatedResponseSchema<T extends z.ZodTypeAny>(itemSchema: T) {
  return successResponseSchema.extend({
    data: z.array(itemSchema),
    pagination: z.object({
      page: z.number().int().positive(),
      pageSize: z.number().int().positive(),
      total: z.number().int().nonnegative(),
      totalPages: z.number().int().nonnegative(),
    }),
  });
}

// Generic data response schema factory
export function createDataResponseSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return successResponseSchema.extend({
    data: dataSchema,
  });
}

// API request headers schema
export const apiHeadersSchema = z.object({
  'content-type': z.string().optional(),
  'authorization': z.string().optional(),
  'x-request-id': z.string().optional(),
  'x-api-version': z.string().optional(),
});

// Types
export type SuccessResponse = z.infer<typeof successResponseSchema>;
export type BaseErrorResponse = z.infer<typeof baseErrorResponseSchema>;
export type ApiHeaders = z.infer<typeof apiHeadersSchema>;