// A reader opens a book, reads chapters, purchases locked chapters, and can rapidly switch between books. The app must survive slow networks, duplicate clicks, stale responses, temporary server errors, and excessive progress updates.
// Assume:
// ~500k DAU
// up to 100 books loaded in this screen
// one active book at a time
// reading position can change several times per second
// mobile networks can be unreliable

import { useEffect, useEffectEvent, useMemo, useRef, useState } from "react";

const SAVE_DEBOUNCE_MS = 750;
const MAX_SAVE_ATTEMPTS = 3;
const INITIAL_RETRY_DELAY_MS = 500;

const getPurchaseKey = (bookId, chapter) => `${bookId}:${chapter}`;

const getNextChapter = (progress) => progress.chapter + 1;

const canAccessChapter = (book, chapter) =>
  chapter <= book.freePreviewChapters || book.purchasedChapters.has(chapter);

const getErrorStatus = (error) => error?.status ?? error?.response?.status;

const getRetryAfterMs = (error) =>
  error?.retryAfterMs ?? error?.response?.retryAfterMs ?? 1000;

const getConflictProgress = (error) => error?.latest ?? error?.response?.latest;

const createIdempotencyKey = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()}`;
};

export default function Reader({ initialBooks, initialCredits, userId }) {
  /*
   * Convert purchased chapters to Sets once.
   *
   * bookId -> book is handled separately with Map.
   * purchased chapter lookup is membership:
   *
   * Set.has(chapter)
   */
  const [books, setBooks] = useState(() =>
    initialBooks.map((book) => ({
      ...book,
      purchasedChapters: new Set(book.purchasedChapters ?? []),
    })),
  );

  const [credits, setCredits] = useState(initialCredits);

  const [activeBookId, setActiveBookId] = useState(initialBooks[0]?.id ?? null);

  /*
   * bookId -> {
   *   chapter,
   *   scrollPercent,
   *   version,
   *   revision,
   *   saveStatus
   * }
   *
   * saveStatus:
   * "saved"
   * "unsaved"
   * "saving"
   * "error"
   */
  const [progressByBook, setProgressByBook] = useState(() => new Map());

  /*
   * Loading progress is separate from
   * background saving.
   */
  const [loadState, setLoadState] = useState({
    bookId: null,
    status: "idle",
    error: "",
  });

  /*
   * Purchase pending state is granular:
   *
   * "101:6"
   * "102:4"
   */
  const [pendingPurchases, setPendingPurchases] = useState(() => new Set());

  const [purchaseError, setPurchaseError] = useState("");

  /*
   * ----------------------------
   * REFS / RUNTIME DATA
   * ----------------------------
   *
   * These values must survive renders,
   * but changing them should not itself
   * render the UI.
   */

  const mountedRef = useRef(true);

  /*
   * Synchronous mirror of progress state.
   *
   * Async callbacks can always read the
   * latest progress without stale closures.
   */
  const progressRef = useRef(new Map());

  /*
   * Runtime persistence machinery
   * per book.
   */
  const saveRuntimeRef = useRef(new Map());

  /*
   * Guards stale progress-load responses.
   */
  const loadRequestIdRef = useRef(0);

  /*
   * Synchronous duplicate purchase guard.
   */
  const pendingPurchaseRef = useRef(new Set());

  /*
   * Same logical purchase keeps the same
   * idempotency key across retries.
   */
  const idempotencyKeysRef = useRef(new Map());

  /*
   * ----------------------------
   * DERIVED LOOKUPS
   * ----------------------------
   */

  const bookById = useMemo(() => {
    return new Map(books.map((book) => [book.id, book]));
  }, [books]);

  const activeBook = activeBookId !== null ? bookById.get(activeBookId) : null;

  const activeProgress =
    activeBookId !== null ? progressByBook.get(activeBookId) : null;

  /*
   * ----------------------------
   * PROGRESS STATE HELPERS
   * ----------------------------
   */

  const replaceProgress = (bookId, progress) => {
    const next = new Map(progressRef.current);

    next.set(bookId, progress);

    progressRef.current = next;

    if (mountedRef.current) {
      setProgressByBook(next);
    }
  };

  const updateLocalProgress = (bookId, updater) => {
    const current = progressRef.current.get(bookId);

    if (!current) return;

    const updated = updater(current);

    const nextProgress = {
      ...current,
      ...updated,

      /*
       * revision is CLIENT-SIDE.
       *
       * It lets us know whether another
       * local edit happened while an older
       * save was in flight.
       */
      revision: current.revision + 1,

      saveStatus: "unsaved",
    };

    replaceProgress(bookId, nextProgress);
  };

  const updateSaveStatus = (bookId, status) => {
    const current = progressRef.current.get(bookId);

    if (!current) return;

    replaceProgress(bookId, {
      ...current,
      saveStatus: status,
    });
  };

  /*
   * ----------------------------
   * SAVE RUNTIME
   * ----------------------------
   */

  const getSaveRuntime = (bookId) => {
    let runtime = saveRuntimeRef.current.get(bookId);

    if (!runtime) {
      runtime = {
        debounceTimer: null,
        retryTimer: null,
        controller: null,

        inFlight: false,

        /*
         * Latest waiting snapshot.
         *
         * Older pending snapshots are
         * replaced by newer ones.
         */
        pending: null,
      };

      saveRuntimeRef.current.set(bookId, runtime);
    }

    return runtime;
  };

  const createSaveSnapshot = (bookId, progress, attempt = 0) => ({
    bookId,
    chapter: progress.chapter,
    scrollPercent: progress.scrollPercent,
    version: progress.version,
    revision: progress.revision,
    attempt,
  });

  /*
   * Forward declaration through function
   * declaration is useful because timers
   * below call this function.
   */
  async function drainSaveQueue(bookId) {
    const runtime = getSaveRuntime(bookId);

    /*
     * Only one save per book at once.
     *
     * This dramatically simplifies version
     * ordering.
     */
    if (runtime.inFlight || !runtime.pending) {
      return;
    }

    const snapshot = runtime.pending;

    runtime.pending = null;
    runtime.inFlight = true;

    const controller = new AbortController();

    runtime.controller = controller;

    const current = progressRef.current.get(bookId);

    if (current && current.revision === snapshot.revision) {
      updateSaveStatus(bookId, "saving");
    }

    try {
      const result = await saveReadingProgress({
        userId,
        bookId,
        chapter: snapshot.chapter,
        scrollPercent: snapshot.scrollPercent,
        version: snapshot.version,
        signal: controller.signal,
      });

      if (controller.signal.aborted) {
        return;
      }

      const latest = progressRef.current.get(bookId);

      if (!latest) return;

      /*
       * If another local change happened
       * during the request, NEVER overwrite
       * chapter/scrollPercent with this
       * older response.
       *
       * We only advance the server version.
       */
      const newerLocalChange = latest.revision > snapshot.revision;

      if (runtime.pending) {
        /*
         * The next queued save must use the
         * new server version.
         */
        runtime.pending = {
          ...runtime.pending,
          version: result.version,
        };
      }

      replaceProgress(bookId, {
        ...latest,

        version: result.version,

        saveStatus: newerLocalChange || runtime.pending ? "unsaved" : "saved",
      });
    } catch (error) {
      if (error?.name === "AbortError" || controller.signal.aborted) {
        return;
      }

      const status = getErrorStatus(error);

      /*
       * ------------------------
       * 409 — SERVER WINS
       * ------------------------
       */
      if (status === 409) {
        const serverProgress = getConflictProgress(error);

        if (serverProgress) {
          /*
           * Requirement explicitly says:
           * server wins.
           *
           * Discard queued stale local saves.
           */
          runtime.pending = null;

          if (runtime.debounceTimer) {
            clearTimeout(runtime.debounceTimer);

            runtime.debounceTimer = null;
          }

          if (runtime.retryTimer) {
            clearTimeout(runtime.retryTimer);

            runtime.retryTimer = null;
          }

          const local = progressRef.current.get(bookId);

          replaceProgress(bookId, {
            chapter: serverProgress.chapter,
            scrollPercent: serverProgress.scrollPercent,
            version: serverProgress.version,
            revision: (local?.revision ?? 0) + 1,
            saveStatus: "saved",
          });
        }

        return;
      }

      /*
       * ------------------------
       * 429 — RESPECT SERVER
       * ------------------------
       */
      if (status === 429) {
        const retryAfterMs = getRetryAfterMs(error);

        const latest = progressRef.current.get(bookId);

        /*
         * If user has moved further while
         * this request was pending, retry
         * the LATEST position instead of
         * the stale snapshot.
         */
        const retrySnapshot =
          latest && latest.revision > snapshot.revision
            ? createSaveSnapshot(bookId, latest, 0)
            : snapshot;

        runtime.pending = retrySnapshot;

        if (latest) {
          updateSaveStatus(bookId, "unsaved");
        }

        runtime.retryTimer = setTimeout(() => {
          runtime.retryTimer = null;

          void drainSaveQueue(bookId);
        }, retryAfterMs);

        return;
      }

      /*
       * ------------------------
       * 500 — BOUNDED BACKOFF
       * ------------------------
       */

      if (status === 500) {
        const latest = progressRef.current.get(bookId);

        /*
         * If a newer edit exists, the newer
         * edit becomes the retry candidate
         * and gets a fresh retry budget.
         */
        const newerProgressExists =
          latest && latest.revision > snapshot.revision;

        const nextAttempt = newerProgressExists ? 0 : snapshot.attempt + 1;

        if (nextAttempt < MAX_SAVE_ATTEMPTS) {
          const candidate = newerProgressExists
            ? createSaveSnapshot(bookId, latest, 0)
            : {
                ...snapshot,
                attempt: nextAttempt,
              };

          runtime.pending = candidate;

          if (latest) {
            updateSaveStatus(bookId, "unsaved");
          }

          /*
           * 500ms
           * 1000ms
           *
           * after the initial request.
           */
          const delay = INITIAL_RETRY_DELAY_MS * 2 ** snapshot.attempt;

          runtime.retryTimer = setTimeout(() => {
            runtime.retryTimer = null;

            void drainSaveQueue(bookId);
          }, delay);

          return;
        }

        updateSaveStatus(bookId, "error");

        return;
      }

      /*
       * Unknown/non-retriable failure.
       */
      updateSaveStatus(bookId, "error");
    } finally {
      runtime.inFlight = false;
      runtime.controller = null;

      /*
       * A newer save may have become ready
       * while this request was in flight.
       *
       * If there is no debounce/retry timer
       * holding it back, process it now.
       */
      if (
        runtime.pending &&
        !runtime.debounceTimer &&
        !runtime.retryTimer &&
        mountedRef.current
      ) {
        queueMicrotask(() => {
          void drainSaveQueue(bookId);
        });
      }
    }
  }

  const scheduleSave = useEffectEvent((bookId, progress) => {
    const runtime = getSaveRuntime(bookId);

    const snapshot = createSaveSnapshot(bookId, progress);

    /*
     * Latest progress replaces an older
     * waiting snapshot.
     */
    runtime.pending = snapshot;

    if (runtime.debounceTimer) {
      clearTimeout(runtime.debounceTimer);
    }

    /*
     * A NEW local change supersedes a
     * previously scheduled retry.
     */
    if (runtime.retryTimer) {
      clearTimeout(runtime.retryTimer);

      runtime.retryTimer = null;
    }

    runtime.debounceTimer = setTimeout(() => {
      runtime.debounceTimer = null;

      void drainSaveQueue(bookId);
    }, SAVE_DEBOUNCE_MS);
  });
  /*
   * ----------------------------
   * LOAD ACTIVE BOOK PROGRESS
   * ----------------------------
   */

  useEffect(() => {
    if (activeBookId === null) {
      return;
    }

    /*
     * We already have this book's local
     * progress from this session.
     *
     * Switching back does not destroy it
     * by refetching from server.
     */
    if (progressRef.current.has(activeBookId)) {
      setLoadState({
        bookId: activeBookId,
        status: "ready",
        error: "",
      });

      return;
    }

    const controller = new AbortController();

    const requestId = ++loadRequestIdRef.current;

    async function loadProgress() {
      setLoadState({
        bookId: activeBookId,
        status: "loading",
        error: "",
      });

      try {
        const result = await getBookProgress({
          userId,
          bookId: activeBookId,
          signal: controller.signal,
        });

        /*
         * AbortController is primary
         * protection.
         *
         * requestId is a second stale-result
         * guard in case the underlying API
         * ignores abort.
         */
        if (
          controller.signal.aborted ||
          requestId !== loadRequestIdRef.current
        ) {
          return;
        }

        const book = bookById.get(activeBookId);

        replaceProgress(activeBookId, {
          chapter: Math.min(
            result.chapter,
            book?.totalChapters ?? result.chapter,
          ),

          scrollPercent: result.scrollPercent,

          version: result.version,

          revision: 0,

          saveStatus: "saved",
        });

        setLoadState({
          bookId: activeBookId,
          status: "ready",
          error: "",
        });
      } catch (error) {
        if (error?.name === "AbortError" || controller.signal.aborted) {
          return;
        }

        if (requestId === loadRequestIdRef.current) {
          setLoadState({
            bookId: activeBookId,

            status: "error",

            error: "Could not load progress",
          });
        }
      }
    }

    void loadProgress();

    return () => {
      controller.abort();
    };
  }, [activeBookId, userId, bookById]);

  /*
   * ----------------------------
   * DEBOUNCED BACKGROUND SAVE
   * ----------------------------
   *
   * Every local change marks progress
   * "unsaved".
   *
   * This effect synchronizes that local
   * state with the server.
   */

  useEffect(() => {
    if (
      activeBookId === null ||
      !activeProgress ||
      activeProgress.saveStatus !== "unsaved"
    ) {
      return;
    }

    scheduleSave(activeBookId, activeProgress);
  }, [
    activeBookId,
    activeProgress?.revision,
    activeProgress?.saveStatus,
    activeProgress,
    scheduleSave,
  ]);

  /*
   * Notice:
   *
   * We intentionally DO NOT cancel old
   * book save timers when activeBookId
   * changes.
   *
   * A Moonbound save remains relevant even
   * after the user switches to Dark Orbit.
   *
   * This satisfies the requirement that
   * switching books does not lose the
   * previous book's unsaved position.
   */

  /*
   * ----------------------------
   * UNMOUNT CLEANUP
   * ----------------------------
   */

  useEffect(() => {
    mountedRef.current = true;

    const saveRuntimes = saveRuntimeRef.current;

    return () => {
      mountedRef.current = false;

      for (const runtime of saveRuntimes.values()) {
        if (runtime.debounceTimer) {
          clearTimeout(runtime.debounceTimer);
        }

        if (runtime.retryTimer) {
          clearTimeout(runtime.retryTimer);
        }

        runtime.controller?.abort();
      }
    };
  }, []);

  /*
   * ----------------------------
   * LOCAL READING ACTIONS
   * ----------------------------
   */

  const handleScrollChange = (value) => {
    if (activeBookId === null || !activeProgress) {
      return;
    }

    updateLocalProgress(activeBookId, () => ({
      scrollPercent: Math.max(0, Math.min(100, value)),
    }));
  };

  const goToNextChapter = () => {
    if (!activeBook || !activeProgress) {
      return;
    }

    if (activeProgress.chapter >= activeBook.totalChapters) {
      return;
    }

    const nextChapter = getNextChapter(activeProgress);

    if (!canAccessChapter(activeBook, nextChapter)) {
      return;
    }

    updateLocalProgress(activeBook.id, () => ({
      chapter: Math.min(nextChapter, activeBook.totalChapters),

      scrollPercent: 0,
    }));
  };

  /*
   * ----------------------------
   * PURCHASE
   * ----------------------------
   */

  const buyChapter = async (bookId, chapter) => {
    const book = bookById.get(bookId);

    if (!book) return;

    if (book.purchasedChapters.has(chapter)) {
      return;
    }

    const purchaseKey = getPurchaseKey(bookId, chapter);

    /*
     * REF guard is synchronous.
     *
     * A second click cannot sneak in before
     * React has rerendered the disabled
     * button.
     */
    if (pendingPurchaseRef.current.has(purchaseKey)) {
      return;
    }

    if (credits < book.chapterPrice) {
      setPurchaseError("Not enough credits");

      return;
    }

    let idempotencyKey = idempotencyKeysRef.current.get(purchaseKey);

    if (!idempotencyKey) {
      idempotencyKey = createIdempotencyKey();

      idempotencyKeysRef.current.set(purchaseKey, idempotencyKey);
    }

    pendingPurchaseRef.current.add(purchaseKey);

    setPendingPurchases((prev) => {
      const next = new Set(prev);

      next.add(purchaseKey);

      return next;
    });

    setPurchaseError("");

    try {
      const response = await purchaseChapter({
        userId,
        bookId,
        chapter,
        idempotencyKey,
      });

      if (!mountedRef.current) {
        return;
      }

      /*
       * Credits only decrease through this
       * component.
       *
       * Math.min prevents an older purchase
       * response from raising the displayed
       * balance after a newer purchase.
       *
       * In a larger wallet system I'd use a
       * versioned balance or refetch the
       * authoritative wallet state instead.
       */
      setCredits((current) => Math.min(current, response.credits));

      setBooks((prevBooks) =>
        prevBooks.map((item) => {
          if (item.id !== bookId) {
            return item;
          }

          const purchased = new Set(item.purchasedChapters);

          purchased.add(chapter);

          return {
            ...item,

            purchasedChapters: purchased,
          };
        }),
      );

      setPurchaseError("");
    } catch {
      if (mountedRef.current) {
        /*
         * Keep the idempotency key.
         *
         * If user retries after an uncertain
         * network failure, it is still the
         * same logical purchase.
         */
        setPurchaseError("Purchase failed");
      }
    } finally {
      pendingPurchaseRef.current.delete(purchaseKey);

      if (mountedRef.current) {
        setPendingPurchases((prev) => {
          const next = new Set(prev);

          next.delete(purchaseKey);

          return next;
        });
      }
    }
  };

  /*
   * ----------------------------
   * DERIVED ACTIVE BOOK DATA
   * ----------------------------
   */

  const completed =
    activeBook && activeProgress
      ? activeProgress.chapter >= activeBook.totalChapters
      : false;

  const nextChapter = activeProgress ? getNextChapter(activeProgress) : null;

  const nextChapterAccessible =
    activeBook && nextChapter !== null && !completed
      ? canAccessChapter(activeBook, nextChapter)
      : false;

  const nextChapterLocked =
    activeBook && nextChapter !== null && !completed && !nextChapterAccessible;

  const currentPurchaseKey =
    activeBook && nextChapter !== null
      ? getPurchaseKey(activeBook.id, nextChapter)
      : null;

  const purchasePending =
    currentPurchaseKey !== null && pendingPurchases.has(currentPurchaseKey);

  const saveStatusText = (() => {
    switch (activeProgress?.saveStatus) {
      case "saving":
        return "Saving...";

      case "unsaved":
        return "Unsaved changes";

      case "error":
        return "Progress could not be saved";

      case "saved":
        return "Saved";

      default:
        return "";
    }
  })();

  return (
    <main>
      <h2>Reader</h2>

      <p>Credits: {credits}</p>

      <select
        value={activeBookId ?? ""}
        onChange={(e) => setActiveBookId(Number(e.target.value))}
      >
        {books.map((book) => (
          <option key={book.id} value={book.id}>
            {book.title}
          </option>
        ))}
      </select>

      {loadState.status === "loading" && <p>Loading progress...</p>}

      {loadState.error && <p>{loadState.error}</p>}

      {purchaseError && <p>{purchaseError}</p>}

      {activeBook && activeProgress && (
        <>
          <h3>{activeBook.title}</h3>

          <p>
            Chapter {activeProgress.chapter} / {activeBook.totalChapters}
          </p>

          <p>{saveStatusText}</p>

          <input
            type="range"
            min="0"
            max="100"
            value={activeProgress.scrollPercent}
            onChange={(e) => handleScrollChange(Number(e.target.value))}
          />

          <p>{activeProgress.scrollPercent}%</p>

          {completed ? (
            <p>Completed</p>
          ) : (
            <>
              {nextChapterAccessible && (
                <button onClick={goToNextChapter}>Next chapter</button>
              )}

              {nextChapterLocked && (
                <button
                  disabled={purchasePending}
                  onClick={() => buyChapter(activeBook.id, nextChapter)}
                >
                  {purchasePending
                    ? "Purchasing..."
                    : `Unlock chapter ${nextChapter} — ${activeBook.chapterPrice} credits`}
                </button>
              )}
            </>
          )}
        </>
      )}
    </main>
  );
}

// You inherit this component:

// import { useEffect, useState } from "react";

// export default function Reader({ initialBooks, initialCredits, userId }) {
//   const [books, setBooks] = useState(initialBooks);

//   const [credits, setCredits] = useState(initialCredits);

//   const [activeBookId, setActiveBookId] = useState(initialBooks[0]?.id ?? null);

//   const [currentChapter, setCurrentChapter] = useState(new Map());

//   const [scrollPercent, setScrollPercent] = useState(new Map());

//   const [loading, setLoading] = useState(false);

//   const [error, setError] = useState("");

//   const [purchasePending, setPurchasePending] = useState(false);

//   const activeBook = books.find((book) => book.id === activeBookId);

//   useEffect(() => {
//     const controller = new AbortController();
//     try {
//       setLoading(true);

//       const timeout = setTimeout(() => {
//         const chapter = currentChapter.get(activeBookId);
//         const result = saveReadingProgress({
//           userId,
//           bookId: activeBookId,
//           chapter,
//           scrollPercent,
//           version: 1,
//           signal: controller.signal,
//         });
//         setBooks((prevState) =>
//           prevState.map((book) =>
//             book.id === activeBookId
//               ? {
//                   ...book,
//                   chapter: result.chapter,
//                   scrollPercent: result.scrollPercent,
//                   version: result.version,
//                 }
//               : book,
//           ),
//         );

//         setCurrentChapter((prev) => {
//           const next = new Map(prev);
//           next.set(activeBookId, result.chapter);
//           return next;
//         });

//         setScrollPercent((prev) => {
//           const next = new Map(prev);
//           next.set(activeBookId, result.scrollPercent);
//           return next;
//         });
//       }, 750);

//       return () => clearTimeout(timeout);
//     } catch (e) {
//       if (e.name === "409") {
//         //trigger dependency to cal effect again and set new values
//       }
//       if (e.name === "429") {
//         const timer = setTimeout(
//           () => {
//             //trigger dependency to cal effect after  headers.retryAfterMs will end
//           },
//           // headers.retryAfterMs,
//         );

//         if (e.name === "500") {
//           setError("The server currently unavailable. Please try again later");
//         }
//         return () => {
//           clearTimeout(timer);
//         };
//       }
//     } finally {
//       if (!controller.signal.aborted) {
//         setLoading(false);
//       }
//     }
//   }, [userId, activeBookId, currentChapter, scrollPercent]);

//   useEffect(() => {
//     const controller = new AbortController();

//     setLoading(true);
//     try {
//       setLoading(true);
//       const progress = getBookProgress({
//         userId,
//         bookId: activeBookId,
//         signal: controller.signal,
//       });
//       setCurrentChapter((prev) => {
//         const next = new Map(prev);
//         next.set(activeBookId, progress.chapter);
//         return next;
//       });
//       setScrollPercent((prev) => {
//         const next = new Map(prev);
//         next.set(activeBookId, progress.scrollPercent);
//         return next;
//       });
//     } catch (e) {
//       if (e.name === "AbortedError") return;
//       setError("could not get book progress");
//     } finally {
//       if (!controller.signal.aborted) setLoading(false);
//     }
//   }, [userId, activeBookId]);

//   const buyNextChapter = async () => {
//     setPurchasePending(true);

//     const response = await purchaseChapter({
//       userId,
//       bookId: activeBookId,
//       chapter: currentChapter + 1,
//     });

//     setCredits(response.credits);

//     setBooks(
//       books.map((book) =>
//         book.id === activeBookId
//           ? {
//               ...book,
//               purchasedChapters: [
//                 ...book.purchasedChapters,
//                 currentChapter + 1,
//               ],
//             }
//           : book,
//       ),
//     );

//     setPurchasePending(false);
//   };

//   return (
//     <main>
//       <h2>Reader</h2>

//       <p>Credits: {credits}</p>

//       <select
//         value={activeBookId}
//         onChange={(e) => setActiveBookId(Number(e.target.value))}
//       >
//         {books.map((book) => (
//           <option key={book.id} value={book.id}>
//             {book.title}
//           </option>
//         ))}
//       </select>

//       {loading && <p>Loading...</p>}
//       {error && <p>{error}</p>}

//       {activeBook && (
//         <>
//           <h3>{activeBook.title}</h3>

//           <p>Chapter {currentChapter}</p>

//           <input
//             type="range"
//             min="0"
//             max="100"
//             value={scrollPercent}
//             onChange={(e) => setScrollPercent(Number(e.target.value))}
//           />

//           <button onClick={() => setCurrentChapter(currentChapter + 1)}>
//             Next chapter
//           </button>

//           <button disabled={purchasePending} onClick={buyNextChapter}>
//             Buy next chapter
//           </button>
//         </>
//       )}
//     </main>
//   );
// }

// Backend contracts
// Load saved reading position
async function getBookProgress({ userId, bookId, signal }) {
  // GET /users/:userId/books/:bookId/progress

  return {
    chapter: 4,
    scrollPercent: 63,
    version: 18,
  };
}

// Requests can take:
// 50ms – 3 seconds

// Save reading progress
async function saveReadingProgress({
  userId,
  bookId,
  chapter,
  scrollPercent,
  version,
  signal,
}) {
  // PATCH ...

  return {
    chapter,
    scrollPercent,
    version: version + 1,
  };
}

// The server can return:
// 200 success

// 409 conflict
// another device saved a newer progress version

// 429 Too Many Requests
// with retryAfterMs

// 500 temporary server failure

// Purchase chapter
async function purchaseChapter({ userId, bookId, chapter, idempotencyKey }) {
  return {
    purchaseId: "p_123",
    credits: 17,
    chapter,
  };
}

// The server charges credits.
// Calling it twice without protection could theoretically charge twice.
// The backend accepts:
// idempotencyKey

// and guarantees that requests with the same key represent the same purchase.
// Book shape
// {
//   id: 101,
//   title: "Moonbound",
//   totalChapters: 20,
//   freePreviewChapters: 3,
//   chapterPrice: 8,
//   purchasedChapters: [4, 5]
// }

// Requirements
// 1. Switching books must never show stale progress
// Scenario:
// open Moonbound
// → request A starts

// immediately switch to Dark Orbit
// → request B starts

// B returns first
// → chapter 7

// A returns later

// Moonbound's late response must not overwrite Dark Orbit's UI.
// Also handle component unmount safely.
// 2. Reading progress must not hit the backend continuously
// This:
// scrollPercent

// can change:
// 31
// 32
// 33
// 34
// 35
// ...

// multiple times per second.
// Do not send one HTTP request for every change.
// But progress should eventually be persisted shortly after the reader stops changing it.
// Requirements:
// wait roughly 750ms after latest change

// then save latest:
// book
// chapter
// scrollPercent

// 3. Switching books must not lose unsaved progress
// Example:
// Moonbound chapter 5, 82%
// ↓
// user switches immediately to Dark Orbit

// The latest Moonbound position must still be handled appropriately.
// Think carefully about effect cleanup.
// 4. Old save responses must not overwrite newer state
// Example:
// save A:
// chapter 4, 50%

// save B:
// chapter 4, 80%

// B returns first
// A returns later

// The UI/server-version state must not regress because A finished last.
// 5. Version conflicts
// Suppose local version:
// 18

// but server says:
// 409 conflict
// server version = 20

// Assume the 409 response contains:
// {
//   latest: {
//     chapter: 5,
//     scrollPercent: 40,
//     version: 20,
//   }
// }

// For this exercise:
// server wins

// Update local progress to the server's latest value.
// Do not blindly retry stale version 18.
// 6. 429 handling
// The save endpoint may say:
// {
//   status: 429,
//   retryAfterMs: 1200
// }

// Do not immediately hammer it again.
// The retry should respect:
// retryAfterMs

// and must not allow an older progress update to overwrite a newer pending one.
// 7. Temporary 500 errors
// For progress saves only:
// 500

// may be retried.
// Maximum:
// 3 attempts

// Do not retry instantly:
// request
// request
// request

// Introduce increasing delay.
// You decide the delay strategy.
// If all attempts fail:
// "Progress could not be saved"

// But the reader must still be able to continue reading.
// 8. Purchase must be protected from double execution
// Users may:
// double click
// tap twice
// network retry

// You must prevent accidental duplicate charges.
// The same logical purchase attempt must use the same:
// idempotencyKey

// Do not use something unstable that changes every render.
// 9. Don't globally block unrelated interactions
// While purchasing chapter 6 of Moonbound:
// user should still be able to:
// scroll
// read
// switch books

// Do not turn the entire reader into one giant:
// loading = true

// state.
// Model pending state at the appropriate granularity.
// 10. Chapter access
// The next chapter is accessible if:
// nextChapter <= freePreviewChapters

// OR

// purchasedChapters contains nextChapter

// Otherwise show:
// Unlock chapter 6 — 8 credits

// Do not allow:
// currentChapter > totalChapters

// 11. Purchased chapters
// You currently receive:
// purchasedChapters: [4, 5]

// but you will repeatedly ask:
// Does this book own chapter X?

// You're allowed to redesign the client-side representation.
// Choose the structure based on the operation you need.
// 12. Book lookup
// You'll repeatedly need:
// bookId → book

// Again, choose the appropriate representation.
// Don't use a structure merely because we've practiced it before.
// 13. DRY challenge
// You will likely need the same concept in multiple places:
// "What is the next chapter?"
// "Is it accessible?"

// Don't duplicate complicated business conditions throughout JSX and handlers.
// But don't create a giant abstraction framework either.
// Find the smallest reusable business helpers.
// 14. KISS challenge
// There are multiple ways to solve all of this.
// Do not introduce:
// Redux
// XState
// React Query
// external libraries
// Web Worker

// for this exercise.
// Use built-in React/JS.
// Your architecture should remain understandable to another developer opening the file.
// 15. Derived status
// Display:
// Saved
// Saving...
// Unsaved changes
// Progress could not be saved

// based on actual state.
// Do not maintain four unrelated booleans if one clearer representation can model the states better.
// This is deliberately testing state architecture.
// 16. Selected/current book progress
// Different books have different saved progress.
// If you switch:
// Moonbound → Dark Orbit → Moonbound

// think about whether one pair of:
// currentChapter
// scrollPercent

// is still the best data architecture.
// You're allowed to redesign it.
// 17. No stale closures
// Pay close attention to asynchronous code reading values like:
// currentChapter
// scrollPercent
// activeBookId
// version

// after delays.
// The value you captured when the async operation started may no longer be the current one.
// You need to reason about that explicitly.
// 18. Error separation
// These are different failures:
// could not load progress
// could not save progress
// purchase failed
// not enough credits

// Don't collapse every error into:
// const [error, setError]

// unless you can justify why.
// 19. Cleanup
// When:
// book changes
// component unmounts
// new save supersedes old save
// retry is waiting

// nothing should keep performing irrelevant work indefinitely.
// 20. Explain your architecture
// Along with your component, give me a short explanation of:
// 1. What is source state?
// 2. What is derived?
// 3. Where did you use Map / Set, if anywhere?
// 4. Which side effects exist?
// 5. How do you prevent races?
// 6. How do you prevent duplicate purchases?
// 7. How do you handle 409 / 429 / 500 differently?
// 8. What did you deliberately NOT optimize?

// One clarification I'll give you upfront
// For this exercise:
// purchaseChapter()

// is not optimistic.
// Do:
// request succeeds
// ↓
// update credits + ownership

// If it fails:
// nothing is charged locally
// nothing becomes unlocked

// Progress saving, on the other hand, should allow the reading UI to continue independently of the network.
// Your task
// You are allowed to significantly restructure the component.
// You do not need to preserve:
// currentChapter
// scrollPercent
// purchasePending
// loading
// error

// in their current form if you believe the state architecture is wrong.
