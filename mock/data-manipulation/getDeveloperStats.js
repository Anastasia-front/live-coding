const projects = [
  {
    id: 1,
    name: "Website",
    tasks: [
      { id: 101, assignee: "Anna", hours: 5, status: "done" },
      { id: 102, assignee: "John", hours: 3, status: "done" },
      { id: 103, assignee: "Anna", hours: 4, status: "pending" },
    ],
  },
  {
    id: 2,
    name: "Mobile App",
    tasks: [
      { id: 201, assignee: "Mike", hours: 8, status: "done" },
      { id: 202, assignee: "Anna", hours: 6, status: "done" },
      { id: 203, assignee: "John", hours: 2, status: "pending" },
    ],
  },
  {
    id: 3,
    name: "Admin Panel",
    tasks: [
      { id: 301, assignee: "John", hours: 7, status: "done" },
      { id: 302, assignee: "Mike", hours: 2, status: "done" },
    ],
  },
];

function getDeveloperStats(projects) {
  const stats = {};

  for (const project of projects) {
    for (const task of project.tasks) {
      if (task.status !== "done") continue;
      const { assignee, hours } = task;
      if (!stats[assignee]) {
        stats[assignee] = {
          name: assignee,
          totalHours: 0,
          taskCount: 0,
          projects: [],
        };
      }
      stats[assignee].totalHours += hours;
      stats[assignee].taskCount += 1;

      if (!stats[assignee].projects.includes(project.name)) {
        stats[assignee].projects.push(project.name);
      }
    }
  }
  return Object.values(stats).sort((a, b) => b.totalHours - a.totalHours);
}
console.log(getDeveloperStats(projects));
// Consider only tasks with status === "done".
// Group tasks by assignee.
// For each developer return:
// name
// totalHours
// taskCount
// projects — array of unique project names they worked on.
// Sort by totalHours from highest to lowest.

// Expected result:

// [
//   {
//     name: "Mike",
//     totalHours: 10,
//     taskCount: 2,
//     projects: ["Mobile App", "Admin Panel"],
//   },
//   {
//     name: "John",
//     totalHours: 10,
//     taskCount: 2,
//     projects: ["Website", "Admin Panel"],
//   },
//   {
//     name: "Anna",
//     totalHours: 11,
//     taskCount: 2,
//     projects: ["Website", "Mobile App"],
//   },
// ]
