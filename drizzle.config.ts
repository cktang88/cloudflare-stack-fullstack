import type { Config } from "drizzle-kit";

export default {
  schema: "./src/worker/db/schema.ts",
  out: "./drizzle/migrations", // Output directory for migrations
  dialect: "sqlite", // D1 is SQLite compatible
  // For D1, drizzle-kit generates SQLite-compatible migrations.
  // The actual D1 connection details are used by Wrangler at runtime and for applying migrations.
  // For local generation, we can point to a dummy local file or a local D1 dev instance URL if available.
  // Let's use a dummy local file path for generation.
  dbCredentials: {
    url: "./local.db", // Dummy path for local migration generation
  },
} satisfies Config;
