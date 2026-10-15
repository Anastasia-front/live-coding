const users = [
  { id: 1, name: "Anna", departmentId: 10 },
  { id: 2, name: "John", departmentId: 20 },
  { id: 3, name: "Mike", departmentId: 10 },
  { id: 4, name: "Kate", departmentId: 30 },
  { id: 5, name: "Sam", departmentId: 20 },
];

const departments = [
  { id: 10, name: "Engineering" },
  { id: 20, name: "Support" },
  { id: 30, name: "Sales" },
];

const tickets = [
  { id: 101, userId: 1, priority: "high", status: "closed" },
  { id: 102, userId: 1, priority: "low", status: "closed" },
  { id: 103, userId: 2, priority: "high", status: "open" },
  { id: 104, userId: 2, priority: "high", status: "closed" },
  { id: 105, userId: 3, priority: "high", status: "closed" },
  { id: 106, userId: 3, priority: "high", status: "closed" },
  { id: 107, userId: 4, priority: "low", status: "closed" },
  { id: 108, userId: 5, priority: "high", status: "closed" },
];

function getDepartmentStats(users, departments, tickets) {
  const userById = {};

  for (const user of users) {
    userById[user.id] = user;
  }

  const departmentById = {};

  for (const department of departments) {
    departmentById[department.id] = department;
  }

  const summary = {};

  for (const ticket of tickets) {
    if (ticket.status !== "closed") continue;

    const user = userById[ticket.userId];
    if (!user) continue;

    const department = departmentById[user.departmentId];
    if (!department) continue;

    const departmentId = user.departmentId;

    if (!summary[departmentId]) {
      summary[departmentId] = {
        department: department.name,
        closedTickets: 0,
        highPriorityTickets: 0,
        uniqueUsers: new Set(),
      };
    }

    summary[departmentId].closedTickets++;

    if (ticket.priority === "high") {
      summary[departmentId].highPriorityTickets++;
    }

    summary[departmentId].uniqueUsers.add(ticket.userId);
  }

  return Object.values(summary)
    .map((item) => ({
      department: item.department,
      closedTickets: item.closedTickets,
      highPriorityTickets: item.highPriorityTickets,
      uniqueUsers: item.uniqueUsers.size,
    }))
    .sort((a, b) => b.closedTickets - a.closedTickets);
}
console.log(getDepartmentStats(users, departments, tickets));

// Requirements:

// Consider only tickets where:
// status === "closed"
// Group results by department.
// For each department return:
// {
//   department: "Engineering",
//   closedTickets: 4,
//   highPriorityTickets: 3,
//   uniqueUsers: 2
// }

// Where:

// closedTickets = total number of closed tickets
// highPriorityTickets = number of closed tickets with priority === "high"
// uniqueUsers = number of unique users who have at least one closed ticket
// Do not include departments with zero closed tickets.
// Sort by closedTickets descending.
// Try to make it:
// O(users + departments + tickets)

// No nested .find() inside the ticket loop.

// Expected result:

// [
//   {
//     department: "Engineering",
//     closedTickets: 4,
//     highPriorityTickets: 3,
//     uniqueUsers: 2
//   },
//   {
//     department: "Support",
//     closedTickets: 2,
//     highPriorityTickets: 2,
//     uniqueUsers: 2
//   },
//   {
//     department: "Sales",
//     closedTickets: 1,
//     highPriorityTickets: 0,
//     uniqueUsers: 1
//   }
// ]
