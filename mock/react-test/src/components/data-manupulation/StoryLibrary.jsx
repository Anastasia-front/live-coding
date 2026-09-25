// import {
//   useCallback,
//   useEffect,
//   useMemo,
//   useRef,
//   useState,
//   useTransition,
// } from "react";

// export default function StoryLibrary({ initialStories, authors }) {
//   const [stories, setStories] = useState(initialStories);

//   const [query, setQuery] = useState("");
//   const [genre, setGenre] = useState("all");
//   const [completedOnly, setCompletedOnly] = useState(false);

//   const [visibleStories, setVisibleStories] = useState(initialStories);

//   const [stats, setStats] = useState({
//     visible: 0,
//     averageProgress: 0,
//   });

//   const searchRef = useRef(query);

//   const [isPending, startTransition] = useTransition();

//   useEffect(() => {
//     const normalizedQuery = searchRef.current.trim().toLowerCase();

//     setVisibleStories(
//       stories.filter((story) => {
//         const author = authors.find((author) => author.id === story.authorId);

//         const matchesSearch =
//           story.title.toLowerCase().includes(normalizedQuery) ||
//           author?.name.toLowerCase().includes(normalizedQuery);

//         const matchesGenre = genre === "all" || story.genre === genre;

//         const matchesCompleted = !completedOnly || story.progress === 100;

//         return matchesSearch && matchesGenre && matchesCompleted;
//       }),
//     );
//   }, [stories, genre, completedOnly]);

//   useMemo(() => {
//     const totalProgress = visibleStories.reduce(
//       (total, story) => total + story.progress,
//       0,
//     );

//     setStats({
//       visible: visibleStories.length,
//       averageProgress:
//         visibleStories.length > 0
//           ? Math.round(totalProgress / visibleStories.length)
//           : 0,
//     });
//   }, [visibleStories]);

//   const handleSearch = (e) => {
//     const value = e.target.value;

//     startTransition(() => {
//       setQuery(value);
//       searchRef.current = value;
//     });
//   };

//   const continueStory = useCallback((storyId) => {
//     const story = stories.find((story) => story.id === storyId);

//     story.progress += 10;

//     if (story.progress > 100) {
//       story.progress = 100;
//     }

//     setStories(stories);
//   }, []);

//   const resetProgress = useCallback((storyId) => {
//     setStories(
//       stories.map((story) =>
//         story.id === storyId
//           ? {
//               ...story,
//               progress: 0,
//             }
//           : story,
//       ),
//     );
//   }, []);

//   return (
//     <div>
//       <h2>My Library</h2>

//       <input
//         value={query}
//         placeholder="Search by story or author..."
//         onChange={handleSearch}
//       />

//       {isPending && <span>Updating...</span>}

//       <select value={genre} onChange={(e) => setGenre(e.target.value)}>
//         <option value="all">All genres</option>
//         <option value="Fantasy">Fantasy</option>
//         <option value="Romance">Romance</option>
//         <option value="Sci-Fi">Sci-Fi</option>
//       </select>

//       <label>
//         <input
//           type="checkbox"
//           checked={completedOnly}
//           onChange={(e) => setCompletedOnly(e.target.checked)}
//         />
//         Completed only
//       </label>

//       <p>Showing: {stats.visible}</p>
//       <p>Average progress: {stats.averageProgress}%</p>

//       {visibleStories.map((story) => {
//         const author = authors.find((author) => author.id === story.authorId);

//         return (
//           <article key={story.title}>
//             <h3>{story.title}</h3>

//             <p>By: {author?.name ?? "Unknown author"}</p>

//             <p>{story.genre}</p>

//             <p>Progress: {story.progress}%</p>

//             <button onClick={() => continueStory(story.id)}>Continue</button>

//             <button onClick={() => resetProgress(story.id)}>Reset</button>
//           </article>
//         );
//       })}
//     </div>
//   );
// }

// Product requirements
// Search must work by both story title and author name. It must be case-insensitive and partial.
// Search should update immediately while typing.
// Genre filtering, search, and "Completed only" must all work together.
// These statistics must come from the currently visible stories:
// Showing: X
// Average progress: X%

// Neither statistic should be stored independently if it can be calculated from other values.
// Continue
// Clicking Continue increases:
// progress

// by 10.
// Never exceed:
// 100

// Do not mutate state.
// If a story is already at 100, hide the Continue button and display:
// Completed

// Reset
// Reset sets only that story's progress back to:
// 0

// The UI and all derived statistics must immediately reflect the update.
// Performance requirement
// In production there may be:
// 10,000 stories
// 2,000 authors

// This pattern should not repeatedly happen for every story:
// authors.find(
//   (author) => author.id === story.authorId,
// );

