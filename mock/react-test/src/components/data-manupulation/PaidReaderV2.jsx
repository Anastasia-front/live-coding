// bookApi.js

// {
//   books: [
//     {
//       id: 101,
//       title: "The Millennium Wolves",
//       genre: "Paranormal",
//       totalChapters: 20,
//       currentChapter: 3,
//       freePreviewChapters: 3,
//       chapterPrice: 8,
//     },
//   ],
//   total: 84:
// }

// import { searchBooks } from "./bookApi";

// searchBooks({ query, genre, signal })

// requirements
// You now need something approximately like:
// query               source state
// genre               source state

// books               API response state
// totalResults        API response state

// loading             request/UI state
// searchError         request/UI state

// credits             business state
// purchases           business state
// selectedBookId      UI state

// books is no longer:
// allBooks.filter(...)

// because the server already searched and filtered them.
// Conceptually:
// query + genre
//       ↓
// useEffect
//       ↓
// API
//       ↓
// books
//       ↓
// render

// Requirement 1 — debounce
// Do not call the backend for every character.
// User types:
// m
// mo
// moo
// moon
// moonb

// Without debounce:
// 5 API requests ❌

// Instead wait:
// 350 ms

// after the user's latest input before searching.
// Conceptually:
// type "m"
//    ↓
// start 350ms timer

// type "o" after 100ms
//    ↓
// cancel previous timer
// start new 350ms timer

// type "o"
//    ↓
// cancel
// restart

// user stops
//    ↓
// 350ms passes
//    ↓
// API request

// This is exactly a legitimate useEffect side effect because you're managing a timer and an external request.
// Requirement 2 — request cancellation
// Consider:
// search "moon"
//       ↓
// Request A starts

// then user searches "wolf"
//       ↓
// Request B starts

// Bad situation:
// Request B returns in 100ms
// → display wolf results

// Request A returns in 800ms
// → overwrites them with moon results ❌

// This is called a race condition / stale response problem.
// Use:
// AbortController

// so cleanup of the previous effect cancels its request.
// The behavior should be:
// query changes
//    ↓
// cleanup previous effect
//    ↓
// clear debounce timer
// abort previous request
//    ↓
// start new effect

// An aborted request is not a user-visible error.
// Do not display:
// Search failed

// because the user simply typed another character.
// Requirement 3 — loading
// While a real network request is happening:
// loading === true

// Render:
// Searching...

// When it completes:
// loading === false

// Also ensure failure ends loading.
// This state represents something that cannot simply be derived from query:
// query !== ""

// does not tell you whether a network request is currently pending.
// So loading genuinely belongs in state.
// Requirement 4 — errors
// If the backend genuinely fails:
// 500
// network unavailable
// unexpected failure

// show:
// Could not load books

// But:
// AbortError

// should be ignored.
// A new successful request should clear the previous search error.
// Keep this search/API error separate from business errors such as:
// Not enough credits

// because those are different problems.
// For example:
// searchError
// purchaseError

// is cleaner than one ambiguous:
// error

// Requirement 5 — caching
// Suppose the user searches:
// query = "moon"
// genre = "Fantasy"

// and receives the result.
// Then searches:
// wolf

// Then returns to:
// moon + Fantasy

// You should not necessarily make the same network request again.
// Create an in-memory cache.
// A natural cache key could conceptually be:
// "moon|Fantasy"

// and the value:
// {
//   books: [...],
//   total: 12
// }

// Think about:
// key → API response

// This is an excellent Map use case.
// You should also decide:
// Does changing this cache need to render the component?

// No.
// Therefore this is also a very interesting place to consider:
// useRef(new Map())

// rather than state.
// Your task is:
// 1. Normalize query
// 2. Build cache key
// 3. Check cache
// 4. If cached:
//       use cached response
//       DON'T make request
// 5. Otherwise:
//       request backend
// 6. On success:
//       cache response
//       update UI

// For this exercise you don't need TTL/cache expiration yet.
// Requirement 6 — no raw filtering
// Do not do:
// books.filter(book =>
//   book.title.includes(query)
// )

