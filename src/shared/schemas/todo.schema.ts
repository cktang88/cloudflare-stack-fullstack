import { z } from 'zod';

// Base Todo schema
export const todoSchema = z.object({
  id: z.number().int().positive(),
  text: z.string().min(1).trim(),
  completed: z.boolean(),
  userName: z.string().min(1).trim(),
  createdAt: z.string().datetime(),
});

// Schema for creating a new todo
export const createTodoSchema = z.object({
  text: z.string().min(1, "Todo text is required").trim(),
  userName: z.string().min(1, "User name is required").trim(),
});

// Schema for updating a todo
export const updateTodoSchema = z.object({
  text: z.string().min(1).trim().optional(),
  completed: z.boolean().optional(),
}).refine(
  (data) => data.text !== undefined || data.completed !== undefined,
  { message: "Either text or completed status must be provided for update" }
);

// Schema for todo ID parameter
export const todoIdSchema = z.object({
  id: z.string().transform((val) => {
    const parsed = parseInt(val, 10);
    if (isNaN(parsed)) {
      throw new Error("Invalid todo ID");
    }
    return parsed;
  }),
});

// API Response schemas
export const todoResponseSchema = z.object({
  success: z.literal(true),
  todo: todoSchema,
});

export const todosResponseSchema = z.object({
  success: z.literal(true),
  todos: z.array(todoSchema),
});

export const errorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
});

export const deleteResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
});

// Union type for all API responses
export const apiResponseSchema = z.union([
  todoResponseSchema,
  todosResponseSchema,
  errorResponseSchema,
  deleteResponseSchema,
]);

// Type exports
export type Todo = z.infer<typeof todoSchema>;
export type CreateTodo = z.infer<typeof createTodoSchema>;
export type UpdateTodo = z.infer<typeof updateTodoSchema>;
export type TodoResponse = z.infer<typeof todoResponseSchema>;
export type TodosResponse = z.infer<typeof todosResponseSchema>;
export type ErrorResponse = z.infer<typeof errorResponseSchema>;
export type DeleteResponse = z.infer<typeof deleteResponseSchema>;
export type ApiResponse = z.infer<typeof apiResponseSchema>;