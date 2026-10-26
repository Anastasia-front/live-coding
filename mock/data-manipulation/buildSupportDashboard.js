const agents = [
  { id: 1, name: "Anna", active: true, team: "L1" },
  { id: 2, name: "John", active: true, team: "L2" },
  { id: 3, name: "Mike", active: false, team: "L2" },
  { id: 4, name: "Kate", active: true, team: "L1" },
];

const tickets = [
  {
    id: 101,
    agentId: 1,
    status: "resolved",
    priority: "high",
    resolutionMinutes: 40,
    customerRating: 5,
  },
  {
    id: 102,
    agentId: 1,
    status: "resolved",
    priority: "low",
    resolutionMinutes: 20,
    customerRating: 4,
  },
  {
    id: 103,
    agentId: 2,
    status: "open",
    priority: "high",
    resolutionMinutes: null,
    customerRating: null,
  },
  {
    id: 104,
    agentId: 2,
    status: "resolved",
    priority: "high",
    resolutionMinutes: 90,
    customerRating: 3,
  },
  {
    id: 105,
    agentId: 3,
    status: "resolved",
    priority: "high",
    resolutionMinutes: 30,
    customerRating: 5,
  },
  {
    id: 106,
    agentId: 4,
    status: "resolved",
    priority: "medium",
    resolutionMinutes: 60,
    customerRating: 4,
  },
  {
    id: 107,
    agentId: 4,
    status: "resolved",
    priority: "high",
    resolutionMinutes: 120,
    customerRating: null,
  },
  {
    id: 108,
    agentId: 999,
    status: "resolved",
    priority: "high",
    resolutionMinutes: 10,
    customerRating: 5,
  },
];

function buildSupportDashboard(agents, tickets) {
  const agentById = {};

  for (const agent of agents) {
    agentById[agent.id] = agent;
  }

  const summary = {
    totalResolved: 0,
    totalOpen: 0,
    highPriorityResolved: 0,
    resolutionMinutes: 0,
    customerRatings: [],
    activeAgentsWithResolvedTickets: new Set(),
    topAgent: {},
  };

  const summaryAgents = {};

  for (const ticket of tickets) {
    const { agentId, status, priority, resolutionMinutes, customerRating } =
      ticket;

    const agent = agentById[agentId];

    if (!agent || !agent.active) continue;

    if (status === "open") {
      summary.totalOpen++;
    }

    if (status !== "resolved") continue;

    const { id, name } = agent;

    summary.totalResolved++;
    summary.resolutionMinutes += resolutionMinutes;
    summary.activeAgentsWithResolvedTickets.add(id);

    if (priority === "high") {
      summary.highPriorityResolved++;
    }

    if (typeof customerRating === "number") {
      summary.customerRatings.push(customerRating);
    }

    if (!summary.topAgent[id]) {
      summary.topAgent[id] = {
        id,
        name,
        resolvedTickets: 0,
        totalResolutionMinutes: 0,
      };
    }

    if (!summaryAgents[id]) {
      summaryAgents[id] = {
        id,
        name,
        resolvedTickets: 0,
        totalResolutionMinutes: 0,
        customerRatings: [],
      };
    }

    summary.topAgent[id].resolvedTickets++;
    summary.topAgent[id].totalResolutionMinutes += resolutionMinutes;

    summaryAgents[id].resolvedTickets++;
    summaryAgents[id].totalResolutionMinutes += resolutionMinutes;

    if (typeof customerRating === "number") {
      summaryAgents[id].customerRatings.push(customerRating);
    }
  }

  const totalCustomerRating = summary.customerRatings?.reduce((acc, cR) => {
    acc += cR;
    return acc;
  }, 0);

  const topAgentId =
    summary.topAgent &&
    Object.values(summary.topAgent).reduce((acc, agent) => {
      const currentId = agent.id;
      if (!acc) return currentId;

      const best = summary.topAgent[acc];
      const current = summary.topAgent[currentId];

      if (current.resolvedTickets > best.resolvedTickets) {
        return currentId;
      }

      if (
        current.resolvedTickets === best.resolvedTickets &&
        current.totalResolutionMinutes < best.totalResolutionMinutes
      ) {
        return currentId;
      }

      return acc;
    }, null);

  const aggregatedSummary = {
    totalResolved: summary.totalResolved,
    totalOpen: summary.totalOpen,
    highPriorityResolved: summary.highPriorityResolved,
    averageResolutionMinutes: Number(
      (summary.resolutionMinutes / summary.totalResolved).toFixed(2),
    ),
    averageCustomerRating:
      summary.customerRatings &&
      Number((totalCustomerRating / summary.customerRatings.length).toFixed(2)),
    activeAgentsWithResolvedTickets:
      summary.activeAgentsWithResolvedTickets &&
      summary.activeAgentsWithResolvedTickets.size,
    topAgent: agentById[topAgentId]?.name,
  };

  const aggregatedAgentSummary = Object.values(summaryAgents)
    .map((i) => {
      const totalCustomerRating = i.customerRatings.reduce((acc, cR) => {
        acc += cR;
        return acc;
      }, 0);
      return {
        name: i.name,
        resolvedTickets: i.resolvedTickets,
        totalResolutionMinutes: i.totalResolutionMinutes,
        averageResolutionMinutes:
          i.resolvedTickets > 0
            ? i.totalResolutionMinutes / i.resolvedTickets
            : 0,
        averageCustomerRating:
          i.customerRatings.length > 0
            ? Number(
                (totalCustomerRating / i.customerRatings.length).toFixed(2),
              )
            : 0,
      };
    })
    .sort((a, b) => {
      if (b.resolvedTickets !== a.resolvedTickets) {
        return b.resolvedTickets - a.resolvedTickets;
      }

      return a.averageResolutionMinutes - b.averageResolutionMinutes;
    });

  return { ...aggregatedSummary, agents: [...aggregatedAgentSummary] };
}

