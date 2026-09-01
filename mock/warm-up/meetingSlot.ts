function findMeetingSlot(newMeetingSlot: number, meetings: number[][]): number {
  if (newMeetingSlot < 0 || meetings.length < 1) return -1;

  const [start, end] = meetings[newMeetingSlot];
  const others = meetings.filter((_, i) => i !== newMeetingSlot);

  const overlap = others.some(
    ([otherStart, otherEnd]) => start < otherEnd && end > otherStart,
  );
  if (overlap) return -1;

  const sorted = [...others].sort((a, b) => a[0] - b[0]);
  return sorted.filter(([s]) => s < start).length + 1;
}

console.log(
  findMeetingSlot(2, [
    [30, 60],
    [90, 120],
    [60, 90],
  ]),
);
console.log(
  findMeetingSlot(2, [
    [20, 40],
    [60, 80],
    [0, 20],
  ]),
);

console.log(
  findMeetingSlot(2, [
    [0, 30],
    [60, 90],
    [30, 60],
  ]),
);
console.log(
  findMeetingSlot(2, [
    [10, 50],
    [80, 100],
    [40, 90],
  ]),
);
