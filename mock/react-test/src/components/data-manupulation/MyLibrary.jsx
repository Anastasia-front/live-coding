// import { useEffect, useState } from "react";

// export default function MyLibrary({
//   initialTitles,
//   initialCoins,
//   isSubscriber,
// }) {
//   const [titles, setTitles] = useState(initialTitles);
//   const [visibleTitles, setVisibleTitles] = useState(initialTitles);
//   const [typeFilter, setTypeFilter] = useState("all");
//   const [coins, setCoins] = useState(initialCoins);

//   useEffect(() => {
//     setVisibleTitles(
//       titles.filter((title) => title.type === typeFilter),
//     );
//   }, [typeFilter]);

//   const continueTitle = (id) => {
//     const title = titles.find((title) => title.id === id);

//     title.currentEpisode++;

//     setTitles(titles);
//   };

//   return (
//     <div>
//       <h2>My Library</h2>

//       <p>Coins: {coins}</p>
//       <p>Continue: 0</p>
//       <p>Completed: 0</p>

//       <select
//         value={typeFilter}
//         onChange={(e) => setTypeFilter(e.target.value)}
//       >
//         <option value="all">All</option>
//         <option value="book">Books</option>
//         <option value="video">Video</option>
//       </select>

//       {visibleTitles.map((title) => (
//         <div key={title.name}>
//           <h3>{title.name}</h3>

//           <p>{title.genre}</p>

//           <p>
//             Episode {title.currentEpisode} / {title.totalEpisodes}
//           </p>

//           <button onClick={() => continueTitle(title.id)}>
//             Continue
//           </button>
//         </div>
//       ))}
//     </div>
//   );
// }

// Your task

// The "All / Books / Video" filter must work.

// "all" must show every title.

// Do not modify titles just because the user changes the filter.

// Do not keep a second synchronized copy of the filtered titles in state.

// Progress

// A title is completed when:

// currentEpisode >= totalEpisodes

// Otherwise it is in "Continue".

// Display:

// Continue: 3
// Completed: 1

// These values must always derive from the current titles.

// Filtering must not affect these global counters.

// Progress percentage

// For every title display:

// Progress: 20%

// Calculate:

// currentEpisode / totalEpisodes × 100

// Round to the nearest whole number.

// For a completed title:

// Progress: 100%

// Never show more than 100%.

// Continue behavior

// Clicking Continue normally advances:

// currentEpisode

// by 1.

// The update must be immutable.

// But never allow:

// currentEpisode > totalEpisodes

// If a title is already completed, do not show the Continue button.

// Instead display:

// Completed
// Locked episodes

// This is where the task becomes more product-specific.

// Galatea supports chapter purchasing as well as subscription access, and IronBlood similarly advertises either subscription access or individual episode unlocking with coins.

// If:

// title.nextEpisodeLocked === true

// and:

// isSubscriber === false

// the user cannot immediately continue.

// Instead show:

// Unlock for 15 coins

// using that title's unlockCost.

// Clicking it should:

// Check whether the user has enough coins.
// Subtract unlockCost from coins.
// Set that title's:
// nextEpisodeLocked: false
// Do not advance the episode yet.

// Example:

// Coins before: 20
// Dark Orbit unlock cost: 15

// Coins after: 5

// After unlocking, the normal:

// Continue

// button should appear.

// Not enough coins

// If the user cannot afford an unlock, clicking the button should not modify anything.

// Add one piece of UI state:

// error

// and display:

// Not enough coins

// Clear the error after any successful unlock.

// This is actual UI state, so storing it with useState is appropriate.

// Subscriber behavior

// If:

// isSubscriber === true

// ignore:

// nextEpisodeLocked

// A subscriber should always be allowed to continue without spending coins.

// Galatea currently advertises unlimited story/audiobook access under its subscription, while IronBlood describes unlimited access under subscription versus individual episode coin unlocks.

// Do not modify the title's lock field merely because the user is subscribed.

// Derived summary

// Add:

// Average progress: 59%

// Calculate average percentage across all titles, not only currently filtered titles.

// Do not put this value into state.

// Platform filter

// Now add another select:

// All platforms
// Galatea
// CandyJar
// IronBlood

// The type and platform filters must work together.

// Example:

// type = video
// platform = IronBlood

// shows only IronBlood videos.

// Again, filtering must not modify the source titles.

// Empty state

// If the combination of filters produces no titles:

// Nothing found
// Fix the existing problems

// The existing code deliberately contains these problems:

// title.currentEpisode++;
// setTitles(titles);

// and:

// key={title.name}

// and unnecessary synchronized state:

// visibleTitles

// Fix them.

// Constraints

// Your actual state should contain only things that can independently change:

// titles
// coins
// typeFilter
// platformFilter
// error

// These should not be state:

// visibleTitles
// continueCount
// completedCount
// averageProgress
// progress percentages

