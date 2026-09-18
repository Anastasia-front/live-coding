// useTransition marks a state update as non-urgent.
// It helps urgent updates like typing stay responsive while slower rendering work continues in the background.
// It does not make slow code faster; it only changes update priority and exposes pending state.
import { type ChangeEvent, useState, useTransition } from "react";

function expensiveFilter(items: string[], query: string) {
  return items.filter((item) =>
    item.toLowerCase().includes(query.toLowerCase()),
  );
}

type SearchWithTransitionProps = {
  items: string[];
};

export function SearchWithTransition({ items }: SearchWithTransitionProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(items);
  const [isPending, startTransition] = useTransition();

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const nextQuery = event.target.value;
    setQuery(nextQuery);
    startTransition(() => {
      setResults(expensiveFilter(items, nextQuery));
    });
  }

  return (
    <div>
      <input value={query} onChange={handleChange} />
      {isPending && <span>Loading...</span>}
      <ul>
        {results.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
