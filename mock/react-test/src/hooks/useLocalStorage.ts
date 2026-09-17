// This custom hook mirrors React state into localStorage.
// It is useful for persisting small client-side preferences or form drafts across reloads.
// Values must be JSON-serializable, and browser storage is unavailable during server rendering.
import { type Dispatch, type SetStateAction, useEffect, useState } from "react";

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState(() => {
    const stored = localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}
