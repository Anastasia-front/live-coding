import { useEffect, useState } from "react";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

const products = [
  "Coffee Mug",
  "Laptop Stand",
  "Coffee Beans",
  "Desk Lamp",
  "Laptop Sleeve",
];

export function ProductSearch() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const filtered = products.filter((p) =>
    p.toLowerCase().includes(debouncedSearch.toLowerCase()),
  );

  return (
    <div>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search products..."
      />
      <ul>
        {filtered.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
    </div>
  );
}
