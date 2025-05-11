import { type Todo, type ApiResponse } from "./types";

const API_BASE_URL = "/api"; // Assuming your Hono API is served under /api

async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const data: ApiResponse<T> = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || "API request failed");
  }
  return data;
}

export const getTodos = async (): Promise<Todo[]> => {
  const response = await fetch(`${API_BASE_URL}/todos`);
  const data = await handleResponse<Todo>(response);
  return data.todos || []; // Backend returns { success: true, todos: [...] }
};

export const addTodo = async (payload: {
  text: string;
  userName: string;
}): Promise<Todo> => {
  const { text, userName } = payload;
  const response = await fetch(`${API_BASE_URL}/todos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, userName }), // Added userName
  });
  const data = await handleResponse<Todo>(response);
  return data.todo!; // Backend returns { success: true, todo: {...} }
};

interface ApiUpdateTodoPayload {
  id: number;
  text?: string;
  completed?: boolean; // Client-facing API uses boolean
}

export const updateTodo = async (
  payload: ApiUpdateTodoPayload
): Promise<Todo> => {
  const { id, ...updateData } = payload;

  const backendPayload: { text?: string; completed?: number } = {};
  if (updateData.text !== undefined) {
    backendPayload.text = updateData.text;
  }
  if (typeof updateData.completed === "boolean") {
    backendPayload.completed = updateData.completed ? 1 : 0;
  }

  const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(backendPayload), // Send 0/1 for completed
  });
  const data = await handleResponse<Todo>(response);
  return data.todo!; // Backend returns { success: true, todo: {...} }
};

export const deleteTodo = async (
  id: number
): Promise<ApiResponse<{ message: string }>> => {
  const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
    method: "DELETE",
  });
  // Delete might not return a typical todo object, but a success message
  return handleResponse<{ message: string }>(response);
};
