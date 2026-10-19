const customers = [
  { id: 1, name: "Anna", country: "France" },
  { id: 2, name: "John", country: "Germany" },
  { id: 3, name: "Mike", country: "France" },
  { id: 4, name: "Kate", country: "Spain" },
];

const orders = [
  { id: 101, customerId: 1, amount: 120, status: "completed" },
  { id: 102, customerId: 2, amount: 300, status: "completed" },
  { id: 103, customerId: 1, amount: 80, status: "completed" },
  { id: 104, customerId: 3, amount: 250, status: "cancelled" },
  { id: 105, customerId: 3, amount: 200, status: "completed" },
  { id: 106, customerId: 4, amount: 150, status: "completed" },
  { id: 107, customerId: 2, amount: 50, status: "cancelled" },
];
// O(customers*orders)
function getCountryStats(customers, orders) {
  const summary = {};

  for (const customer of customers) {
    const { id, country } = customer;
    if (!summary[country]) {
      summary[country] = {
        country,
        totalRevenue: 0,
        customerCount: 0,
      };
    }
    let firstMeet = true;
    for (const order of orders) {
      const { customerId, amount, status } = order;
      if (status !== "completed" || id !== customerId) continue;
      summary[country].totalRevenue += amount;
      if (firstMeet) summary[country].customerCount += 1;
      firstMeet = false;
    }
  }
  return Object.values(summary)
    .filter((country) => country.customerCount >= 1)
    .sort((a, b) => b.totalRevenue - a.totalRevenue);
}

console.log(getCountryStats(customers, orders));

// Consider only "completed" orders.
// Group revenue by country.
// For each country return:
// country
// totalRevenue
// customerCount — number of unique customers from that country who have at least one completed order
// Sort by totalRevenue descending.

// [
//   { country: "Germany", totalRevenue: 300, customerCount: 1 },
//   { country: "France", totalRevenue: 400, customerCount: 2 },
//   { country: "Spain", totalRevenue: 150, customerCount: 1 },
// ]

// O(customers+orders)
function getCountryStats(customers, orders) {
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

    const { country } = customer;

    if (!summary[country]) {
      summary[country] = {
        country,
        totalRevenue: 0,
        customers: new Set(),
      };
    }

    summary[country].totalRevenue += amount;
    summary[country].customers.add(customerId);
  }

  return Object.values(summary)
    .map((item) => ({
      country: item.country,
      totalRevenue: item.totalRevenue,
      customerCount: item.customers.size,
    }))
    .sort((a, b) => b.totalRevenue - a.totalRevenue);
}
