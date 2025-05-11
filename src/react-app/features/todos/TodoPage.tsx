import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTodos } from "./hooks";
import { AddTodoForm } from "./AddTodoForm";
import { TodoList } from "./TodoList";
import { Skeleton } from "@/components/ui/skeleton"; // For loading state

interface TodoPageProps {
  currentUserName: string | null;
}

export function TodoPage({ currentUserName }: TodoPageProps) {
  const { data: todos, isLoading, isError, error } = useTodos();

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Shared Todos</CardTitle>
          <CardDescription>
            {currentUserName ? `Welcome, ${currentUserName}! ` : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentUserName ? (
            <AddTodoForm currentUserName={currentUserName} />
          ) : (
            <p className="text-center text-muted-foreground mb-4">
              Please set your name to add todos.
            </p>
          )}

          {isLoading && (
            <div className="space-y-2 mt-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          )}
          {isError && (
            <p className="text-destructive text-center py-4">
              Error fetching todos: {error?.message || "Unknown error"}
            </p>
          )}
          {!isLoading && !isError && todos && <TodoList todos={todos} />}
        </CardContent>
      </Card>
    </div>
  );
}
