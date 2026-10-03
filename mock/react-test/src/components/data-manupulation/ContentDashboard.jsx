// import { useEffect, useState } from "react";

// export default function ContentDashboard({ initialStories }) {
//   const [stories, setStories] = useState(initialStories);
//   const [visibleStories, setVisibleStories] = useState(initialStories);

//   const [platformFilter, setPlatformFilter] = useState("all");
//   const [query, setQuery] = useState("");
//   const [onlyAdapted, setOnlyAdapted] = useState(false);

//   useEffect(() => {
//     setVisibleStories(stories);
//   }, [stories]);

//   const toggleFeatured = (storyId) => {
//     const story = stories.find((story) => story.id === storyId);

//     story.featured = !story.featured;

//     setStories(stories);
//   };

//   const publishToPlatform = (storyId, platform) => {
//     const story = stories.find((story) => story.id === storyId);

//     story.platforms[platform].published = true;

//     setStories(stories);
//   };

//   return (
//     <div>
//       <h2>Content Dashboard</h2>

//       <input
//         value={query}
//         placeholder="Search stories..."
//         onChange={(e) => setQuery(e.target.value)}
//       />

//       <select
//         value={platformFilter}
//         onChange={(e) => setPlatformFilter(e.target.value)}
//       >
//         <option value="all">All platforms</option>
//         <option value="Inkitt">Inkitt</option>
//         <option value="Galatea">Galatea</option>
//         <option value="CandyJar">CandyJar</option>
//         <option value="IronBlood">IronBlood</option>
//       </select>

//       <label>
//         <input
//           type="checkbox"
//           checked={onlyAdapted}
//           onChange={(e) => setOnlyAdapted(e.target.checked)}
//         />
//         Adapted only
//       </label>

//       <p>Showing: 0</p>
//       <p>Published adaptations: 0</p>
//       <p>Average reader score: 0</p>

//       {visibleStories.map((story) => (
//         <div key={story.title}>
//           <h3>{story.title}</h3>
//           <p>{story.genre}</p>
//           <p>Reader score: {story.readerScore}</p>

//           <button onClick={() => toggleFeatured(story.id)}>
//             Toggle featured
//           </button>
//         </div>
//       ))}
//     </div>
//   );
// }

// Requirements
// 1. Search
// Search by:
// title
// author
// genre

// Requirements:
// - case-insensitive
// - partial matching
// - empty query shows everything
// 2. Platform filter
// If:
// platformFilter === "CandyJar"

// show only stories where:
// story.platforms.CandyJar.published === true

// Likewise for the other platforms.
// "all" shows all stories.
// 3. Adapted only
// For this task, a story counts as adapted if it is published somewhere besides Inkitt.
// So:
// Galatea.published ||
// CandyJar.published ||
// IronBlood.published

// When onlyAdapted is enabled, non-adapted Inkitt-only stories disappear.
// Search + platform filter + adapted filter must work together.
// Do not modify stories while filtering.
// 4. Derived dashboard statistics
// Based on currently visible stories, display:
// Showing: 3 / 5
// Average reader score: 4.77
// Featured: 2

// Round average score to 2 decimals.
// If nothing is visible:
// Average reader score: 0
// Featured: 0

// 5. Published adaptations
// This one is global, not based on filtering.
// Display:
// Published adaptations: X

// Count every published:
// Galatea
// CandyJar
// IronBlood

// adaptation.
// Do not count Inkitt publication.
// Example:
// Moonbound:
// Galatea = true
// CandyJar = false
// IronBlood = false

// // contributes 1

// The Arrangement:
// Galatea = true
// CandyJar = true

// // contributes 2

// This means you're counting adaptations, not stories.
// 6. Adaptation progress
// For each visible story display something like:
// Galatea: Published
// CandyJar: 70%
// IronBlood: Not started

// Rules:
// published === true
// → "Published"

// published === false && progress > 0
// → `${progress}%`

// published === false && progress === 0
// → "Not started"

// 7. Update adaptation progress
// For every unpublished platform with:
// progress > 0

// show:
// +10%

// Clicking it should immutably increase that platform's progress:
// 70 → 80
// 80 → 90
// 90 → 100

// Never exceed:
// 100

// This is a nested immutable state update.
// You must update something shaped like:
// story
//   → platforms
//       → CandyJar
//           → progress

// without mutating any existing object.
// 8. Publish button
// When an unpublished adaptation reaches:
// progress === 100

// show:
// Publish

// instead of +10%.
// Clicking it must immutably change:
// published: true

// Do not modify progress.
// 9. Platform isPlatformEligible rule
// Now add some business logic.
// IronBlood is focused specifically on Action, Sci-Fi, and Superhero content. App Store
// For this exercise, assume only these genres are eligible for IronBlood:
// ["Action", "Sci-Fi", "Superhero"]

// Therefore, for:
// Romance
// Fantasy

// do not display IronBlood progress or controls at all.
// Instead show:
// IronBlood: Not eligible

// Do not modify the underlying data because of this rule.
// This is derived business logic.
// 10. Featured status
// The existing:
// Toggle featured

