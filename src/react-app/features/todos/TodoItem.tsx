import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useUpdateTodo, useDeleteTodo } from "./hooks";
import { type Todo } from "./types";
import { cn } from "@/lib/utils"; // For conditional class names
import { Trash2 } from "lucide-react"; // Icon for delete

interface TodoItemProps {
  todo: Todo;
}

export function TodoItem({ todo }: TodoItemProps) {
  const updateTodoMutation = useUpdateTodo();
  const deleteTodoMutation = useDeleteTodo();

  const handleToggleComplete = () => {
    updateTodoMutation.mutate({
      id: todo.id,
      completed: !todo.completed, // API expects boolean, it will convert to 0/1
    });
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${todo.text}"?`)) {
      deleteTodoMutation.mutate(todo.id);
    }
  };

  return (
    <div
      className={cn(
        "flex items-center justify-between p-3 border-b",
        updateTodoMutation.isPending && "opacity-50 cursor-not-allowed",
        deleteTodoMutation.isPending && "opacity-50 cursor-not-allowed"
      )}
    >
      <div className="flex items-center gap-3">
        <Checkbox
          id={`todo-${todo.id}`}
          checked={!!todo.completed} // Ensure boolean for checkbox
          onCheckedChange={handleToggleComplete}
          disabled={
            updateTodoMutation.isPending || deleteTodoMutation.isPending
          }
          aria-label={
            todo.completed ? "Mark as incomplete" : "Mark as complete"
          }
        />
        <label
          htmlFor={`todo-${todo.id}`}
          className={cn(
            "text-sm font-medium leading-none cursor-pointer",
            todo.completed && "line-through text-muted-foreground",
            updateTodoMutation.isPending && "select-none"
          )}
          onClick={handleToggleComplete} // Allow clicking label to toggle
        >
          {todo.text}
        </label>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleDelete}
        disabled={deleteTodoMutation.isPending || updateTodoMutation.isPending}
        aria-label="Delete todo"
      >
        <Trash2 className="h-4 w-4 text-destructive hover:text-destructive/80" />
      </Button>
    </div>
  );
}
