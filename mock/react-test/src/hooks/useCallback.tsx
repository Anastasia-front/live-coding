// useCallback memoizes a function between renders.
// Use it when stable callback identity matters, such as passing handlers to memoized children.
// It does not make the callback body faster, and its dependency list must include every referenced reactive value.
import { useCallback } from "react";

type SelectButtonProps = {
  id: string;
  onSelect: (id: string) => void;
};

export function SelectButton({ id, onSelect }: SelectButtonProps) {
  const handleSelect = useCallback(() => onSelect(id), [id, onSelect]);

  return <button onClick={handleSelect}>Select</button>;
}
