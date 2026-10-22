const tickets = [
  {
    id: 101,
    title: "Login issue",
    status: "open",
    priority: "high",
    assignee: "Anna",
  },
  {
    id: 102,
    title: "Payment failed",
    status: "closed",
    priority: "high",
    assignee: "John",
  },
  {
    id: 103,
    title: "Update profile",
    status: "in_progress",
    priority: "low",
    assignee: "Anna",
  },
  {
    id: 104,
    title: "Cannot upload file",
    status: "open",
    priority: "medium",
    assignee: "Mike",
  },
  {
    id: 105,
    title: "Wrong invoice",
    status: "closed",
    priority: "medium",
    assignee: "Kate",
  },
  {
    id: 106,
    title: "Account blocked",
    status: "open",
    priority: "high",
    assignee: "John",
  },
];

function filterTicketsByStatus(tickets, status) {
  if (status === "all") return [...tickets];
  return tickets.filter((ticket) => ticket.status === status);
}

console.log(filterTicketsByStatus(tickets, "open"));
// Expected:

// [
//   {
//     id: 101,
//     title: "Login issue",
//     status: "open",
//     priority: "high",
//     assignee: "Anna",
//   },
//   {
//     id: 104,
//     title: "Cannot upload file",
//     status: "open",
//     priority: "medium",
//     assignee: "Mike",
//   },
//   {
//     id: 106,
//     title: "Account blocked",
//     status: "open",
//     priority: "high",
//     assignee: "John",
//   },
// ]

// But there is one additional requirement:

// filterTicketsByStatus(tickets, "all");

// must return all tickets.

// And your function must not mutate the original tickets array.
