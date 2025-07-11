import { Hono } from "hono";
import { validator } from "hono/validator";
import { drizzle } from "drizzle-orm/d1";
import { todos as todosTable, type SelectTodo } from "./db/schema";
import { eq, desc } from "drizzle-orm";
import { 
  createTodoSchema, 
  updateTodoSchema, 
  todoIdSchema,
  type CreateTodo,
  type UpdateTodo,
  type TodoResponse,
  type TodosResponse,
  type ErrorResponse,
  type DeleteResponse
} from "@shared/schemas";
import { 
  createErrorResponse, 
  createValidationErrorResponse,
  getHttpStatusFromErrorCode,
  ERROR_CODES,
  HTTP_STATUS 
} from "@shared/index";
import { configMiddleware } from "./middleware/config";
import { loggingMiddleware } from "./middleware/logging";

// Define the environment bindings, including our D1 database
type Env = {
  DB: D1Database;
  // Environment variables
  NODE_ENV?: string;
  DATABASE_NAME?: string;
  DATABASE_ID?: string;
  ENABLE_AUTH?: string;
  ENABLE_API_DOCS?: string;
  ENABLE_RATE_LIMITING?: string;
  JWT_SECRET?: string;
  LOG_LEVEL?: string;
};

const app = new Hono<{ Bindings: Env }>();

// Apply global middlewares
app.use('*', configMiddleware);
app.use('*', loggingMiddleware);

// GET /api/todos - List all todos
app.get("/api/todos", async (c) => {
  const db = drizzle(c.env.DB, { schema: { todosTable } });
  try {
    const results = await db
      .select()
      .from(todosTable)
      .orderBy(desc(todosTable.createdAt))
      .all();
    
    const response: TodosResponse = { 
      success: true, 
      todos: results.map(todo => ({
        ...todo,
        createdAt: todo.createdAt // Already in ISO format from DB
      }))
    };
    return c.json(response);
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    const response: ErrorResponse = createErrorResponse(error, ERROR_CODES.DATABASE_ERROR);
    return c.json(response, getHttpStatusFromErrorCode((response as any).code) as any);
  }
});

// POST /api/todos - Create a new todo
app.post(
  "/api/todos",
  validator("json", (value, c) => {
    const result = createTodoSchema.safeParse(value);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      return c.json(
        createValidationErrorResponse(errors),
        HTTP_STATUS.BAD_REQUEST
      );
    }
    return result.data;
  }),
  async (c) => {
    const validatedData = c.req.valid("json") as CreateTodo;
    const db = drizzle(c.env.DB, { schema: { todosTable } });
    
    try {
      const newTodos = await db
        .insert(todosTable)
        .values(validatedData)
        .returning()
        .all();
      
      if (newTodos && newTodos.length > 0) {
        const response: TodoResponse = { 
          success: true, 
          todo: {
            ...newTodos[0],
            createdAt: newTodos[0].createdAt
          }
        };
        return c.json(response, HTTP_STATUS.CREATED);
      }
      
      const response: ErrorResponse = createErrorResponse(
        "Failed to create todo or retrieve it after creation.",
        ERROR_CODES.INTERNAL_ERROR
      );
      return c.json(response, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    } catch (e) {
      const error = e instanceof Error ? e.message : String(e);
      const response: ErrorResponse = createErrorResponse(error, ERROR_CODES.DATABASE_ERROR);
      return c.json(response, getHttpStatusFromErrorCode((response as any).code) as any);
    }
  }
);

// PUT /api/todos/:id - Update a todo
app.put(
  "/api/todos/:id",
  validator("param", (value, c) => {
    const result = todoIdSchema.safeParse(value);
    if (!result.success) {
      return c.json(
        createErrorResponse("Invalid todo ID parameter.", ERROR_CODES.VALIDATION_ERROR),
        HTTP_STATUS.BAD_REQUEST
      );
    }
    return result.data;
  }),
  validator("json", (value, c) => {
    const result = updateTodoSchema.safeParse(value);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      const formErrors = result.error.flatten().formErrors;
      
      if (formErrors.length > 0) {
        return c.json(
          createErrorResponse(formErrors[0], ERROR_CODES.VALIDATION_ERROR),
          HTTP_STATUS.BAD_REQUEST
        );
      }
      
      return c.json(
        createValidationErrorResponse(errors),
        HTTP_STATUS.BAD_REQUEST
      );
    }
    return result.data;
  }),
  async (c) => {
    const { id } = c.req.valid("param") as { id: number };
    const updateData = c.req.valid("json") as UpdateTodo;
    const db = drizzle(c.env.DB, { schema: { todosTable } });

    const updateValues: Partial<Pick<SelectTodo, "text" | "completed">> = {};
    if (updateData.text !== undefined) {
      updateValues.text = updateData.text;
    }
    if (updateData.completed !== undefined) {
      updateValues.completed = updateData.completed;
    }

    try {
      const updatedTodos = await db
        .update(todosTable)
        .set(updateValues)
        .where(eq(todosTable.id, id))
        .returning()
        .all();

      if (updatedTodos && updatedTodos.length > 0) {
        const response: TodoResponse = { 
          success: true, 
          todo: {
            ...updatedTodos[0],
            createdAt: updatedTodos[0].createdAt
          }
        };
        return c.json(response);
      } else {
        const response: ErrorResponse = createErrorResponse(
          "Todo not found or not updated.",
          ERROR_CODES.NOT_FOUND
        );
        return c.json(response, HTTP_STATUS.NOT_FOUND);
      }
    } catch (e) {
      const error = e instanceof Error ? e.message : String(e);
      const response: ErrorResponse = createErrorResponse(error, ERROR_CODES.DATABASE_ERROR);
      return c.json(response, getHttpStatusFromErrorCode((response as any).code) as any);
    }
  }
);

// DELETE /api/todos/:id - Delete a todo
app.delete(
  "/api/todos/:id",
  validator("param", (value, c) => {
    const result = todoIdSchema.safeParse(value);
    if (!result.success) {
      return c.json(
        createErrorResponse("Invalid todo ID parameter.", ERROR_CODES.VALIDATION_ERROR),
        HTTP_STATUS.BAD_REQUEST
      );
    }
    return result.data;
  }),
  async (c) => {
    const { id } = c.req.valid("param") as { id: number };
    const db = drizzle(c.env.DB, { schema: { todosTable } });
    
    try {
      const result = await db
        .delete(todosTable)
        .where(eq(todosTable.id, id))
        .run();

      if (result && result.meta && result.meta.changes > 0) {
        const response: DeleteResponse = { 
          success: true, 
          message: "Todo deleted successfully." 
        };
        return c.json(response);
      } else if (result && result.meta && result.meta.changes === 0) {
        const response: ErrorResponse = createErrorResponse(
          "Todo not found or not deleted.",
          ERROR_CODES.NOT_FOUND
        );
        return c.json(response, HTTP_STATUS.NOT_FOUND);
      } else {
        const response: DeleteResponse = {
          success: true,
          message: "Todo deletion attempted (status unknown without changes info).",
        };
        return c.json(response);
      }
    } catch (e) {
      const error = e instanceof Error ? e.message : String(e);
      const response: ErrorResponse = createErrorResponse(error, ERROR_CODES.DATABASE_ERROR);
      return c.json(response, getHttpStatusFromErrorCode((response as any).code) as any);
    }
  }
);

app.get("/api/", (c) => c.json({ name: "Cloudflare Todo API with Drizzle" }));

export default app;