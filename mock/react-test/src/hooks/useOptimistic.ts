// useOptimistic shows a temporary state while an async action is still being confirmed.
// It is useful for responsive mutations such as adding, editing, or deleting an item before the server replies.
// The optimistic reducer should be pure, and the real source of truth still needs to settle after the request.
import { useOptimistic } from "react";

type Todo = {
  id: number;
  text: string;
  completed: boolean;
};

type OptimisticTodo = Todo & {
  sending?: boolean;
};

export function useOptimisticTodos(
  todos: Todo[],
  saveTodoToServer: (todo: Todo) => Promise<void>,
) {
  const [optimisticTodos, addOptimisticTodo] = useOptimistic<
    OptimisticTodo[],
    Todo
  >(todos, (currentTodos: OptimisticTodo[], newTodo: Todo) => [
    ...currentTodos,
    { ...newTodo, sending: true },
  ]);

  async function handleAdd(text: string) {
    const newTodo = { id: Date.now(), text, completed: false };
    addOptimisticTodo(newTodo); // shows immediately, before the request completes
    await saveTodoToServer(newTodo); // real state update happens here, via a server action / state setter
  }

  return { optimisticTodos, handleAdd };
}
