const teams = [
  {
    name: "Frontend",
    members: [
      { id: 1, name: "Anna", points: 40, role: "developer", active: true },
      { id: 2, name: "John", points: 30, role: "developer", active: true },
      { id: 3, name: "Kate", points: 20, role: "designer", active: true },
    ],
  },
  {
    name: "Backend",
    members: [
      { id: 4, name: "Mike", points: 50, role: "developer", active: true },
      { id: 5, name: "Anna", points: 25, role: "developer", active: true },
      { id: 6, name: "John", points: 15, role: "developer", active: false },
    ],
  },
  {
    name: "Mobile",
    members: [
      { id: 7, name: "John", points: 45, role: "developer", active: true },
      { id: 8, name: "Mike", points: 10, role: "developer", active: true },
      { id: 9, name: "Kate", points: 35, role: "designer", active: true },
    ],
  },
];

function getDeveloperPerformance(teams) {
  const stats = {};

  for (const team of teams) {
    for (const member of team.members) {
      const { name, points, role, active } = member;
      if (!active || role !== "developer") continue;

      if (!stats[name])
        stats[name] = {
          name,
          totalPoints: 0,
          teamCount: 0,
          teams: [],
        };

      stats[name].totalPoints += points;
      stats[name].teamCount += 1;

      if (!stats[name].teams.includes(team.name)) {
        stats[name].teams.push(team.name);
      }
    }
  }

  return Object.values(stats).sort((a, b) => b.totalPoints - a.totalPoints);
}

console.log(getDeveloperPerformance(teams));

// Consider only members where:

// active === true

// and

// role === "developer"
// Group by member name.
// Return for each developer:
// name
// totalPoints
// teamCount
// teams — unique team names
// Sort by totalPoints descending.

// [
//   {
//     name: "Anna",
//     totalPoints: 65,
//     teamCount: 2,
//     teams: ["Frontend", "Backend"],
//   },
//   {
//     name: "Mike",
//     totalPoints: 60,
//     teamCount: 2,
//     teams: ["Backend", "Mobile"],
//   },
//   {
//     name: "John",
//     totalPoints: 75,
//     teamCount: 2,
//     teams: ["Frontend", "Mobile"],
//   },
// ]
