// {
//   books: [
//     {
//       id: 101,
//       title: "Moonbound",
//       author: "Anna Reed",
//       genre: "Fantasy",
//       rating: 4.7,
//       totalChapters: 20,
//       currentChapter: 6,
//       isPremium: true,
//     },
//   ],
//   total: 127
// }

import { useEffect, useMemo, useRef, useState } from "react";

export async function searchBooks({ query, genre, signal }) {
  const params = new URLSearchParams({
    query,
    genre,
    limit: "50",
  });

  const response = await fetch(`/api/books/search?${params}`, { signal });

  if (!response.ok) {
    throw new Error(`Search failed: ${response.status}`);
  }

  return response.json();
}

export default function DiscoverBooks() {
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("all");

  const [books, setBooks] = useState([]);
  const [totalResults, setTotalResults] = useState(0);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [selectedBookId, setSelectedBookId] = useState(null);

  const [favoriteBookIds, setFavoriteBookIds] = useState(new Set());
  const cache = useRef(new Map());

  const normalizedQuery = query.trim().toLowerCase();
  useEffect(() => {
    const controller = new AbortController();
    if (cache.current.has(`${normalizedQuery}|${genre}`)) {
      setLoading(true);
      const result = cache.current.get(`${normalizedQuery}|${genre}`);
      setBooks(result.books);
      setTotalResults(result.total);
      setLoading(false);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        setLoading(true);
        const result = await searchBooks({
          query: normalizedQuery,
          genre,
          signal: controller.signal,
        });

        if (controller.signal.aborted) return;
        setError("");
        setBooks(result.books);
        setTotalResults(result.total);
        cache.current.set(`${normalizedQuery}|${genre}`, result);
      } catch (e) {
        if (e.name === "AbortError") {
          return;
        }
        setError("could not load books");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, 350);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [normalizedQuery, genre]);

  const bookById = useMemo(() => {
    return new Map(books.map((book) => [book.id, book]));
  }, [books]);

  const toggleFavorite = (bookId) => {
    setFavoriteBookIds((prev) => {
      const next = new Set(prev);

      if (next.has(bookId)) {
        next.delete(bookId);
      } else {
        next.add(bookId);
      }

      return next;
    });
  };

  const averageRating =
    books.length > 0
      ? (
          books.reduce((total, book) => {
            return (total += book.rating);
          }, 0) / books.length
        ).toFixed(2)
      : 0;
  const completed = books.reduce((total, book) => {
    if (book.currentChapter >= book.totalChapters) total++;
    return total;
  }, 0);
  const premium = books.reduce((total, book) => {
    if (book.isPremium) total++;
    return total;
  }, 0);
  return (
    <div>
      <h2>Discover</h2>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search books..."
      />

      <select value={genre} onChange={(e) => setGenre(e.target.value)}>
        <option value="all">All genres</option>

        <option value="Fantasy">Fantasy</option>
        <option value="Romance">Romance</option>
        <option value="Paranormal">Paranormal</option>
      </select>

      {loading && <p>Searching...</p>}
      {error && <p>{error}</p>}

      {selectedBookId && bookById.has(selectedBookId) && (
        <p>Selected:{bookById.get(selectedBookId).title}</p>
      )}
      <p>
        Results: {books.length} / {totalResults}
      </p>

      <p>Loaded results: {books.length}</p>
      <p>Average rating: {averageRating}</p>
      <p>Completed in results: {completed}</p>
      <p>Premium in results: {premium}</p>
      <p>Favorites: {favoriteBookIds.size}</p>
      {!loading && books.length === 0 ? (
        <p>No books found</p>
      ) : (
        books.map((book) => (
          <article key={book.id}>
            <h3>{book.title}</h3>

            <p>{book.author}</p>
            <p>{book.genre}</p>
            <p>Rating: {book.rating}</p>

            <button onClick={() => setSelectedBookId(book.id)}>Select</button>

            <button onClick={() => toggleFavorite(book.id)}>
              {!favoriteBookIds.has(book.id) ? "Favorite" : "Remove favorite"}
            </button>
          </article>
        ))
      )}
    </div>
  );
}

// Requirements
// The search input stays controlled and immediate:
// setQuery(...)

// must not be inside a transition.
// The API search must be debounced by:
// 350ms

// If the user types again before 350 ms, cancel the pending timer.
// If an HTTP request has already started and query/genre changes, cancel that request using:
// AbortController

// An aborted request is not an error.
// You need real:
// loading
// error
// empty
// success

// states.
// For example:
// request starts
// → loading true

// request succeeds/fails
// → loading false

// A real error shows:
// Could not load books

// A successful request clears the previous error.
// Cache
// Use:
// useRef(new Map())

// for an in-memory search cache.
// The key must include both:
// normalized query
// genre

// So these must be different:
// moon|Fantasy
// moon|Romance

// The value is the entire API response:
// {
//   books,
//   total
// }

// On cache hit:
// do not call the API
// use cached books
// use cached total

// Think carefully about why the cache should be useRef, not useState.
// Favorites
// For favorites you only need to answer:
// Is book ID 101 currently a favorite?

// Choose an appropriate structure.
// Don't use an array just because the broken code uses one.
// The button should display:
// Favorite

// or:
// Remove favorite

// and toggle immutably.
// Display:
// Favorites: X

// Selected book
// Display above results:
// Selected: Moonbound

// selectedBookId needs to cause rendering.
// Use your bookById lookup if useful.
// If a new search means the selected book is no longer present, it's okay for the selection text to disappear; don't automatically mutate selectedBookId just because it's absent from current results.
// Derived statistics
// From the current returned books, display:
// Loaded results: X
// Average rating: X.XX
// Completed in results: X
// Premium in results: X
// Favorites: X

// Completed:
// currentChapter >= totalChapters

// Do not put those statistics in state.
// Decide yourself whether they deserve useMemo.
// Important constraints
// No filtering by query in React:
// books.filter(book =>
//   book.title.includes(query)
// )

// is forbidden for search because the server already performs search.
// No state updates inside useMemo.
// No state update in Effect cleanup except where truly required.
// Use:
// key={book.id}

// Your effect should conceptually achieve:
// query / genre changes
//         ↓
// check cache
//         ↓
// cache hit? → use it
//         ↓ no
// debounce 350ms
//         ↓
// network request
//         ↓
// loading
//         ↓
// success / error
//         ↓
// cache success
//         ↓
// render

// dependency changes/unmount
//         ↓
// clear timer
// abort stale request

// export default function DiscoverBooks() {
//   const [query, setQuery] = useState("");
//   const [genre, setGenre] = useState("all");

//   const [books, setBooks] = useState([]);
//   const [totalResults, setTotalResults] =
//     useState(0);

//   const [loading, setLoading] =
//     useState(false);

//   const [error, setError] =
//     useState("");

//   const [selectedBookId, setSelectedBookId] =
//     useState(null);

//   const [favoriteBookIds, setFavoriteBookIds] =
//     useState([]);

//   const cache = useRef(new Map());

//   const [isPending, startTransition] =
//     useTransition();

//   useEffect(() => {
//     searchBooks({
//       query,
//       genre,
//     }).then((result) => {
//       setBooks(result.books);
//       setTotalResults(result.total);
//     });
//   }, [query, genre]);

//   const bookById = useMemo(() => {
//     return new Map(
//       books.map((book) => [
//         book.id,
//         book,
//       ]),
//     );
//   }, [books]);

//   const toggleFavorite = (bookId) => {
//     favoriteBookIds.push(bookId);

//     setFavoriteBookIds(
//       favoriteBookIds,
//     );
//   };

//   return (
//     <div>
//       <h2>Discover</h2>

//       <input
//         value={query}
//         onChange={(e) =>
//           startTransition(() =>
//             setQuery(e.target.value),
//           )
//         }
//         placeholder="Search books..."
//       />

//       <select
//         value={genre}
//         onChange={(e) =>
//           setGenre(e.target.value)
//         }
//       >
//         <option value="all">
//           All genres
//         </option>

//         <option value="Fantasy">
//           Fantasy
//         </option>

//         <option value="Romance">
//           Romance
//         </option>

//         <option value="Paranormal">
//           Paranormal
//         </option>
//       </select>

//       {loading && <p>Searching...</p>}
//       {error && <p>{error}</p>}
//       {isPending && <p>Updating...</p>}

//       <p>
//         Results: {books.length} /{" "}
//         {totalResults}
//       </p>

//       {books.map((book) => (
//         <article key={book.title}>
//           <h3>{book.title}</h3>

//           <p>{book.author}</p>
//           <p>{book.genre}</p>
//           <p>Rating: {book.rating}</p>

//           <button
//             onClick={() =>
//               setSelectedBookId(
//                 book.id,
//               )
//             }
//           >
//             Select
//           </button>

//           <button
//             onClick={() =>
//               toggleFavorite(
//                 book.id,
//               )
//             }
//           >
//             Favorite
//           </button>
//         </article>
//       ))}
//     </div>
//   );
// }
