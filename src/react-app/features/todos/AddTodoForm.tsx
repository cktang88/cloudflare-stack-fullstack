import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAddTodo } from "./hooks";

interface AddTodoFormProps {
  currentUserName: string;
}

export function AddTodoForm({ currentUserName }: AddTodoFormProps) {
  const [text, setText] = useState("");
  const addTodoMutation = useAddTodo();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!text.trim() || !currentUserName) return;
    addTodoMutation.mutate(
      { text: text.trim(), userName: currentUserName },
      {
        onSuccess: () => {
          setText(""); // Clear input on success
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
      <Input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What needs to be done?"
        className="flex-grow"
        disabled={addTodoMutation.isPending || !currentUserName}
      />
      <Button
        type="submit"
        disabled={addTodoMutation.isPending || !text.trim() || !currentUserName}
      >
        {addTodoMutation.isPending ? "Adding..." : "Add Todo"}
      </Button>
    </form>
  );
}
