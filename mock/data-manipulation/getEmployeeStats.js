const departments = [
  {
    name: "Engineering",
    employees: [
      { id: 1, name: "Anna", salary: 4000, active: true },
      { id: 2, name: "John", salary: 3500, active: true },
      { id: 3, name: "Mike", salary: 3000, active: false },
    ],
  },
  {
    name: "Product",
    employees: [
      { id: 4, name: "Kate", salary: 4200, active: true },
      { id: 5, name: "John", salary: 3700, active: true },
    ],
  },
  {
    name: "Support",
    employees: [
      { id: 6, name: "Anna", salary: 3800, active: true },
      { id: 7, name: "Mike", salary: 3200, active: true },
    ],
  },
];

function getEmployeeStats(departments) {
  const stats = {};
  for (const department of departments) {
    for (const employee of department.employees) {
      const { name, salary, active } = employee;
      if (!active) continue;

      if (!stats[name]) {
        stats[name] = {
          name,
          totalSalary: 0,
          departmentCount: 0,
          departments: [],
        };
      }
      stats[name].totalSalary += salary;
      stats[name].departmentCount += 1;
      if (!stats[name].departments.includes(department.name))
        stats[name].departments.push(department.name);
    }
  }

  return Object.values(stats).sort((a, b) => b.totalSalary - a.totalSalary);
}

console.log(getEmployeeStats(departments));

// Consider only employees with active === true.
// Group by employee name.
// For each employee return:
// name
// totalSalary
// departmentCount
// departments — unique department names
// Sort by totalSalary from highest to lowest.

// Expected result:

// [
//   {
//     name: "Anna",
//     totalSalary: 7800,
//     departmentCount: 2,
//     departments: ["Engineering", "Support"],
//   },
//   {
//     name: "John",
//     totalSalary: 7200,
//     departmentCount: 2,
//     departments: ["Engineering", "Product"],
//   },
//   {
//     name: "Kate",
//     totalSalary: 4200,
//     departmentCount: 1,
//     departments: ["Product"],
//   },
//   {
//     name: "Mike",
//     totalSalary: 3200,
//     departmentCount: 1,
//     departments: ["Support"],
//   },
// ]
