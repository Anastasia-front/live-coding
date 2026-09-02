export type Order = { id: number; status: string };
export type GroupAndCountSortedResult = [string, number][];

export function groupAndCountSorted(
  orders: Order[],
): GroupAndCountSortedResult | null {
  const counts: Record<string, number> = orders.reduce(
    (acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return Object.entries(counts).sort((a, b) => b[1] - a[1]);
}

// Related example:
// const orders: Order[] = [
//   { id: 1, status: "pending" },
//   { id: 2, status: "shipped" },
//   { id: 3, status: "pending" },
//   { id: 4, status: "delivered" },
//   { id: 5, status: "shipped" },
//   { id: 6, status: "pending" },
// ];
//
// console.log(groupAndCountSorted(orders));
// Output: [["pending", 3], ["shipped", 2], ["delivered", 1]]
