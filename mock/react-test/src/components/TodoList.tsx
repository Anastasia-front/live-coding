import { useState } from "react";

type Todo = { id: number; text: string; completed: boolean };

export function TodoList() {
  const [input, setInput] = useState<string>("");
  const [todos, setTodos] = useState<Todo[]>([]);

  function handleSubmit() {
    if (input.trim().length === 0) return;
    const newTodo = { id: Date.now(), text: input, completed: false };
    setTodos((prevState) => [newTodo, ...prevState]);
    setInput("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      handleSubmit();
    }
  }

  function toggleComplete(id: number) {
    setTodos((prevState) =>
      prevState.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo,
      ),
    );
  }

  function handleDelete(id: number) {
    setTodos((prevState) => prevState.filter((todo) => todo.id !== id));
  }
  return (
    <div>
      <input
        value={input}
        placeholder={"Enter todo"}
        onChange={(e) => setInput(e.target.value)}
      />
      <button onClick={handleSubmit}>Add</button>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            <p>{todo.text}</p>
            <input
              type="checkbox"
              id="completed"
              name="completed"
              checked={todo.completed}
              onKeyDown={handleKeyDown}
              onChange={() => toggleComplete(todo.id)}
            />
            <button onClick={() => handleDelete(todo.id)}>✕</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
