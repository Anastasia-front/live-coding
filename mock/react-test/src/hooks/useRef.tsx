// useRef stores a mutable value that survives re-renders without causing another render.
// It is useful for DOM nodes, timers, previous values, and other imperative references.
// Updating ref.current is invisible to React rendering, so use state when UI should update.
import { type ChangeEvent, useEffect, useRef, useState } from "react";

type Product = {
  id: number;
  name: string;
};

async function searchProducts(
  query: string,
  signal: AbortSignal,
): Promise<Product[]> {
  const response = await fetch(`/api/products?q=${encodeURIComponent(query)}`, {
    signal,
  });

  if (!response.ok) {
    throw new Error("Could not load products");
  }

  return response.json() as Promise<Product[]>;
}

export function ProductSearch() {
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestRef = useRef<AbortController | null>(null);
  const latestQueryRef = useRef("");
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    inputRef.current?.focus();

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      requestRef.current?.abort();
    };
  }, []);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const query = event.target.value.trim();
    latestQueryRef.current = query;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    requestRef.current?.abort();

    if (!query) {
      setProducts([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    debounceTimerRef.current = setTimeout(async () => {
      const controller = new AbortController();
      requestRef.current = controller;
      setIsLoading(true);
      setError(null);

      try {
        const matches = await searchProducts(query, controller.signal);

        if (latestQueryRef.current === query) {
          setProducts(matches);
        }
      } catch (requestError) {
        if (
          requestError instanceof Error &&
          requestError.name !== "AbortError"
        ) {
          setError(requestError.message);
        }
      } finally {
        if (latestQueryRef.current === query) {
          setIsLoading(false);
        }
      }
    }, 300);
  }

  function selectSearchText() {
    inputRef.current?.focus();
    inputRef.current?.select();
  }

  return (
    <section>
      <label htmlFor="product-search">Search products</label>
      <input
        ref={inputRef}
        id="product-search"
        type="search"
        onChange={handleChange}
      />
      <button type="button" onClick={selectSearchText}>
        Select search text
      </button>

      {isLoading && <p>Loading...</p>}
      {error && <p role="alert">{error}</p>}

      <ul>
        {products.map((product) => (
          <li key={product.id}>{product.name}</li>
        ))}
      </ul>
    </section>
  );
}
