function largestFreeGap(
  meetings: number[][],
  workStart: number,
  workEnd: number,
): number {
  if (meetings.length <= 0) return 0;
  const intervals: number[] = [];
  const sorted = [...meetings].sort((a, b) => a[0] - b[0]);

  for (let i = 0; i < sorted.length; i++) {
    const [meetingStart, meetingEnd] = sorted[i];

    if (i === 0 && meetingStart > workStart) {
      intervals.push(meetingStart - workStart);
    }
    if (i === sorted.length - 1 && meetingEnd < workEnd) {
      intervals.push(workEnd - meetingEnd);
    }

    const nextMeetingStart = sorted[i + 1]?.[0];
    if (nextMeetingStart !== undefined && nextMeetingStart > meetingEnd) {
      intervals.push(nextMeetingStart - meetingEnd);
    }
  }

  return intervals.length ? Math.max(...intervals) : 0;
}

console.log(
  largestFreeGap(
    [
      [30, 60],
      [90, 120],
      [0, 15],
    ],
    0,
    150,
  ),
);
// Meetings sorted: [0,15], [30,60], [90,120]
// Gaps: 15→30 (15 min), 60→90 (30 min), 120→150 (30 min, end of day)
// Output: 30

console.log(
  largestFreeGap(
    [
      [0, 60],
      [60, 120],
    ],
    0,
    120,
  ),
);
// Meetings sorted: [0,60], [60,120] — back to back, no gaps at all
// Output: 0

console.log(largestFreeGap([[20, 40]], 0, 100));
// Only one meeting — what are the gaps here?
