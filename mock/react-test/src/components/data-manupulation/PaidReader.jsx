// import {
//   useCallback,
//   useEffect,
//   useMemo,
//   useRef,
//   useState,
//   useTransition,
// } from "react";

// export default function PaidReader({
//   initialBooks,
//   initialCredits,
//   isSubscriber,
// }) {
//   const [books, setBooks] = useState(initialBooks);
//   const [credits, setCredits] = useState(initialCredits);

//   const [query, setQuery] = useState("");
//   const [genre, setGenre] = useState("all");

//   const [visibleBooks, setVisibleBooks] =
//     useState(initialBooks);

//   const [purchasedChapters, setPurchasedChapters] =
//     useState([]);

//   const [selectedBookId, setSelectedBookId] =
//     useState(null);

//   const [error, setError] = useState("");

//   const selectedBookRef = useRef(null);

//   const [isPending, startTransition] =
//     useTransition();

//   const bookById = useMemo(() => {
//     new Map(
//       books.map((book) => [book.id, book]),
//     );
//   }, [books]);

//   useEffect(() => {
//     setVisibleBooks(
//       books.filter(
//         (book) =>
//           book.title
//             .toLowerCase()
//             .includes(query.toLowerCase()) &&
//           (genre === "all" ||
//             book.genre === genre),
//       ),
//     );
//   }, [books, query, genre]);

//   const lockedChapterCount = useMemo(() => {
//     let count = 0;

//     visibleBooks.forEach((book) => {
//       count +=
//         book.totalChapters -
//         book.freePreviewChapters;
//     });

//     setError("");
//     return count;
//   }, [visibleBooks]);

//   const handleSearch = (e) => {
//     startTransition(() => {
//       setQuery(e.target.value);
//     });
//   };

//   const selectBook = (bookId) => {
//     selectedBookRef.current = bookId;
//   };

//   const purchaseChapter = useCallback(
//     (bookId, chapterNumber) => {
//       const book = books.find(
//         (book) => book.id === bookId,
//       );

//       if (credits < book.chapterPrice) {
//         setError("Not enough credits");
//       }

//       setCredits(
//         credits - book.chapterPrice,
//       );

//       purchasedChapters.push({
//         bookId,
//         chapterNumber,
//       });

//       setPurchasedChapters(
//         purchasedChapters,
//       );
//     },
//     [],
//   );

//   const continueReading = (bookId) => {
//     const book = books.find(
//       (book) => book.id === bookId,
//     );

//     book.currentChapter += 1;

//     setBooks(books);
//   };

//   return (
//     <div>
//       <h2>Galatea Reader</h2>

//       <p>Credits: {credits}</p>

//       <input
//         value={query}
//         placeholder="Search books..."
//         onChange={handleSearch}
//       />

//       {isPending && <span>Searching...</span>}

//       <select
//         value={genre}
//         onChange={(e) =>
//           setGenre(e.target.value)
//         }
//       >
//         <option value="all">
//           All genres
//         </option>

//         <option value="Romance">
//           Romance
//         </option>

//         <option value="Fantasy">
//           Fantasy
//         </option>

//         <option value="Paranormal">
//           Paranormal
//         </option>
//       </select>

//       <p>
//         Locked chapters: {lockedChapterCount}
//       </p>

//       {error && <p>{error}</p>}

//       {visibleBooks.map((book) => (
//         <article key={book.title}>
//           <h3>{book.title}</h3>

//           <p>{book.genre}</p>

//           <p>
//             Chapter {book.currentChapter} /{" "}
//             {book.totalChapters}
//           </p>

//           <button
//             onClick={() =>
//               selectBook(book.id)
//             }
//           >
//             Select
//           </button>

//           <button
//             onClick={() =>
//               continueReading(book.id)
//             }
//           >
//             Continue
//           </button>
//         </article>
//       ))}
//     </div>
//   );
// }

// Assume:
// initialCredits = 25;

// and:
// isSubscriber = false;

