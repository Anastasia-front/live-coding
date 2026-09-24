// import { useState } from "react";

// export default function TicketQueue({ initialTickets }) {
//   const [tickets, setTickets] = useState(initialTickets);
//   const [statusFilter, setStatusFilter] = useState("all");

//   const resolveTicket = (ticketId) => {
//     const ticket = tickets.find((ticket) => ticket.id === ticketId);

//     ticket.status = "resolved";

//     setTickets(tickets);
//   };

//   const increasePriority = (ticketId) => {
//     const ticket = tickets.find((ticket) => ticket.id === ticketId);

//     ticket.priority = "high";

//     setTickets(tickets);
//   };

//   return (
//     <div>
//       <h2>Support Queue</h2>

//       <select
//         value={statusFilter}
//         onChange={(e) => setStatusFilter(e.target.value)}
//       >
//         <option value="all">All</option>
//         <option value="open">Open</option>
//         <option value="in_progress">In progress</option>
//         <option value="resolved">Resolved</option>
//       </select>

//       <p>Showing: 0</p>
//       <p>Open high-priority tickets: 0</p>
//       <p>Average age: 0 hours</p>

//       {tickets.map((ticket) => (
//         <div key={ticket.title}>
//           <strong>{ticket.title}</strong>

//           <p>Customer: {ticket.customer}</p>
//           <p>Status: {ticket.status}</p>
//           <p>Priority: {ticket.priority}</p>
//           <p>Age: {ticket.ageHours} hours</p>

//           <button onClick={() => resolveTicket(ticket.id)}>
//             Resolve
//           </button>

//           <button onClick={() => increasePriority(ticket.id)}>
//             Make high priority
//           </button>
//         </div>
//       ))}
//     </div>
//   );
// }

// Your task is to fix and extend the component.

// The status filter must actually work. "all" shows everything; otherwise only tickets with the selected status should be rendered. All statistics below must be calculated from the currently visible tickets, not from the complete list.

// Display:

// Showing: 3 / 5

// where the first number is visible tickets and the second is total tickets.

// Display:

// Open high-priority tickets: X

// Count only visible tickets where:

// status === "open" && priority === "high"

// Display the average ageHours of currently visible tickets:

// Average age: 9.33 hours

// Round to 2 decimals. If there are no visible tickets, show 0.

// Resolve must immutably change only the clicked ticket to:

// status: "resolved"

// Do not show the Resolve button if it is already resolved.

// Make high priority must immutably change only the clicked ticket to:

// priority: "high"

// Do not show that button if the ticket is already high priority.

// Add another button:

// Start work

// It should only appear when:

// status === "open"

// and clicking it changes status to:

// "in_progress"

// Add a checkbox:

// Old tickets only

// When enabled, show only tickets where:

// ageHours >= 10

// This checkbox and the status filter must work together.

// For example:

// statusFilter = "open"
// oldTicketsOnly = true

// should show only tickets that are both open and at least 10 hours old.

// If nothing matches the current filters, render:

// No tickets found

// instead of an empty list.

// Also fix the existing React problems:

// ticket.status = ...
// ticket.priority = ...
// setTickets(tickets)

// and:

// key={ticket.title}

// Constraints:

// do not mutate tickets
// do not use useEffect
// do not store visibleTickets, counts, or averages in separate state
// state should contain only actual user-controlled or mutable source data
// no external libraries

import { useMemo, useState } from "react";

export const initialTickets = [
  {
    id: 101,
    title: "Cannot log in",
    customer: "Anna",
    status: "open",
    priority: "medium",
    ageHours: 5,
  },
  {
    id: 102,
    title: "Payment failed",
    customer: "John",
    status: "in_progress",
    priority: "high",
    ageHours: 12,
  },
  {
    id: 103,
    title: "Wrong invoice",
    customer: "Kate",
    status: "resolved",
    priority: "low",
    ageHours: 8,
  },
  {
    id: 104,
    title: "Account blocked",
    customer: "Mike",
    status: "open",
    priority: "high",
    ageHours: 20,
  },
  {
    id: 105,
    title: "Cannot upload file",
    customer: "Lisa",
    status: "open",
    priority: "low",
    ageHours: 3,
  },
];

export default function TicketQueue({ initialTickets }) {
  const [tickets, setTickets] = useState(initialTickets);
  const [statusFilter, setStatusFilter] = useState("all");
  const [oldTicketsOnly, setOldTicketsOnly] = useState(false);

  const filteredTickets = useMemo(() => {
    return tickets
      .filter(
        (ticket) => statusFilter === "all" || ticket.status === statusFilter,
      )
      .filter((ticket) => !oldTicketsOnly || ticket.ageHours >= 10);
  }, [statusFilter, oldTicketsOnly, tickets]);

  const handleStatus = (ticketId, status) => {
    setTickets((prevTickets) =>
      prevTickets.map((ticket) =>
        ticket.id === ticketId ? { ...ticket, status } : ticket,
      ),
    );
  };

  const increasePriority = (ticketId) => {
    setTickets((prevTickets) =>
      prevTickets.map((ticket) =>
        ticket.id === ticketId ? { ...ticket, priority: "high" } : ticket,
      ),
    );
  };

  const openHightPriorityTickets = tickets.reduce((acc, ticket) => {
    if (ticket.status === "open" && ticket.priority === "high") acc++;
    return acc;
  }, 0);

  const totalAverageAge = tickets.reduce((acc, ticket) => {
    acc += ticket.ageHours;
    return acc;
  }, 0);
  const averageAge =
    tickets.length > 0 ? (totalAverageAge / tickets.length).toFixed(2) : 0;

  return (
    <div>
      <h2>Support Queue</h2>

      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
      >
        <option value="all">All</option>
        <option value="open">Open</option>
        <option value="in_progress">In progress</option>
        <option value="resolved">Resolved</option>
      </select>

      <input
        type="checkbox"
        checked={oldTicketsOnly}
        onChange={(e) => setOldTicketsOnly(e.target.checked)}
      >
        Old tickets only
      </input>

      <p>
        Showing: {tickets.length} / {initialTickets.length}
      </p>
      <p>Open high-priority tickets: {openHightPriorityTickets}</p>
      <p>Average age: {averageAge} hours</p>

      {filteredTickets.length === 0
        ? "No tickets found"
        : tickets.map((ticket) => (
            <div key={ticket.id}>
              <strong>{ticket.title}</strong>

              <p>Customer: {ticket.customer}</p>
              <p>Status: {ticket.status}</p>
              <p>Priority: {ticket.priority}</p>
              <p>Age: {ticket.ageHours} hours</p>

              {ticket.status !== "resolved" && (
                <button onClick={() => handleStatus(ticket.id, "resolved")}>
                  Resolve
                </button>
              )}

              {ticket.priority !== "high" && (
                <button onClick={() => increasePriority(ticket.id)}>
                  Make high priority
                </button>
              )}

              {ticket.status === "open" && (
                <button onClick={() => handleStatus(ticket.id, "in_progress")}>
                  Start work
                </button>
              )}
            </div>
          ))}
    </div>
  );
}
