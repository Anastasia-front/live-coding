import { useMemo, useState } from "react";

export const users = [
  {
    id: 1,
    name: "Anna Smith",
    email: "anna@example.com",
    score: 82,
    active: true,
  },
  {
    id: 2,
    name: "John Miller",
    email: "john@test.com",
    score: 65,
    active: false,
  },
  {
    id: 3,
    name: "Mike Brown",
    email: "mike@example.com",
    score: 91,
    active: true,
  },
  {
    id: 4,
    name: "Kate Johnson",
    email: "kate@company.com",
    score: 74,
    active: true,
  },
  {
    id: 5,
    name: "John Smith",
    email: "john.smith@company.com",
    score: 88,
    active: true,
  },
];

// export default function UserDashboard({ users }) {
//   const [visibleUsers, setVisibleUsers] = useState(users);
//   const [query, setQuery] = useState("");
//   const [sortBy, setSortBy] = useState("name");

//   useEffect(() => {
//     setVisibleUsers(users);
//   }, [users]);

//   const handleSort = () => {
//     users.sort((a, b) => b.score - a.score);
//     setVisibleUsers(users);
//   };

//   return (
//     <div>
//       <h2>Users</h2>

//       <input
//         value={query}
//         placeholder="Search users..."
//         onChange={(e) => setQuery(e.target.value)}
//       />

//       <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
//         <option value="name">Name</option>
//         <option value="score">Score</option>
//       </select>

//       <button onClick={handleSort}>Sort by highest score</button>

//       <p>Total users: {users.length}</p>

//       <ul>
//         {visibleUsers.map((user) => (
//           <li key={user.name}>
//             {user.name} — {user.email} — {user.score}
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }

// Interview task

// Product asks you to modify this component.

// The search input should actually work. Search by both name and email; it must be case-insensitive and support partial matches.

// Add a checkbox:

// ☑ Active users only

// When enabled, inactive users must disappear.

// The existing select must work:

// Name
// Score

// When "name" is selected, sort alphabetically by name.

// When "score" is selected, sort highest score first.

// Search, active filtering, and sorting must work together. For example:

// query = "john"
// activeOnly = true
// sortBy = "score"

// should produce only active Johns, sorted by score.

// Change:

// <p>Total users: {users.length}</p>

// so it displays:

// Showing: 3 / 5
// Average score: 85.67

// Average score must be calculated from the currently visible users, not all users.

// If no users match, render:

// No users found

// instead of an empty <ul>.

// There are also problems in the existing implementation that you should fix as part of your changes.

// Constraints

// Do not change the parent data.

// Do not mutate the users prop.

// Do not add external libraries.

// Keep this as one component for now; don't split it into additional components.

// You can create helper functions if you think that improves the implementation.

export default function UserDashboard({ users }) {
  const [query, setQuery] = useState("");
  const [checkboxActive, setCheckboxActive] = useState(false);
  const [sortBy, setSortBy] = useState("name");

  const visibleUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return users
      .filter(
        (user) =>
          user.name.toLowerCase().includes(normalizedQuery) ||
          user.email.toLowerCase().includes(normalizedQuery),
      )
      .filter((user) => !checkboxActive || user.active)
      .toSorted((a, b) =>
        sortBy === "name" ? a.name.localeCompare(b.name) : b.score - a.score,
      );
  }, [query, sortBy, checkboxActive, users]);

  const totalScore = visibleUsers.reduce((acc, user) => {
    acc += user.score;
    return acc;
  }, 0);

  return (
    <div>
      <h2>Users</h2>

      <input
        value={query}
        type="text"
        placeholder="Search users..."
        onChange={(e) => setQuery(e.target.value)}
      />

      <input
        checked={checkboxActive}
        type="checkbox"
        onChange={(e) => setCheckboxActive(e.target.checked)}
      />

      <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
        <option value="name">Name</option>
        <option value="score">Score</option>
      </select>

      <p>
        Showing: {visibleUsers.length} / {users.length}
        <br />
        Average score:{" "}
        {visibleUsers.length > 0
          ? (totalScore / visibleUsers.length).toFixed(2)
          : 0}
      </p>
      {visibleUsers.length === 0 ? (
        <p>No users found</p>
      ) : (
        <ul>
          {visibleUsers.map((user) => (
            <li key={user.id}>
              {user.name} — {user.email} — {user.score}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}


