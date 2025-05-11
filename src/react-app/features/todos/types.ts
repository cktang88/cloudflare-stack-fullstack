// Corresponds to the backend Todo structure, as returned by Drizzle ORM
export interface Todo {
  id: number;
  text: string;
  completed: boolean; // Drizzle with mode: 'boolean' returns boolean
  userName: string; // Added userName
  created_at: string; // Drizzle returns TEXT as string
}

// Generic API response structure (adjust as needed based on your Hono responses)
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T; // Optional data payload for successful responses
  todo?: T; // Specific for single todo operations like create/update
  todos?: T[]; // Specific for list operations
  message?: string; // For messages like delete success
  error?: string; // For error messages
}
