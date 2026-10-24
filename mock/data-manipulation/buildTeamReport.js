const users = [
  { id: 1, name: "Anna", teamId: 10, active: true },
  { id: 2, name: "John", teamId: 20, active: true },
  { id: 3, name: "Mike", teamId: 10, active: false },
  { id: 4, name: "Kate", teamId: 30, active: true },
  { id: 5, name: "Sam", teamId: 20, active: true },
  { id: 6, name: "Lisa", teamId: 10, active: true },
];

const teams = [
  { id: 10, name: "Frontend" },
  { id: 20, name: "Backend" },
  { id: 30, name: "QA" },
];

const tasks = [
  { id: 101, userId: 1, status: "completed", priority: "high", hours: 5 },
  { id: 102, userId: 1, status: "completed", priority: "low", hours: 3 },
  { id: 103, userId: 2, status: "completed", priority: "high", hours: 8 },
  { id: 104, userId: 2, status: "in_progress", priority: "high", hours: 4 },
  { id: 105, userId: 3, status: "completed", priority: "high", hours: 10 },
  { id: 106, userId: 4, status: "completed", priority: "low", hours: 7 },
  { id: 107, userId: 5, status: "completed", priority: "high", hours: 6 },
  { id: 108, userId: 5, status: "completed", priority: "high", hours: 4 },
  { id: 109, userId: 6, status: "completed", priority: "low", hours: 9 },
  { id: 110, userId: 6, status: "completed", priority: "high", hours: 2 },
];

function buildTeamReport(users, teams, tasks, hourLimit) {
  const userById = {};
  for (const user of users) {
    userById[user.id] = user;
  }

  const teamById = {};
  for (const team of teams) {
    teamById[team.id] = team;
  }

  const result = {};

  for (const task of tasks) {
    const user = userById[task.userId];
    if (!user) continue;
    const { active } = user;
    if (!active || task.status !== "completed") continue;
    const team = teamById[user.teamId];
    if (!team) continue;
    const { id, name } = team;

    if (!result[id]) {
      result[id] = {
        team: name,
        totalHours: 0,
        completedTasks: 0,
        highPriorityTasks: 0,
        activeUsers: new Set(),
        topUser: {},
        hasHeavyTask: false,
      };
    }

    result[id].totalHours += task.hours;

    result[id].completedTasks++;
    if (task.priority === "high") result[id].highPriorityTasks++;
    result[id].activeUsers.add(task.userId);
    if (!result[id].topUser[user.id]) {
      result[id].topUser[user.id] = 0;
    }
    result[id].topUser[user.id] += task.hours;
    if (task.hours >= 8) result[id].hasHeavyTask = true;
  }

  const report = Object.values(result)
    .map((item) => {
      const topUserId = Object.keys(item.topUser).find(
        (key) => item.topUser[key] === Math.max(...Object.values(item.topUser)),
      );

      return {
        team: item.team,
        totalHours: item.totalHours,
        completedTasks: item.completedTasks,
        highPriorityTasks: item.highPriorityTasks,
        activeUsers: item.activeUsers.size,
        averageHoursPerTask: Number(
          (item.totalHours / item.completedTasks).toFixed(2),
        ),
        topUser: userById[topUserId].name,
        hasHeavyTask: item.hasHeavyTask,
      };
    })
    .sort((a, b) => b.totalHours - a.totalHours);

  const finalResult = [];
  let teamsTotalHours = 0;
  for (const team of Object.values(report)) {
    teamsTotalHours += team.totalHours;
    finalResult.push(team);
    if (teamsTotalHours >= hourLimit) {
      break;
    }
  }

  return finalResult;
}

// Requirements:

// Ignore tasks belonging to inactive users.
// Consider only tasks with:
// status === "completed"
// Return one object per team that has at least one valid completed task.
// Each team object must have:
// {
//   team: "Frontend",
//   totalHours: 19,
//   completedTasks: 4,
//   highPriorityTasks: 2,
//   activeUsers: 2,
//   averageHoursPerTask: 4.75,
//   topUser: "Lisa",
//   hasHeavyTask: true
// }

// Definitions:

// totalHours — sum of hours of valid completed tasks.
// completedTasks — number of valid completed tasks.
// highPriorityTasks — valid completed tasks where priority === "high".
// activeUsers — number of unique active users in that team who have at least one valid completed task.
// averageHoursPerTask — totalHours / completedTasks, rounded to 2 decimals.
// topUser — user with the highest total completed-task hours within that team.
// hasHeavyTask — true if that team has at least one valid completed task with hours >= 8.
// Sort the final array by:
// totalHours

// descending.

// After building the report, stop returning teams once the cumulative totalHours across the sorted teams becomes greater than or equal to:
// hourLimit

// Example:

console.log(buildTeamReport(users, teams, tasks, 25));

// If the sorted team totals are:

// Frontend: 19
// Backend: 18
// QA: 7

// then return only:

// [
//   Frontend,
//   Backend
// ]

// because:

// 19 + 18 = 37 >= 25
// If hourLimit is greater than the total hours of all teams, return all teams.
// Unknown userId or teamId values must not crash the function.

// Expected full report before applying hourLimit:

// [
//   {
//     team: "Frontend",
//     totalHours: 19,
//     completedTasks: 4,
//     highPriorityTasks: 2,
//     activeUsers: 2,
//     averageHoursPerTask: 4.75,
//     topUser: "Lisa",
//     hasHeavyTask: true
//   },
//   {
//     team: "Backend",
//     totalHours: 18,
//     completedTasks: 3,
//     highPriorityTasks: 3,
//     activeUsers: 2,
//     averageHoursPerTask: 6,
//     topUser: "John",
//     hasHeavyTask: true
//   },
//   {
//     team: "QA",
//     totalHours: 7,
//     completedTasks: 1,
//     highPriorityTasks: 0,
//     activeUsers: 1,
//     averageHoursPerTask: 7,
//     topUser: "Kate",
//     hasHeavyTask: false
//   }
// ]
