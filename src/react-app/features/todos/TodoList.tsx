import { type Todo } from "./types";
import { TodoItem } from "./TodoItem";

interface TodoListProps {
  todos: Todo[];
}

export function TodoList({ todos }: TodoListProps) {
  if (todos.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-4">
        No todos yet. Add one above!
      </p>
    );
  }

  return (
    <div className="border rounded-md">
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </div>
  );
}
