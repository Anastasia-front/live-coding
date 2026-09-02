export type Order = { id: number; status: string };
export type GroupAndCountResult = Record<string, number>;

export function groupAndCount(orders: Order[]): GroupAndCountResult | null {
  return orders.reduce((acc: GroupAndCountResult, order: Order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {});
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
// console.log(groupAndCount(orders));
// Output: { pending: 3, shipped: 2, delivered: 1 }