// Product requirements
// Search + genre
// Search by title.
// It must be:
// case-insensitive
// partial

// Search and genre filter work together.
// visibleBooks must be derived from:
// books
// query
// genre

// Do not store filtered books separately unless you can justify it.
// Chapter access rules
// This is the important part.
// A chapter is accessible when any of these is true:
// user is subscriber

// OR

// chapterNumber <= freePreviewChapters

// OR

// user purchased that chapter

// Example:
// book.freePreviewChapters = 3;

// means:
// chapter 1 ✅
// chapter 2 ✅
// chapter 3 ✅
// chapter 4 🔒

// unless chapter 4 was purchased or the user is a subscriber.
// Continue Reading
// currentChapter means:
// the chapter currently being read

// Clicking:
// Continue

// attempts to move to:
// currentChapter + 1

// First determine:
// const nextChapter = ...

// Then check whether that chapter is accessible.
// If accessible:
// currentChapter → next chapter

// If locked:
// do NOT advance

// Instead display:
// Chapter X is locked

// Never go beyond:
// totalChapters

// If already finished, display:
// Completed

// instead of Continue.
// Purchase Chapter
// If the next chapter is locked and the user is not a subscriber, show:
// Unlock chapter 6 — 10 credits

// Clicking it should:
// 1. validate credits
// 2. deduct chapterPrice
// 3. record that exact chapter as purchased
// 4. clear any previous error

// It should not automatically advance reading progress.
// So:
// Purchase
// ≠
// Continue

// Insufficient credits
// If:
// credits < book.chapterPrice

// show:
// Not enough credits

// and make no other state changes.
// No negative balance.
// No duplicate purchases
// If this exists:
// {
//   bookId: 102,
//   chapterNumber: 6
// }

// you must not purchase chapter 6 again.
// You should be able to answer:
// Which data structure makes checking ownership efficient?

// You may change the structure of purchasedChapters if you think the existing array is poor.
// This is one place where I specifically want you to consider whether:
// Map

// or:
// Set

// is more appropriate.
// Do not automatically choose Map just because we're practicing it.
// Selected book
// Click:
// Select

// The UI must display:
// Selected: The Arrangement

// above the list.
// This must update the UI.
// Decide whether:
// useRef

// is appropriate for selectedBookId.
// Derived statistics
// Display:
// Visible books: X
// Completed books: X
// Purchased chapters: X
// Average reading progress: X%

// Definitions:
// Visible books
// Based on current filters.
// Completed books
// Global, based on all books:
// currentChapter >= totalChapters

// Purchased chapters
// Global number of individually purchased chapters.
// Subscribers may still have historical purchases, so don't derive this from subscription status.
// Average reading progress
// Based on visible books:
// currentChapter / totalChapters * 100

// Example:
// book A = 50%
// book B = 100%

// average = 75%

// Round to integer.
// Decide yourself whether these need:
// useMemo

// or can simply be calculated during render.
// Locked chapter count
// This is trickier than the broken original implementation.
// Display:
// Locked chapters: X

// for visible books.
// Count chapters that are currently inaccessible.
// For a non-subscriber:
// totalChapters = 10
// freePreviewChapters = 3
// purchased chapters = [4, 7]

// Then locked chapters:
// 5, 6, 8, 9, 10

// = 5 locked chapters

// Do not simply calculate:
// totalChapters - freePreviewChapters

// because some paid chapters may already be purchased.
// For a subscriber:
// Locked chapters: 0

// because the subscription grants access.
// Galatea currently describes its subscription as unlimited access to its stories, so this exercise mirrors that general entitlement model. Galatea - Immersive Fiction
// Map requirement
// I want at least one justified use of Map in this solution.
// But you need to decide where it makes sense.
// Potential data relationships include:
// bookId → book
// bookId → purchased chapters

// Do not use Map artificially if another structure is clearly better for a particular requirement.
// Hooks
// The original code contains:
// useState
// useEffect
// useMemo
// useCallback
// useRef
// useTransition