// for the search.
// The server already performs search.
// You can still calculate derived things from the returned books, such as:
// average reading progress
// locked chapter count
// completed result count

// Requirement 7 — keep the controlled input immediate
// This must remain:
// <input
//   value={query}
//   onChange={(e) =>
//     setQuery(e.target.value)
//   }
// />

// Do not put:
// setQuery(...)

// inside startTransition.
// Typing should update React state immediately.
// In this architecture, debouncing the API request solves a different problem than useDeferredValue.
// That distinction is very important:
// debounce
// → don't perform the operation until user pauses

// useDeferredValue
// → perform React updates, but allow slower UI
//    to lag behind urgent UI

// You may not need useDeferredValue at all if server results are small and rendering is fast.
// Keep all previous business rules
// The previous requirements still apply:
// subscriber → every chapter accessible

// freePreviewChapters → free

// purchased chapter → accessible

// locked next chapter → cannot Continue

// purchase → deduct credits

// insufficient credits → early return

// no duplicate purchase

// currentChapter never exceeds totalChapters

// Completed replaces Continue

// selectedBookId must rerender UI

// locked-chapter count

import { useEffect, useMemo, useRef, useState } from "react";

export async function searchBooks({ query, genre, signal }) {
  const params = new URLSearchParams({
    query,
    genre,
    limit: "100",
  });

  const response = await fetch(`/api/books/search?${params}`, { signal });

  if (!response.ok) {
    throw new Error(`Search failed: ${response.status}`);
  }

  return response.json();
}