// Build an efficient author lookup from authors and reuse it.
// The lookup itself is derived from authors; decide whether it needs state, memoization, or neither.
// Search performance
// Assume rendering the story list becomes expensive with thousands of results.
// The controlled input must remain responsive while typing.
// You may use either:
// useTransition

// or:
// useDeferredValue

// if appropriate, but you must use it according to its actual purpose.
// Do not make the controlled input's state update non-urgent.
// Hook cleanup
// The current component deliberately misuses several hooks.
// Your job is to decide what should happen to each of these:
// useState
// useEffect
// useMemo
// useCallback
// useRef
// useTransition

// Some should remain.
// Some may need different usage.
// Some may disappear entirely.
// You are allowed to introduce:
// useDeferredValue

// if you think it fits better.
// Do not keep a hook merely because the original component used it.
// Other requirements
// Use a safe React key.
// If filters produce no results:
// No stories found

// Do not use external libraries.
// Do not split it into multiple components yet.

import { useDeferredValue, useMemo, useState } from "react";

export const authors = [
  { id: 1, name: "Anna Reed" },
  { id: 2, name: "John Miller" },
  { id: 3, name: "Kate Stone" },
];

export const initialStories = [
  {
    id: 101,
    title: "Moonbound",
    authorId: 1,
    genre: "Fantasy",
    progress: 40,
  },
  {
    id: 102,
    title: "Dark Orbit",
    authorId: 2,
    genre: "Sci-Fi",
    progress: 70,
  },
  {
    id: 103,
    title: "Broken Hearts",
    authorId: 3,
    genre: "Romance",
    progress: 100,
  },
  {
    id: 104,
    title: "The Last Kingdom",
    authorId: 1,
    genre: "Fantasy",
    progress: 20,
  },
];

export default function StoryLibrary({ initialStories, authors }) {
  const [stories, setStories] = useState(initialStories);

  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [genre, setGenre] = useState("all");
  const [completedOnly, setCompletedOnly] = useState(false);

  const authorById = useMemo(() => {
    return new Map(authors.map((author) => [author.id, author]));
  }, [authors]);
  const visibleStories = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();

    return stories.filter((story) => {
      const author = authorById.get(story.authorId);

      const matchesSearch =
        story.title.toLowerCase().includes(normalizedQuery) ||
        author?.name.toLowerCase().includes(normalizedQuery);

      const matchesGenre = genre === "all" || story.genre === genre;

      const matchesCompleted = !completedOnly || story.progress === 100;

      return matchesSearch && matchesGenre && matchesCompleted;
    });
  }, [stories, deferredQuery, genre, completedOnly, authorById]);

  const stats = useMemo(() => {
    const totalProgress = visibleStories.reduce(
      (total, story) => total + story.progress,
      0,
    );

    return {
      visible: visibleStories.length,
      averageProgress:
        visibleStories.length > 0
          ? Math.round(totalProgress / visibleStories.length)
          : 0,
    };
  }, [visibleStories]);

  const continueStory = (storyId) => {
    setStories((prevState) =>
      prevState.map((story) =>
        story.id === storyId
          ? {
              ...story,
              progress: Math.min(100, story.progress + 10),
            }
          : story,
      ),
    );
  };

  const resetProgress = (storyId) => {
    setStories((prevState) =>
      prevState.map((story) =>
        story.id === storyId
          ? {
              ...story,
              progress: 0,
            }
          : story,
      ),
    );
  };

  const isUpdating = query !== deferredQuery;

  return (
    <div>
      <h2>My Library</h2>

      <input
        value={query}
        placeholder="Search by story or author..."
        onChange={(e) => setQuery(e.currentTarget.value)}
      />

      <select value={genre} onChange={(e) => setGenre(e.target.value)}>
        <option value="all">All genres</option>
        <option value="Fantasy">Fantasy</option>
        <option value="Romance">Romance</option>
        <option value="Sci-Fi">Sci-Fi</option>
      </select>

      <label>
        <input
          type="checkbox"
          checked={completedOnly}
          onChange={(e) => setCompletedOnly(e.target.checked)}
        />
        Completed only
      </label>

      <p>Showing: {stats.visible}</p>
      <p>Average progress: {stats.averageProgress}%</p>

      {isUpdating && <span>Updating...</span>}

      {visibleStories.length === 0 ? (
        <p>No stories found</p>
      ) : (
        visibleStories.map((story) => {
          const author = authorById.get(story.authorId);
          return (
            <article key={story.id}>
              <h3>{story.title}</h3>

              <p>By: {author?.name ?? "Unknown author"}</p>

              <p>{story.genre}</p>

              <p>Progress: {story.progress}%</p>

              <button onClick={() => continueStory(story.id)}>Continue</button>

              <button onClick={() => resetProgress(story.id)}>Reset</button>
            </article>
          );
        })
      )}
    </div>
  );
}
