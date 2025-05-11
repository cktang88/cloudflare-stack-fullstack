// Corresponds to the backend Todo structure
export interface Todo {
  id: number;
  text: string;
  completed: number; // 0 for false, 1 for true
  created_at: string;
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