export default function PaidReader({ initialCredits, isSubscriber }) {
  const [credits, setCredits] = useState(initialCredits);
  const [books, setBooks] = useState(initialCredits);
  const [totalResults, setTotalResults] = useState(0);

  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("all");
  const bookById = useMemo(() => {
    return new Map(books.map((book) => [book.id, book]));
  }, [books]);
  const cache = useRef(new Map());

  const [purchasedChapters, setPurchasedChapters] = useState(() => new Set());

  const [selectedBookId, setSelectedBookId] = useState(null);

  const [searchError, setSearchError] = useState("");
  const [purchaseError, setPurchaseError] = useState("");

  const getChapterKey = (bookId, chapterNumber) => `${bookId}:${chapterNumber}`;
  const normalizedQuery = query.trim().toLowerCase();

  useEffect(() => {
    const cacheKey = `${normalizedQuery}|${genre}`;

    if (cache.current.has(cacheKey)) {
      const cached = cache.current.get(cacheKey);

      setBooks(cached.books);
      setTotalResults(cached.total);
      setSearchError("");
      setLoading(false);

      return;
    }

    // A previous request may just have been
    // cancelled while we debounce the new one.
    setLoading(false);

    const controller = new AbortController();

    const timeout = setTimeout(async () => {
      setLoading(true);
      setSearchError("");

      try {
        const result = await searchBooks({
          query: normalizedQuery,
          genre,
          signal: controller.signal,
        });

        if (controller.signal.aborted) {
          return;
        }

        cache.current.set(cacheKey, result);

        setBooks(result.books);
        setTotalResults(result.total);
      } catch (error) {
        if (error.name === "AbortError") {
          return;
        }

        setSearchError("Could not load books");
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

  const completedBooks = books.filter(
    (book) => book.currentChapter >= book.totalChapters,
  ).length;

  const purchasedChaptersTotal = purchasedChapters.size;

  const totalVisibleProgress = books.reduce((total, book) => {
    const progress = (book.currentChapter / book.totalChapters) * 100;

    return total + progress;
  }, 0);

  const averageReadingProgress =
    books.length > 0 ? Math.round(totalVisibleProgress / books.length) : 0;

  const lockedChapterCount = isSubscriber
    ? 0
    : books.reduce((total, book) => {
        let locked = 0;

        for (
          let chapter = book.freePreviewChapters + 1;
          chapter <= book.totalChapters;
          chapter++
        ) {
          const purchased = purchasedChapters.has(
            getChapterKey(book.id, chapter),
          );

          if (!purchased) {
            locked++;
          }
        }

        return total + locked;
      }, 0);

  const selectedBook =
    selectedBookId !== null ? bookById.get(selectedBookId) : null;

  const purchaseChapter = (bookId, chapterNumber) => {
    const book = bookById.get(bookId);

    if (!book) return;

    const chapterKey = getChapterKey(bookId, chapterNumber);

    if (purchasedChapters.has(chapterKey)) {
      return;
    }

    if (credits < book.chapterPrice) {
      setPurchaseError("Not enough credits");
      return;
    }

    setCredits((prev) => prev - book.chapterPrice);

    setPurchasedChapters((prev) => {
      const next = new Set(prev);

      next.add(chapterKey);

      return next;
    });

    setPurchaseError("");
  };

  const continueReading = (bookId) => {
    const book = bookById.get(bookId);

    if (!book) return;

    if (book.currentChapter >= book.totalChapters) {
      return;
    }

    const nextChapter = book.currentChapter + 1;

    const canAccessNextChapter =
      isSubscriber ||
      nextChapter <= book.freePreviewChapters ||
      purchasedChapters.has(getChapterKey(book.id, nextChapter));

    if (!canAccessNextChapter) {
      setPurchaseError(`Chapter ${nextChapter} is locked`);
      return;
    }

    setBooks((prevBooks) =>
      prevBooks.map((item) =>
        item.id === bookId
          ? {
              ...item,
              currentChapter: Math.min(
                item.totalChapters,
                item.currentChapter + 1,
              ),
            }
          : item,
      ),
    );

    setPurchaseError("");
  };

  return (
    <div>
      <h2>Galatea Reader</h2>

      <p>Credits: {credits}</p>

      {selectedBook && <p>Selected: {selectedBook.title}</p>}

      <input
        value={query}
        placeholder="Search books..."
        onChange={(e) => setQuery(e.target.value)}
      />

      <select value={genre} onChange={(e) => setGenre(e.target.value)}>
        <option value="all">All genres</option>
        <option value="Romance">Romance</option>
        <option value="Fantasy">Fantasy</option>
        <option value="Paranormal">Paranormal</option>
      </select>

      <p>Total matching books: {totalResults}</p>
      <p>Visible books: {books.length}</p>
      <p>Completed books: {completedBooks}</p>
      <p>Purchased chapters: {purchasedChaptersTotal}</p>
      <p>Average reading progress: {averageReadingProgress}%</p>
      <p>Locked chapters: {lockedChapterCount}</p>

      {searchError && <p>{searchError}</p>}
      {purchaseError && <p>{purchaseError}</p>}
      {loading && <p>Searching...</p>}

      {books.length === 0 ? (
        <p>No books found</p>
      ) : (
        books.map((book) => {
          const completed = book.currentChapter >= book.totalChapters;
          const nextChapter = book.currentChapter + 1;
          const nextChapterIsFree = nextChapter <= book.freePreviewChapters;
          const nextChapterPurchased = purchasedChapters.has(
            getChapterKey(book.id, nextChapter),
          );

          const nextChapterLocked =
            !isSubscriber &&
            !completed &&
            !nextChapterIsFree &&
            !nextChapterPurchased;

          return (
            <article key={book.id}>
              <h3>{book.title}</h3>

              <p>{book.genre}</p>

              <p>
                Chapter {book.currentChapter} / {book.totalChapters}
              </p>

              <button onClick={() => setSelectedBookId(book.id)}>Select</button>

              {completed ? (
                <p>Completed</p>
              ) : (
                <button onClick={() => continueReading(book.id)}>
                  Continue
                </button>
              )}

              {nextChapterLocked && (
                <button onClick={() => purchaseChapter(book.id, nextChapter)}>
                  Unlock chapter {nextChapter} — {book.chapterPrice} credits
                </button>
              )}
            </article>
          );
        })
      )}
    </div>
  );
}
