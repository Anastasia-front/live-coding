const orders = [
  {
    id: 101,
    status: "completed",
    amount: 120,
    discount: 20,
    shipping: 10,
  },
  {
    id: 102,
    status: "cancelled",
    amount: 300,
    discount: 0,
    shipping: 15,
  },
  {
    id: 103,
    status: "completed",
    amount: 200,
    discount: 50,
    shipping: 0,
  },
  {
    id: 104,
    status: "completed",
    amount: 80,
    discount: 0,
    shipping: 5,
  },
  {
    id: 105,
    status: "refunded",
    amount: 150,
    discount: 10,
    shipping: 10,
  },
];

function calculateOrderSummary(orders) {
  const summary = orders.reduce(
    (acc, order) => {
      const { status, amount, discount, shipping } = order;
      if (status !== "completed") return acc;

      acc.completedOrders++;
      acc.subtotal += amount;
      acc.totalDiscount += discount;
      acc.totalShipping += shipping;
      acc.finalRevenue += amount - discount + shipping;
      return acc;
    },
    {
      completedOrders: 0,
      subtotal: 0,
      totalDiscount: 0,
      totalShipping: 0,
      finalRevenue: 0,
      averageOrderValue: 0,
    },
  );

  if (summary.completedOrders > 0) {
    summary.averageOrderValue = Number(
      (summary.finalRevenue / summary.completedOrders).toFixed(2),
    );
  }

  return summary;
}

// Return:

// {
//   completedOrders: 3,
//   subtotal: 400,
//   totalDiscount: 70,
//   totalShipping: 15,
//   finalRevenue: 345,
//   averageOrderValue: 115
// }

// Rules:

// Consider only status === "completed".
// subtotal = sum of amount.
// totalDiscount = sum of discount.
// totalShipping = sum of shipping.
// finalRevenue for each order is:
// amount - discount + shipping
// averageOrderValue = finalRevenue / completedOrders.
// Round averageOrderValue to 2 decimals if needed.
// If there are no completed orders, return all numeric fields as 0.
// Do not mutate orders.
