import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAddTodo } from "./hooks";

export function AddTodoForm() {
  const [text, setText] = useState("");
  const addTodoMutation = useAddTodo();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!text.trim()) return;
    addTodoMutation.mutate(text.trim(), {
      onSuccess: () => {
        setText(""); // Clear input on success
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
      <Input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What needs to be done?"
        className="flex-grow"
        disabled={addTodoMutation.isPending}
      />
      <Button
        type="submit"
        disabled={addTodoMutation.isPending || !text.trim()}
      >
        {addTodoMutation.isPending ? "Adding..." : "Add Todo"}
      </Button>
    </form>
  );
}
