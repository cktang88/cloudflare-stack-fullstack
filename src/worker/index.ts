import { Hono } from "hono";
import { validator } from "hono/validator";
import { drizzle } from "drizzle-orm/d1";
import { todos as todosTable, type SelectTodo } from "./db/schema"; // Corrected path
import { eq, desc } from "drizzle-orm";

// Define the environment bindings, including our D1 database
type Env = {
  DB: D1Database;
};

// The SelectTodo type from Drizzle schema will be used instead of the manual Todo type.

const app = new Hono<{ Bindings: Env }>();

// GET /api/todos - List all todos
app.get("/api/todos", async (c) => {
  const db = drizzle(c.env.DB, { schema: { todosTable } });
  try {
    const results = await db
      .select()
      .from(todosTable)
      .orderBy(desc(todosTable.createdAt))
      .all();
    return c.json({ success: true, todos: results });
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    return c.json({ success: false, error }, 500);
  }
});

// POST /api/todos - Create a new todo
app.post(
  "/api/todos",
  validator("json", (value, c) => {
    const { text, userName } = value as { text?: string; userName?: string };
    if (!text || typeof text !== "string" || text.trim() === "") {
      return c.json(
        {
          success: false,
          error: "Todo text is required and must be a non-empty string.",
        },
        400
      );
    }
    if (!userName || typeof userName !== "string" || userName.trim() === "") {
      return c.json(
        {
          success: false,
          error: "User name is required and must be a non-empty string.",
        },
        400
      );
    }
    return { body: { text: text.trim(), userName: userName.trim() } };
  }),
  async (c) => {
    const { text, userName } = c.req.valid("json").body;
    const db = drizzle(c.env.DB, { schema: { todosTable } });
    try {
      const newTodos = await db
        .insert(todosTable)
        .values({ text, userName })
        .returning()
        .all();
      if (newTodos && newTodos.length > 0) {
        return c.json({ success: true, todo: newTodos[0] }, 201);
      }
      // Fallback if returning() doesn't yield results (should not happen with D1 adapter)
      return c.json(
        {
          success: false,
          error: "Failed to create todo or retrieve it after creation.",
        },
        500
      );
    } catch (e) {
      const error = e instanceof Error ? e.message : String(e);
      return c.json({ success: false, error }, 500);
    }
  }
);

// PUT /api/todos/:id - Update a todo
app.put(
  "/api/todos/:id",
  validator("param", (value, c) => {
    const id = parseInt(value.id, 10);
    if (isNaN(id)) {
      return c.json(
        { success: false, error: "Invalid todo ID parameter." },
        400
      );
    }
    return { id };
  }),
  validator("json", (value, c) => {
    const { text, completed } = value;
    // Validation for text (if provided)
    if (
      text !== undefined &&
      (typeof text !== "string" || text.trim() === "")
    ) {
      return c.json(
        {
          success: false,
          error: "Todo text must be a non-empty string if provided.",
        },
        400
      );
    }
    // Validation for completed (if provided) - Drizzle schema expects boolean for `completed` field if mode: 'boolean' is used
    if (completed !== undefined && typeof completed !== "boolean") {
      // Drizzle schema for `completed` is `integer({ mode: 'boolean' })`, so it expects a boolean input.
      // The database stores 0/1, but Drizzle handles the conversion.
      return c.json(
        { success: false, error: "Completed status must be a boolean." },
        400
      );
    }
    if (text === undefined && completed === undefined) {
      return c.json(
        {
          success: false,
          error: "Either text or completed status must be provided for update.",
        },
        400
      );
    }
    return { body: { text: text?.trim(), completed } };
  }),
  async (c) => {
    const { id } = c.req.valid("param");
    const { text, completed } = c.req.valid("json").body;
    const db = drizzle(c.env.DB, { schema: { todosTable } });

    const updateValues: Partial<Pick<SelectTodo, "text" | "completed">> = {};
    if (text !== undefined) {
      updateValues.text = text;
    }
    if (completed !== undefined) {
      updateValues.completed = completed; // Drizzle handles boolean to 0/1 via schema mode: 'boolean'
    }

    try {
      const updatedTodos = await db
        .update(todosTable)
        .set(updateValues)
        .where(eq(todosTable.id, id))
        .returning()
        .all();

      if (updatedTodos && updatedTodos.length > 0) {
        return c.json({ success: true, todo: updatedTodos[0] });
      } else {
        return c.json(
          { success: false, error: "Todo not found or not updated." },
          404
        );
      }
    } catch (e) {
      const error = e instanceof Error ? e.message : String(e);
      return c.json({ success: false, error }, 500);
    }
  }
);

// DELETE /api/todos/:id - Delete a todo
app.delete(
  "/api/todos/:id",
  validator("param", (value, c) => {
    const id = parseInt(value.id, 10);
    if (isNaN(id)) {
      return c.json(
        { success: false, error: "Invalid todo ID parameter." },
        400
      );
    }
    return { id };
  }),
  async (c) => {
    const { id } = c.req.valid("param");
    const db = drizzle(c.env.DB, { schema: { todosTable } });
    try {
      // Drizzle's delete doesn't return the deleted row(s) by default with D1 unless .returning() is used and supported.
      // For D1, .run() is typical for delete if you don't need the row back.
      // Check D1 adapter specifics if .returning() is desired and fully supported for delete.
      // For now, assume we just want to confirm deletion.
      const result = await db
        .delete(todosTable)
        .where(eq(todosTable.id, id))
        .run();

      // D1 .run() result for delete doesn't typically give a clear row count directly in `result.changes` or similar field
      // It usually indicates success of execution. We might need a follow-up or trust it if no error.
      // Cloudflare D1 driver for Drizzle might have `result.meta.changes` but this can vary.
      // For simplicity, we check if an error occurred.
      // If you need to confirm a row was deleted, you might need to check meta.changes or if it exists before deletion.

      // Assuming success if no error, as before.
      // If `result.meta.changes > 0` is reliable, that would be better.
      // Let's check if `result.meta` exists and has `changes`
      // According to drizzle-orm/d1, the result of run() is D1Result<T> which has a meta property.
      if (result && result.meta && result.meta.changes > 0) {
        return c.json({ success: true, message: "Todo deleted successfully." });
      } else if (result && result.meta && result.meta.changes === 0) {
        return c.json(
          { success: false, error: "Todo not found or not deleted." },
          404
        );
      } else {
        // Fallback if meta.changes isn't available or indicates an issue
        return c.json({
          success: true,
          message:
            "Todo deletion attempted (status unknown without changes info).",
        });
      }
    } catch (e) {
      const error = e instanceof Error ? e.message : String(e);
      return c.json({ success: false, error }, 500);
    }
  }
);

app.get("/api/", (c) => c.json({ name: "Cloudflare Todo API with Drizzle" }));

export default app;