// Some are wrong.
// Some are unnecessary.
// Some might remain.
// You can introduce:
// useDeferredValue

// if appropriate.
// Again, do not preserve hooks just because they're already there.
// Important constraints
// Do not mutate:
// books
// book
// purchasedChapters

// Do not update state from inside:
// useMemo

// Use:
// key={book.id}

// No external libraries.
// Keep this as one component.

// Platform:
// DAU: ~500,000

// Catalog:
// 10,000 books
// ~200 chapters/book average
// ≈ 2,000,000 chapters total

// Per user:
// Library: typically 20–100 books
// Purchased chapters: typically <500

// API behavior:
// The frontend does NOT download all 10,000 books.
// Search is server-side for the full catalog.

// This component receives:
// up to ~100–500 books at once.

import { useMemo, useState } from "react";

export const initialBooks = [
  {
    id: 101,
    title: "The Millennium Wolves",
    genre: "Paranormal",
    totalChapters: 20,
    currentChapter: 3,
    freePreviewChapters: 3,
    chapterPrice: 8,
  },
  {
    id: 102,
    title: "The Arrangement",
    genre: "Romance",
    totalChapters: 16,
    currentChapter: 5,
    freePreviewChapters: 2,
    chapterPrice: 10,
  },
  {
    id: 103,
    title: "Moonbound",
    genre: "Fantasy",
    totalChapters: 12,
    currentChapter: 1,
    freePreviewChapters: 3,
    chapterPrice: 7,
  },
  {
    id: 104,
    title: "Broken Hearts",
    genre: "Romance",
    totalChapters: 10,
    currentChapter: 10,
    freePreviewChapters: 2,
    chapterPrice: 9,
  },
];

export default function PaidReader({
  initialBooks,
  initialCredits,
  isSubscriber,
}) {
  const [books, setBooks] = useState(initialBooks);
  const [credits, setCredits] = useState(initialCredits);

  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("all");

  const [purchasedChapters, setPurchasedChapters] = useState(() => new Set());

  const [selectedBookId, setSelectedBookId] = useState(null);

  const [error, setError] = useState("");

  const getChapterKey = (bookId, chapterNumber) => `${bookId}:${chapterNumber}`;

  const bookById = useMemo(() => {
    return new Map(books.map((book) => [book.id, book]));
  }, [books]);

  const normalizedQuery = query.trim().toLowerCase();

  const visibleBooks = books.filter((book) => {
    const matchesSearch = book.title.toLowerCase().includes(normalizedQuery);

    const matchesGenre = genre === "all" || book.genre === genre;

    return matchesSearch && matchesGenre;
  });

  const completedBooks = books.filter(
    (book) => book.currentChapter >= book.totalChapters,
  ).length;

  const purchasedChaptersTotal = purchasedChapters.size;

  const totalVisibleProgress = visibleBooks.reduce((total, book) => {
    const progress = (book.currentChapter / book.totalChapters) * 100;

    return total + progress;
  }, 0);

  const averageReadingProgress =
    visibleBooks.length > 0
      ? Math.round(totalVisibleProgress / visibleBooks.length)
      : 0;

  const lockedChapterCount = isSubscriber
    ? 0
    : visibleBooks.reduce((total, book) => {
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
      setError("Not enough credits");
      return;
    }

    setCredits((prev) => prev - book.chapterPrice);

    setPurchasedChapters((prev) => {
      const next = new Set(prev);

      next.add(chapterKey);

      return next;
    });

    setError("");
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
      setError(`Chapter ${nextChapter} is locked`);
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

    setError("");
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

      <p>Visible books: {visibleBooks.length}</p>
      <p>Completed books: {completedBooks}</p>
      <p>Purchased chapters: {purchasedChaptersTotal}</p>
      <p>Average reading progress: {averageReadingProgress}%</p>
      <p>Locked chapters: {lockedChapterCount}</p>

      {error && <p>{error}</p>}

      {visibleBooks.length === 0 ? (
        <p>No books found</p>
      ) : (
        visibleBooks.map((book) => {
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