// button should immutably toggle:
// featured

// Change its label dynamically:
// featured === false
// → Feature

// featured === true
// → Remove featured

// 11. Sort
// Add:
// <select>
//   <option value="score">Reader score</option>
//   <option value="title">Title</option>
//   <option value="progress">Adaptation progress</option>
// </select>

// Rules:
// score:
// highest readerScore first

// title:
// alphabetical A-Z

// progress:
// calculate average progress across eligible non-Inkitt platforms.
// For example, for a Sci-Fi story:
// Galatea: 50
// CandyJar: 0
// IronBlood: 100

// average = 50

// For a Romance story, exclude IronBlood because it is not eligible:
// : 100
// CandyJar: 100

// average = 100

// Sort highest average adaptation progress first.
// Do not store this average in state.
// 12. Empty state
// If no stories match:
// No stories found

// Important constraints
// Your source state should approximately be:
// stories
// query
// platformFilter
// onlyAdapted
// sortBy

// These should not be state:
// visibleStories
// averageScore
// featuredCount
// publishedAdaptations
// adaptationProgress
// isIronBloodEligible

// No useEffect.
// Do not mutate:
// stories
// story
// story.platforms
// story.platforms.CandyJar

// Use:
// key={story.id}

// not title.

import { useCallback, useMemo, useState } from "react";

export const initialStories = [
  {
    id: 1,
    title: "Moonbound",
    author: "Anna Reed",
    genre: "Fantasy",
    readerScore: 4.8,
    featured: true,
    platforms: {
      Inkitt: {
        published: true,
        progress: 100,
      },
      Galatea: {
        published: true,
        progress: 100,
      },
      CandyJar: {
        published: false,
        progress: 70,
      },
      IronBlood: {
        published: false,
        progress: 0,
      },
    },
  },

  {
    id: 2,
    title: "Dark Orbit",
    author: "John Miller",
    genre: "Sci-Fi",
    readerScore: 4.6,
    featured: false,
    platforms: {
      Inkitt: {
        published: true,
        progress: 100,
      },
      Galatea: {
        published: false,
        progress: 50,
      },
      CandyJar: {
        published: false,
        progress: 0,
      },
      IronBlood: {
        published: true,
        progress: 100,
      },
    },
  },

  {
    id: 3,
    title: "The Arrangement",
    author: "Kate Brown",
    genre: "Romance",
    readerScore: 4.9,
    featured: true,
    platforms: {
      Inkitt: {
        published: true,
        progress: 100,
      },
      Galatea: {
        published: true,
        progress: 100,
      },
      CandyJar: {
        published: true,
        progress: 100,
      },
      IronBlood: {
        published: false,
        progress: 0,
      },
    },
  },

  {
    id: 4,
    title: "Steel Guardian",
    author: "Mike Stone",
    genre: "Superhero",
    readerScore: 4.5,
    featured: false,
    platforms: {
      Inkitt: {
        published: true,
        progress: 100,
      },
      Galatea: {
        published: false,
        progress: 20,
      },
      CandyJar: {
        published: false,
        progress: 40,
      },
      IronBlood: {
        published: false,
        progress: 85,
      },
    },
  },

  {
    id: 5,
    title: "Broken Hearts",
    author: "Lisa White",
    genre: "Romance",
    readerScore: 4.3,
    featured: false,
    platforms: {
      Inkitt: {
        published: true,
        progress: 100,
      },
      Galatea: {
        published: false,
        progress: 75,
      },
      CandyJar: {
        published: false,
        progress: 60,
      },
      IronBlood: {
        published: false,
        progress: 0,
      },
    },
  },
];

