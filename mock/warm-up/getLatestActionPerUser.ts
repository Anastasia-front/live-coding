export type EventType = { userId: number; action: string; timestamp: number };

export function getLatestActionPerUser(events: EventType[]): EventType[] {
  if (events.length === 0) return [];

  const latest = events.reduce(
    (acc: Record<number, EventType>, item: EventType) => {
      if (!acc[item.userId] || acc[item.userId].timestamp < item.timestamp) {
        acc[item.userId] = item;
      }

      return acc;
    },
    {},
  );

  return Object.values(latest);
}

// Related example:
// const events: EventType[] = [
//   { userId: 1, action: "login", timestamp: 100 },
//   { userId: 2, action: "click", timestamp: 150 },
//   { userId: 1, action: "purchase", timestamp: 300 },
//   { userId: 3, action: "login", timestamp: 200 },
//   { userId: 2, action: "logout", timestamp: 400 },
//   { userId: 1, action: "logout", timestamp: 250 },
// ];
//
// console.log(getLatestActionPerUser(events));
// Output:
// [
//   { userId: 1, action: "purchase", timestamp: 300 },
//   { userId: 2, action: "logout", timestamp: 400 },
//   { userId: 3, action: "login", timestamp: 200 },
// ]