// Do not use useEffect.

// Do not mutate props or state.

// No external libraries.

import { useMemo, useState } from "react";

export const initialTitles = [
  {
    id: 1,
    name: "The Alpha's Secret",
    platform: "Galatea",
    type: "book",
    genre: "Romance",
    currentEpisode: 4,
    totalEpisodes: 20,
    nextEpisodeLocked: false,
    unlockCost: 10,
  },
  {
    id: 2,
    name: "Dark Orbit",
    platform: "IronBlood",
    type: "video",
    genre: "Sci-Fi",
    currentEpisode: 2,
    totalEpisodes: 8,
    nextEpisodeLocked: true,
    unlockCost: 15,
  },
  {
    id: 3,
    name: "Billionaire Contract",
    platform: "CandyJar",
    type: "video",
    genre: "Romance",
    currentEpisode: 6,
    totalEpisodes: 6,
    nextEpisodeLocked: false,
    unlockCost: 10,
  },
  {
    id: 4,
    name: "Moonbound",
    platform: "Galatea",
    type: "book",
    genre: "Fantasy",
    currentEpisode: 9,
    totalEpisodes: 15,
    nextEpisodeLocked: true,
    unlockCost: 10,
  },
];

export default function MyLibrary({
  initialTitles,
  initialCoins,
  isSubscriber,
}) {
  const [titles, setTitles] = useState(initialTitles);
  const [typeFilter, setTypeFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [coins, setCoins] = useState(initialCoins);
  const [error, setError] = useState(false);

  const visibleTitles = useMemo(() => {
    return titles.filter((title) => {
      const matchesType = typeFilter === "all" || title.type === typeFilter;

      const matchesPlatform =
        platformFilter === "all" ||
        title.platform.toLowerCase() === platformFilter.toLowerCase();

      return matchesType && matchesPlatform;
    });
  }, [typeFilter, titles, platformFilter]);

  const continueTitle = (id) => {
    setTitles((prevState) =>
      prevState.map((title) =>
        title.id === id && title.currentEpisode < title.totalEpisodes
          ? { ...title, currentEpisode: title.currentEpisode + 1 }
          : title,
      ),
    );
  };

  const completed = titles.reduce((acc, title) => {
    if (title.currentEpisode === title.totalEpisodes) acc++;
    return acc;
  }, 0);

  const handleUnlock = (id) => {
    const title = titles.find((title) => title.id === id);

    if (!title) return;

    if (title.unlockCost > coins) {
      setError(true);
      return;
    }

    setCoins((prevCoins) => prevCoins - title.unlockCost);

    setTitles((prevTitles) =>
      prevTitles.map((item) =>
        item.id === id ? { ...item, nextEpisodeLocked: false } : item,
      ),
    );

    setError(false);
  };

  const totalProgress = titles.reduce((acc, title) => {
    acc += Math.round((title.currentEpisode / title.totalEpisodes) * 100);
    return acc;
  }, 0);
  const averageProgress =
    titles.length > 0 ? Math.round(totalProgress / titles.length) : 0;

  return (
    <div>
      <h2>My Library</h2>

      <p>Coins: {coins}</p>
      <p>Continue: {titles.length - completed}</p>
      <p>Completed: {completed}</p>
      <p>Average progress: {averageProgress}%</p>

      {error && <p>Not enough coins</p>}

      <select
        value={typeFilter}
        onChange={(e) => setTypeFilter(e.target.value)}
      >
        <option value="all">All</option>
        <option value="book">Books</option>
        <option value="video">Video</option>
      </select>

      <select
        value={platformFilter}
        onChange={(e) => setPlatformFilter(e.target.value)}
      >
        <option value="all">All platforms</option>
        <option value="Galatea">Galatea</option>
        <option value="CandyJar">CandyJar</option>
        <option value="Ironblood">Ironblood</option>
      </select>

      {visibleTitles.length === 0 ? (
        <p>Nothing found</p>
      ) : (
        visibleTitles.map((title) => {
          const isCompleted = title.currentEpisode >= title.totalEpisodes;

          const progress = Math.min(
            100,
            Math.round((title.currentEpisode / title.totalEpisodes) * 100),
          );

          const requiresUnlock = title.nextEpisodeLocked && !isSubscriber;

          return (
            <div key={title.id}>
              <h3>{title.name}</h3>

              <p>{title.genre}</p>

              <p>
                Episode {title.currentEpisode} / {title.totalEpisodes}
              </p>

              <p>Progress: {progress}%</p>

              {isCompleted ? (
                <p>Completed</p>
              ) : requiresUnlock ? (
                <button onClick={() => handleUnlock(title.id)}>
                  Unlock for {title.unlockCost} coins
                </button>
              ) : (
                <button onClick={() => continueTitle(title.id)}>
                  Continue
                </button>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
