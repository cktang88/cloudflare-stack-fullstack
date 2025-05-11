import {
  sqliteTable,
  text,
  integer,
  // primaryKey, // Already identified as unused by linter
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const todos = sqliteTable("todos", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  text: text("text").notNull(),
  completed: integer("completed", { mode: "boolean" }).default(false).notNull(), // Using mode: 'boolean' for Drizzle, D1 stores as 0/1
  userName: text("user_name").notNull(), // Added userName field
  createdAt: text("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

// If you plan to have more tables or more complex types, you can add them here.
// For example, a type for new todos (without id or createdAt)
export type NewTodo = typeof todos.$inferInsert;
export type SelectTodo = typeof todos.$inferSelect;