export default function ContentDashboard({ initialStories }) {
  const [stories, setStories] = useState(initialStories);

  const [platformFilter, setPlatformFilter] = useState("all");
  const [sortType, setSortType] = useState(null);
  const [query, setQuery] = useState("");
  const [onlyAdapted, setOnlyAdapted] = useState(false);

  const isPlatformEligible = (key, genre) =>
    key === "IronBlood"
      ? ["Action", "Sci-Fi", "Superhero"].includes(genre)
      : key === "CandyJar"
        ? ["Drama", "Melodrama", "Fantasy"].includes(genre)
        : [
            "Action",
            "Sci-Fi",
            "Superhero",
            "Drama",
            "Melodrama",
            "Fantasy",
          ].includes(genre);

  const getAverageAdaptationProgress = useCallback((story) => {
    const eligiblePlatforms = Object.entries(story.platforms).filter(
      ([platform]) =>
        platform !== "Inkitt" && isPlatformEligible(platform, story.genre),
    );

    if (eligiblePlatforms.length === 0) return 0;

    const total = eligiblePlatforms.reduce(
      (sum, [, data]) => sum + data.progress,
      0,
    );

    return total / eligiblePlatforms.length;
  }, []);

  const visibleStories = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    if (normalizedQuery.length === 0) return stories;
    return stories
      .filter(({ title, author, genre, platforms }) => {
        const matchSearch =
          title.toLocaleLowerCase().includes(normalizedQuery) ||
          author.toLocaleLowerCase().includes(normalizedQuery) ||
          genre.toLocaleLowerCase().includes(normalizedQuery);

        const matchPlatform =
          platformFilter === "all" ||
          (platformFilter === platforms[platformFilter].published) === true;
        const matchesAdapted =
          !onlyAdapted ||
          Object.entries(platforms).some(
            ([platform, data]) => platform !== "Inkitt" && data.published,
          );
        return matchSearch && matchPlatform && matchesAdapted;
      })
      .sort((a, b) => {
        if (sortType === "score") return b.readerScore - a.readerScore;
        if (sortType === "title") return a.title.localeCompare(b.title);
        if (sortType === "progress")
          return (
            getAverageAdaptationProgress(b) - getAverageAdaptationProgress(a)
          );
        return stories;
      });
  }, [
    stories,
    query,
    platformFilter,
    onlyAdapted,
    sortType,
    getAverageAdaptationProgress,
  ]);

  const toggleFeatured = (storyId) => {
    setStories((prevState) =>
      prevState.map((story) =>
        story.id === storyId ? { ...story, featured: !story.featured } : story,
      ),
    );
  };

  const publishToPlatform = (storyId, platform) => {
    setStories((prevState) =>
      prevState.map((story) =>
        story.id === storyId
          ? {
              ...story,
              platforms: {
                ...story.platforms,
                [platform]: { ...story.platforms[platform], published: true },
              },
            }
          : story,
      ),
    );
  };

  const adaptedStories = stories.reduce((total, story) => {
    return (
      total +
      Object.entries(story.platforms).filter(
        ([platform, data]) => platform !== "Inkitt" && data.published,
      ).length
    );
  }, 0);

  const featuredStories = visibleStories.reduce((acc, { featured }) => {
    featured && acc++;
    return acc;
  }, 0);

  const totalReaderScore = visibleStories.reduce((acc, { readerScore }) => {
    acc += readerScore;
    return acc;
  }, 0);

  const handleProgress = (storyId, platform) => {
    setStories((prevState) =>
      prevState.map((story) =>
        story.id === storyId
          ? {
              ...story,
              platforms: {
                ...story.platforms,
                [platform]: {
                  ...story.platforms[platform],
                  progress:
                    story.progress + 10 > 100 ? 100 : story.progress + 10,
                },
              },
            }
          : story,
      ),
    );
  };

  return (
    <div>
      <h2>Content Dashboard</h2>

      <input
        value={query}
        placeholder="Search stories..."
        onChange={(e) => setQuery(e.target.value)}
      />

      <select
        value={platformFilter}
        onChange={(e) => setPlatformFilter(e.target.value)}
      >
        <option value="all">All platforms</option>
        <option value="Inkitt">Inkitt</option>
        <option value="Galatea">Galatea</option>
        <option value="CandyJar">CandyJar</option>
        <option value="IronBlood">IronBlood</option>
      </select>

      <select value={sortType} onChange={(e) => setSortType(e.target.value)}>
        <option value="score">Reader score</option>
        <option value="title">Title</option>
        <option value="progress">Adaptation progress</option>
      </select>

      <label>
        <input
          type="checkbox"
          checked={onlyAdapted}
          onChange={(e) => setOnlyAdapted(e.target.checked)}
        />
        Adapted only
      </label>

      <p>
        Showing: {visibleStories.length} / {stories.length}
      </p>
      <p>Published adaptations: {adaptedStories}</p>
      <p>Featured: {featuredStories}</p>
      <p>
        Average reader score:{" "}
        {visibleStories.length > 0
          ? (totalReaderScore / visibleStories.length).toFixed(2)
          : 0}
      </p>

      {visibleStories.length === 0 ? (
        <p>No stories found</p>
      ) : (
        visibleStories.map(
          ({ id, title, genre, platforms, readerScore, featured }) => (
            <div key={id}>
              <h3>{title}</h3>
              <p>{genre}</p>
              <p>Reader score: {readerScore}</p>

              {Object.entries(platforms).map(
                ([platform, { published, progress, genre }]) => {
                  if (isPlatformEligible(platform, genre)) {
                    return <p key={platform}>{platform}: Not eligible</p>;
                  }
                  return (
                    <div>
                      {published && <p>{platform}: Published</p>}
                      {!published && progress > 0 && (
                        <>
                          <p>
                            {platform}: {progress}%
                          </p>
                          {progress === 100 ? (
                            <button
                              onClick={() => publishToPlatform(id, platform)}
                            >
                              Publish
                            </button>
                          ) : (
                            <button
                              onClick={() => handleProgress(id, platform)}
                            >
                              10%
                            </button>
                          )}
                        </>
                      )}
                      {!published && progress === 0 && (
                        <p key={platform}>{platform}: Not started</p>
                      )}
                    </div>
                  );
                },
              )}

              <button onClick={() => toggleFeatured(id)}>
                {featured ? "Remove featured" : "Feature"}
              </button>
            </div>
          ),
        )
      )}
    </div>
  );
}
