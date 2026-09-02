export type User = { id: number; name: string; totalSpent: number };

export function topSpenders(users: User[], topK: number): User[] {
  if (topK <= 0) return [];
  return [...users].sort((a, b) => b.totalSpent - a.totalSpent).slice(0, topK);
}

// Related example:
// const users: User[] = [
//   { id: 1, name: "Alice", totalSpent: 250 },
//   { id: 2, name: "Bob", totalSpent: 480 },
//   { id: 3, name: "Carol", totalSpent: 120 },
//   { id: 4, name: "Dave", totalSpent: 600 },
//   { id: 5, name: "Eve", totalSpent: 90 },
// ];
//
// console.log(topSpenders(users, 2));
// Output: [{ id: 4, name: "Dave", totalSpent: 600 }, { id: 2, name: "Bob", totalSpent: 480 }]
