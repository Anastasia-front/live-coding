const users = [
  { id: 1, name: "Anna" },
  { id: 2, name: "John" },
  { id: 3, name: "Mike" },
  { id: 4, name: "Kate" },
];

const orderList: OrderType[] = [
  { id: 101, userId: 1, amount: 120, status: "completed" },
  { id: 102, userId: 2, amount: 80, status: "completed" },
  { id: 103, userId: 1, amount: 50, status: "cancelled" },
  { id: 104, userId: 3, amount: 200, status: "completed" },
  { id: 105, userId: 2, amount: 150, status: "completed" },
  { id: 106, userId: 1, amount: 100, status: "completed" },
];

type User = { id: number; name: string };
type OrderType = {
  id: number;
  amount: number;
  status: "completed" | "cancelled";
  userId: number;
};

type Result = { name: string; totalSpent: number; orderCount: number };
// Consider only "completed" orders.
// Return every user, including users with no orders.
// For each user return:
// name
// totalSpent
// orderCount
// Sort from highest totalSpent to lowest.

function getUserStats(users: User[], orders: OrderType[]) {
  const filteredList = orders.reduce(
    (acc, { userId, amount, status }) => {
      if (status !== "completed") return acc;

      if (!acc[userId]) acc[userId] = { totalSpent: 0, orderCount: 0 };
      acc[userId] = {
        totalSpent: acc[userId].totalSpent + amount,
        orderCount: acc[userId].orderCount + 1,
      };
      return acc;
    },
    {} as Record<number, { totalSpent: number; orderCount: number }>,
  );

  return users
    .map((user) => ({
      name: user.name,
      totalSpent: filteredList[user.id]?.totalSpent ?? 0,
      orderCount: filteredList[user.id]?.orderCount ?? 0,
    }))
    .sort((a, b) => b.totalSpent - a.totalSpent);
}
console.log(getUserStats(users, orderList));
// [
//   { name: "John", totalSpent: 230, orderCount: 2 },
//   { name: "Anna", totalSpent: 220, orderCount: 2 },
//   { name: "Mike", totalSpent: 200, orderCount: 1 },
//   { name: "Kate", totalSpent: 0, orderCount: 0 },
// ];
