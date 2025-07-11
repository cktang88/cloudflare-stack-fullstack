import {
  type Todo,
  type CreateTodo,
  type UpdateTodo,
  type TodoResponse,
  type TodosResponse,
  type DeleteResponse,
  type ErrorResponse,
  API_ENDPOINTS,
} from "@shared/index";
import { config } from '../config';

class ApiError extends Error {
  constructor(
    public status: number,
    public code?: string,
    public details?: any,
    message?: string
  ) {
    super(message || "API Error");
    this.name = "ApiError";
  }
}

export class ApiClient {
  private baseUrl: string;
  private headers: HeadersInit;
  private timeout: number;

  constructor(baseUrl: string = "", headers: HeadersInit = {}, timeout: number = 30000) {
    this.baseUrl = baseUrl;
    this.headers = {
      "Content-Type": "application/json",
      ...headers,
    };
    this.timeout = timeout;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          ...this.headers,
          ...options.headers,
        },
        signal: controller.signal,
      });

      const data = await response.json();

      if (!response.ok || (data as any).success === false) {
        const errorData = data as ErrorResponse;
        throw new ApiError(
          response.status,
          (errorData as any).code,
          (errorData as any).details,
          errorData.error
        );
      }

      clearTimeout(timeoutId);
      return data as T;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiError(408, 'TIMEOUT', undefined, 'Request timeout');
      }
      
      throw new ApiError(500, undefined, undefined, String(error));
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async getTodos(): Promise<Todo[]> {
    const response = await this.request<TodosResponse>(API_ENDPOINTS.TODOS);
    return response.todos;
  }

  async createTodo(data: CreateTodo): Promise<Todo> {
    const response = await this.request<TodoResponse>(API_ENDPOINTS.TODOS, {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response.todo;
  }

  async updateTodo(id: number, data: UpdateTodo): Promise<Todo> {
    const response = await this.request<TodoResponse>(
      API_ENDPOINTS.TODO_BY_ID(id),
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );
    return response.todo;
  }

  async deleteTodo(id: number): Promise<void> {
    await this.request<DeleteResponse>(API_ENDPOINTS.TODO_BY_ID(id), {
      method: "DELETE",
    });
  }

  async toggleTodo(id: number, completed: boolean): Promise<Todo> {
    return this.updateTodo(id, { completed });
  }
}

// Create a singleton instance with configuration
export const apiClient = new ApiClient(
  config.api.baseUrl,
  {},
  config.api.timeout
);

// Export typed hooks for React Query
export const todoKeys = {
  all: ["todos"] as const,
  lists: () => [...todoKeys.all, "list"] as const,
  list: (filters?: any) => [...todoKeys.lists(), filters] as const,
  details: () => [...todoKeys.all, "detail"] as const,
  detail: (id: number) => [...todoKeys.details(), id] as const,
};