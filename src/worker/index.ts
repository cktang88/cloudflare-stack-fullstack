import { Hono } from "hono";
import { validator } from "hono/validator";

// Define the environment bindings, including our D1 database
type Env = {
  DB: D1Database;
};

// Define the structure of a Todo item
type Todo = {
  id: number;
  text: string;
  completed: number; // 0 for false, 1 for true
  created_at: string;
};

const app = new Hono<{ Bindings: Env }>();

// GET /api/todos - List all todos
app.get("/api/todos", async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      "SELECT * FROM todos ORDER BY created_at DESC"
    ).all<Todo>();
    return c.json({ success: true, todos: results || [] });
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    return c.json({ success: false, error }, 500);
  }
});

// POST /api/todos - Create a new todo
app.post(
  "/api/todos",
  validator("json", (value, c) => {
    const { text } = value;
    if (!text || typeof text !== "string" || text.trim() === "") {
      return c.json(
        {
          success: false,
          error: "Todo text is required and must be a non-empty string.",
        },
        400
      );
    }
    return { body: { text: text.trim() } };
  }),
  async (c) => {
    const { text } = c.req.valid("json").body;
    try {
      const { results } = await c.env.DB.prepare(
        "INSERT INTO todos (text) VALUES (?) RETURNING *"
      )
        .bind(text)
        .all<Todo>();
      if (results && results.length > 0) {
        return c.json({ success: true, todo: results[0] }, 201);
      } else {
        // Fallback if RETURNING * is not immediately available or behaves unexpectedly in some environments
        // D1 supports RETURNING *, but as a safeguard or for older versions:
        const { meta } = await c.env.DB.prepare(
          "SELECT last_insert_rowid() as id"
        ).run();
        if (meta && meta.last_row_id) {
          const { results: newTodoResults } = await c.env.DB.prepare(
            "SELECT * FROM todos WHERE id = ?"
          )
            .bind(meta.last_row_id)
            .all<Todo>();
          if (newTodoResults && newTodoResults.length > 0) {
            return c.json({ success: true, todo: newTodoResults[0] }, 201);
          }
        }
        return c.json(
          {
            success: false,
            error: "Failed to create todo or retrieve it after creation.",
          },
          500
        );
      }
    } catch (e) {
      const error = e instanceof Error ? e.message : String(e);
      return c.json({ success: false, error }, 500);
    }
  }
);

// PUT /api/todos/:id - Update a todo (mark as completed/uncompleted or edit text)
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
    if (
      completed !== undefined &&
      typeof completed !== "boolean" &&
      typeof completed !== "number"
    ) {
      return c.json(
        {
          success: false,
          error: "Completed status must be a boolean or a number (0 or 1).",
        },
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

    let query = "UPDATE todos SET ";
    const params: (string | number | null)[] = [];

    if (text !== undefined) {
      query += "text = ?";
      params.push(text);
    }
    if (completed !== undefined) {
      if (params.length > 0) query += ", ";
      query += "completed = ?";
      // Ensure completed is stored as 0 or 1
      params.push(completed === true || completed === 1 ? 1 : 0);
    }

    query += " WHERE id = ? RETURNING *";
    params.push(id);

    try {
      const { results } = await c.env.DB.prepare(query)
        .bind(...params)
        .all<Todo>();
      if (results && results.length > 0) {
        return c.json({ success: true, todo: results[0] });
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
    try {
      const { success } = await c.env.DB.prepare(
        "DELETE FROM todos WHERE id = ?"
      )
        .bind(id)
        .run();
      if (success) {
        // Check if any row was actually deleted
        // const changes = (await c.env.DB.prepare("SELECT changes() as count").all<{count: number}>()).results?.[0]?.count;

        // D1's run() method's success indicates the statement was valid and executed,
        // but not necessarily that rows were affected.
        // changes() function in SQLite tells us the number of rows modified by the last INSERT, UPDATE, or DELETE.
        // However, this needs to be called in the same "transaction" or very soon after.
        // For D1, it's simpler to check if the item still exists, or assume success if no error.
        // Given the constraints, for simplicity, we'll assume success if no error occurs and the D1 `success` is true.

        // To be more certain, we can check `meta.changes` from the result of `run()`
        // const { meta } = await c.env.DB.prepare("DELETE FROM todos WHERE id = ?").bind(id).run();
        // if (meta.changes > 0) {
        //   return c.json({ success: true, message: "Todo deleted successfully." });
        // }
        return c.json({
          success: true,
          message: "Todo deleted successfully (or did not exist).",
        });
      } else {
        return c.json({ success: false, error: "Failed to delete todo." }, 500);
      }
    } catch (e) {
      const error = e instanceof Error ? e.message : String(e);
      return c.json({ success: false, error }, 500);
    }
  }
);

// Fallback for any other GET requests (e.g. serving the React app)
// This might need adjustment based on how Vite serves static assets with wrangler
// The 'assets' configuration in wrangler.json handles SPA routing for GETs not matched by API.
// So, we can remove the app.get("*", c.env.ASSETS.fetch); if 'assets' is configured.

// The default route provided by the template
app.get("/api/", (c) => c.json({ name: "Cloudflare Todo API" }));

export default app;
