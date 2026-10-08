const users = [
  { id: 1, name: "Anna Smith", email: "anna@example.com", role: "admin" },
  { id: 2, name: "John Miller", email: "john@test.com", role: "user" },
  { id: 3, name: "Mike Brown", email: "mike@example.com", role: "manager" },
  { id: 4, name: "Kate Johnson", email: "kate@company.com", role: "user" },
];

function searchUsers(users, query) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return [...users];

  const searchResult = [];
  for (const user of users) {
    const { name, email } = user;
    if (
      name.toLowerCase().includes(normalizedQuery) ||
      email.toLowerCase().includes(normalizedQuery)
    ) {
      searchResult.push(user);
    }
  }
  return searchResult;
}

// Requirements:

// search by both name and email
// search must be case-insensitive
// partial matches should work
// if query is empty or contains only spaces, return all users
// do not mutate the original array

// Examples:

// searchUsers(users, "anna");

// returns Anna.

// searchUsers(users, "EXAMPLE");

// returns Anna and Mike.

// searchUsers(users, "  ");

// returns all users.
