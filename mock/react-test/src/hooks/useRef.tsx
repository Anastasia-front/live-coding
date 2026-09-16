// useRef stores a mutable value that survives re-renders without causing another render.
// It is useful for DOM nodes, timers, previous values, and other imperative references.
// Updating ref.current is invisible to React rendering, so use state when UI should update.
import { useEffect, useRef } from "react";

export function FocusedInput() {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return <input ref={inputRef} />;
}
