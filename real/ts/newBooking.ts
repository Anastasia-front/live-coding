function insertNewBooking(newBooking: number, bookings: number[][]): number {
  if (newBooking < 0 || newBooking >= bookings.length) return -1;
  if (bookings.length < 1) return -1;

  const newBookingTime = bookings[newBooking];
  const [newStart, newEnd] = newBookingTime;

  // everyone except the booking being inserted
  const others = bookings.filter((_, i) => i !== newBooking);

  // reject if it overlaps ANY existing booking
  const overlaps = others.some(([s, e]) => newStart < e && newEnd > s);
  if (overlaps) return -1;

  // sort the others by start time, then count how many start before newStart
  const sorted = [...others].sort((a, b) => a[0] - b[0]);
  const position = sorted.filter(([s]) => s < newStart).length + 1;

  return position;
}

// Complexity
// .sort() is O(n log n); the two .filter()/.some() passes are each O(n). Overall O(n log n), matching the requirement.

console.log(
  insertNewBooking(2, [
    [30, 60],
    [90, 120],
    [60, 90],
  ]),
);
console.log(
  insertNewBooking(2, [
    [100, 200],
    [250, 300],
    [180, 260],
  ]),
);
