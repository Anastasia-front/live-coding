const users = [
  {
    id: 1,
    name: "Anna",
    role: "admin",
    action: "create",
    active: true,
    score: 82,
  },
  {
    id: 2,
    name: "John",
    role: "user",
    action: "delete",
    active: false,
    score: 65,
  },
  {
    id: 3,
    name: "Mike",
    role: "user",
    action: "create",
    active: true,
    score: 91,
  },
  {
    id: 4,
    name: "Kate",
    role: "manager",
    action: "update",
    active: true,
    score: 74,
  },
  { id: 5, name: "Sam", role: "user", action: "add", active: true, score: 88 },
];

function getActiveUsers(users) {
  return users.filter((user) => user.active);
}

function findManager(users) {
  return users.find((user) => user.role === "manager");
}

function hasHighScoringInactiveUser(users) {
  return users.some((user) => user.active === false && user.score >= 80);
}

function getActiveUsersTotalScore(users) {
  return users.reduce((acc, user) => {
    if (user.active) acc += user.score;
    return acc;
  }, 0);
}

function processUntilTarget(users, targetScore) {
  const result = { totalScore: 0, processedCount: 0 };
  while (
    result.totalScore < targetScore &&
    result.processedCount < users.length
  ) {
    result.totalScore += users[result.processedCount].score;
    result.processedCount++;
  }
  return result;
}

function getUserNames(users) {
  return users.map((user) => user.name);
}

function countByRole(users) {
  const summary = {};

  for (const user of users) {
    const { role } = user;
    if (!summary[role]) {
      summary[role] = 0;
    }
    summary[role]++;
  }
  return summary;
}

function handleAction(users) {
  users.forEach((user) => {
    switch (user.action) {
      case "create":
        return "Creating user";
      case "update":
        return "Updating user";
      case "delete":
        return "Deleting user";
      default:
        return "Unknown action";
    }
  });
}

const settings = {
  theme: "dark",
  language: "en",
  notifications: true,
};

function printSettings(settings) {
  for (const key in settings) {
    console.log(`${key}: ${settings[key]}`);
  }
}

// theme: dark
// language: en
// notifications: true
