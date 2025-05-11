import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as api from "./api";
import { type Todo } from "./types";

const TODO_QUERY_KEY = ["todos"];

export const useTodos = () => {
  return useQuery<Todo[], Error>({
    queryKey: TODO_QUERY_KEY,
    queryFn: api.getTodos,
  });
};

export const useAddTodo = () => {
  const queryClient = useQueryClient();
  return useMutation<Todo, Error, string>({
    // Todo: return type, Error: error type, string: input type (text)
    mutationFn: api.addTodo,
    onSuccess: (newTodo) => {
      // Optimistically update the cache or refetch
      // queryClient.setQueryData(TODO_QUERY_KEY, (oldTodos: Todo[] | undefined) => oldTodos ? [...oldTodos, newTodo] : [newTodo]);
      queryClient.invalidateQueries({ queryKey: TODO_QUERY_KEY });
      toast.success(`Todo "${newTodo.text}" added!`);
    },
    onError: (error) => {
      toast.error(`Failed to add todo: ${error.message}`);
    },
  });
};

interface UpdateTodoVariables {
  id: number;
  text?: string;
  completed?: boolean;
}

export const useUpdateTodo = () => {
  const queryClient = useQueryClient();
  return useMutation<Todo, Error, UpdateTodoVariables>({
    mutationFn: api.updateTodo,
    onSuccess: (updatedTodo) => {
      queryClient.invalidateQueries({ queryKey: TODO_QUERY_KEY });
      // More specific update if desired:
      // queryClient.setQueryData(TODO_QUERY_KEY, (oldTodos: Todo[] | undefined) =>
      //   oldTodos ? oldTodos.map(todo => todo.id === updatedTodo.id ? updatedTodo : todo) : []
      // );
      toast.success(`Todo "${updatedTodo.text}" updated!`);
    },
    onError: (error) => {
      toast.error(`Failed to update todo: ${error.message}`);
    },
  });
};

export const useDeleteTodo = () => {
  const queryClient = useQueryClient();
  return useMutation<unknown, Error, number>({
    // unknown: API response type, Error: error type, number: input type (id)
    mutationFn: api.deleteTodo,
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: TODO_QUERY_KEY });
      // We don't have the todo text here directly from API response, so a generic message
      toast.success(`Todo (ID: ${id}) deleted!`);
    },
    onError: (error) => {
      toast.error(`Failed to delete todo: ${error.message}`);
    },
  });
};
