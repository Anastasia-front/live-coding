// useDeferredValue keeps an older value visible while React catches up with a less urgent render.
// It helps expensive UI stay responsive while fast input state updates immediately.
// It is not a fixed timer debounce; React decides when the deferred value can update.
import { useDeferredValue, useMemo, useState } from "react";

type DeferredSearchProps = {
  items: string[];
};

export function DeferredSearch({ items }: DeferredSearchProps) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  const results = useMemo(
    () =>
      items.filter((item) =>
        item.toLowerCase().includes(deferredQuery.toLowerCase()),
      ),
    [deferredQuery, items],
  );

  return (
    <div>
      <input value={query} onChange={(event) => setQuery(event.target.value)} />
      <ul>
        {results.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
