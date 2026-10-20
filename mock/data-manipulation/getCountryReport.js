const customers = [
  { id: 1, name: "Anna", country: "France" },
  { id: 2, name: "John", country: "Germany" },
  { id: 3, name: "Mike", country: "France" },
  { id: 4, name: "Kate", country: "Spain" },
  { id: 5, name: "Sam", country: "Germany" },
];

const orders = [
  { id: 101, customerId: 1, amount: 120, status: "completed" },
  { id: 102, customerId: 1, amount: 80, status: "completed" },
  { id: 103, customerId: 2, amount: 300, status: "completed" },
  { id: 104, customerId: 2, amount: 50, status: "cancelled" },
  { id: 105, customerId: 3, amount: 200, status: "completed" },
  { id: 106, customerId: 3, amount: 100, status: "completed" },
  { id: 107, customerId: 4, amount: 150, status: "completed" },
  { id: 108, customerId: 5, amount: 100, status: "completed" },
  { id: 109, customerId: 5, amount: 250, status: "completed" },
];

function getCountryReport(customers, orders) {
  const customerById = {};

  for (const customer of customers) {
    customerById[customer.id] = customer;
  }
  const summary = {};
  for (const order of orders) {
    const { customerId, amount, status } = order;
    if (status !== "completed") continue;

    const customer = customerById[customerId];
    if (!customer) continue;
    const { name, country } = customer;

    if (!summary[country]) {
      summary[country] = {
        country,
        totalRevenue: 0,
        orderCount: 0,
        uniqueCustomers: new Set(),
        topCustomers: {},
      };
    }

    summary[country].totalRevenue += amount;
    summary[country].orderCount++;
    summary[country].uniqueCustomers.add(customerId);
    if (!summary[country].topCustomers[name]) {
      summary[country].topCustomers[name] = 0;
    }
    console.log(summary[country].topCustomers?.[name]);
    summary[country].topCustomers[name] += amount;
  }

  return Object.values(summary)
    .map((item) => ({
      country: item.country,
      totalRevenue: item.totalRevenue,
      orderCount: item.orderCount,
      averageOrder: Number((item.totalRevenue / item.orderCount).toFixed(2)),
      uniqueCustomers: item.uniqueCustomers.size,
      topCustomer: Object.keys(item.topCustomers).find(
        (key) =>
          item.topCustomers[key] ===
          Math.max(...Object.values(item.topCustomers)),
      ),
    }))
    .sort((a, b) => b.totalRevenue - a.totalRevenue);
}

console.log(getCountryReport(customers, orders));

// Requirements:

// Consider only orders with:
// status === "completed"
// Group results by customer country.
// Return for each country:
// {
//   country: "France",
//   totalRevenue: 500,
//   orderCount: 4,
//   averageOrder: 125,
//   uniqueCustomers: 2,
//   topCustomer: "Mike"
// }
// averageOrder =
// totalRevenue / orderCount

// Round it to 2 decimal places if needed.

// uniqueCustomers = number of customers from that country who have at least one completed order.
// topCustomer = customer with the highest total completed-order revenue within that country.

// For example, in France:

// Anna = 200
// Mike = 300

// so:

// topCustomer: "Mike"
// Do not include countries without completed orders.
// Sort by:
// totalRevenue

// descending.

// Try to keep the solution around:
// O(customers + orders)

// apart from the final sorting.

// Expected result:

// [
//   {
//     country: "Germany",
//     totalRevenue: 650,
//     orderCount: 3,
//     averageOrder: 216.67,
//     uniqueCustomers: 2,
//     topCustomer: "Sam"
//   },
//   {
//     country: "France",
//     totalRevenue: 500,
//     orderCount: 4,
//     averageOrder: 125,
//     uniqueCustomers: 2,
//     topCustomer: "Mike"
//   },
//   {
//     country: "Spain",
//     totalRevenue: 150,
//     orderCount: 1,
//     averageOrder: 150,
//     uniqueCustomers: 1,
//     topCustomer: "Kate"
//   }
// ]
