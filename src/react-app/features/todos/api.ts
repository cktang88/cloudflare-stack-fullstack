import { apiClient } from "../../lib/api-client";
import type { CreateTodo, UpdateTodo } from "@shared/schemas";

// Re-export from the API client for backward compatibility
export const getTodos = () => apiClient.getTodos();

export const addTodo = (payload: CreateTodo) => apiClient.createTodo(payload);

export const updateTodo = async (payload: { id: number } & UpdateTodo) => {
  const { id, ...updateData } = payload;
  return apiClient.updateTodo(id, updateData);
};

export const deleteTodo = (id: number) => apiClient.deleteTodo(id);

// Helper function for toggling todo completion status
export const toggleTodo = (id: number, completed: boolean) => 
  apiClient.toggleTodo(id, completed);