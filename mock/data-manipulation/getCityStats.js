const users = [
  { id: 1, name: "Anna", city: "Paris" },
  { id: 2, name: "John", city: "Berlin" },
  { id: 3, name: "Mike", city: "Paris" },
  { id: 4, name: "Kate", city: "Madrid" },
];

const payments = [
  { id: 101, userId: 1, amount: 100, status: "paid" },
  { id: 102, userId: 2, amount: 250, status: "paid" },
  { id: 103, userId: 1, amount: 150, status: "paid" },
  { id: 104, userId: 3, amount: 300, status: "failed" },
  { id: 105, userId: 3, amount: 200, status: "paid" },
  { id: 106, userId: 4, amount: 120, status: "paid" },
  { id: 107, userId: 2, amount: 50, status: "paid" },
];

function getCityStats(users, payments) {
  const userById = {};

  for (const user of users) {
    userById[user.id] = user;
  }

  const summary = {};
  for (const payment of payments) {
    const { userId, amount, status } = payment;
    if (status !== "paid") continue;
    const user = userById[userId];
    if (!user) continue;
    const { city } = user;

    if (!summary[city]) {
      summary[city] = { city, totalAmount: 0, userCount: new Set() };
    }
    summary[city].totalAmount += amount;
    summary[city].userCount.add(userId);
  }

  return Object.values(summary)
    .map((item) => ({
      city: item.city,
      totalAmount: item.totalAmount,
      userCount: item.userCount.size,
    }))
    .sort((a, b) => b.totalAmount - a.totalAmount);
}

console.log(getCityStats(users, payments));
// Requirements:

// Consider only payments with status === "paid".
// Group by user city.
// For each city return:
// city
// totalAmount
// userCount — number of unique users from that city with at least one paid payment
// Sort by totalAmount descending.
// Try to make it O(users + payments), not nested loops.

// Expected result:

// [
//   { city: "Berlin", totalAmount: 300, userCount: 1 },
//   { city: "Paris", totalAmount: 450, userCount: 2 },
//   { city: "Madrid", totalAmount: 120, userCount: 1 },
// ]