console.log(buildSupportDashboard(agents, tickets));

// Return:

// {
//   totalResolved: 5,
//   totalOpen: 1,
//   highPriorityResolved: 3,
//   averageResolutionMinutes: 66,
//   averageCustomerRating: 4,
//   activeAgentsWithResolvedTickets: 3,
//   topAgent: "Anna",
//   agents: [
//     {
//       id: 1,
//       name: "Anna",
//       resolvedTickets: 2,
//       totalResolutionMinutes: 60,
//       averageResolutionMinutes: 30,
//       averageCustomerRating: 4.5
//     },
//     ...
//   ]
// }

// Requirements:

// Ignore all tickets belonging to inactive agents.

// Ignore tickets whose agentId does not exist.

// For the top-level summary:

// totalResolved — number of valid resolved tickets.
// totalOpen — number of valid open tickets.
// highPriorityResolved — resolved tickets with priority === "high".
// averageResolutionMinutes — average resolution time across all resolved tickets. Round to 2 decimals.
// averageCustomerRating — average only ratings that are actual numbers. null ratings must not count toward the divisor.
// activeAgentsWithResolvedTickets — unique active agents who resolved at least one ticket.
// topAgent — active agent with the highest number of resolved tickets. If two agents have the same count, choose the one with the lower total resolution time.

// The nested agents array should contain only active agents who have at least one resolved ticket.

// For each agent return:

// {
//   id,
//   name,
//   resolvedTickets,
//   totalResolutionMinutes,
//   averageResolutionMinutes,
//   averageCustomerRating
// }

// For agent-level averageCustomerRating, again ignore null.

// If an agent has resolved tickets but all ratings are null, return:

// averageCustomerRating: 0

// Sort the nested agents array by:

// resolvedTickets descending
// if tied, averageResolutionMinutes ascending

// Do not mutate either input array.

// Expected nested agent statistics

// Anna:

// {
//   id: 1,
//   name: "Anna",
//   resolvedTickets: 2,
//   totalResolutionMinutes: 60,
//   averageResolutionMinutes: 30,
//   averageCustomerRating: 4.5
// }

// John:

// {
//   id: 2,
//   name: "John",
//   resolvedTickets: 1,
//   totalResolutionMinutes: 90,
//   averageResolutionMinutes: 90,
//   averageCustomerRating: 3
// }

// Kate:

// {
//   id: 4,
//   name: "Kate",
//   resolvedTickets: 2,
//   totalResolutionMinutes: 180,
//   averageResolutionMinutes: 90,
//   averageCustomerRating: 4
// }

// This is much closer to a practical interview task: API data arrives in imperfect form, you need to validate references, ignore invalid records, derive global statistics, derive per-entity statistics, handle null, apply tie-breaking rules, and produce UI-ready data.
