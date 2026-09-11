// CREATE TABLE events (
//   id SERIAL PRIMARY KEY,
//   name TEXT,
//   total_seats INT
// );

// CREATE TABLE bookings (
//   id SERIAL PRIMARY KEY,
//   event_id INT REFERENCES events(id),
//   user_id INT REFERENCES users(id),
//   seat_number INT,
//   UNIQUE (event_id, seat_number) -- prevents double-booking at the DB level itself
// );

async function bookSeat(eventId, userId, seatNumber) {
  const eventResult = await db.query(
    "SELECT total_seats FROM events WHERE id = $1",
    [eventId],
  );
  const event = eventResult.rows[0];
  if (!event) throw new NotFoundError("Event not found");

  if (
    !Number.isInteger(seatNumber) ||
    seatNumber <= 0 ||
    seatNumber > event.total_seats
  ) {
    throw new BadRequestError("Invalid seat number");
  }

  const client = await db.connect();
  try {
    await client.query("BEGIN");

    const userSeatsResult = await client.query(
      "SELECT COUNT(*) FROM bookings WHERE user_id = $1 AND event_id = $2",
      [userId, eventId],
    );
    const userSeatCount = parseInt(userSeatsResult.rows[0].count, 10);
    if (userSeatCount >= 3) {
      throw new ConflictError("Each user can book at most 3 seats per event");
    }

    let booking;
    try {
      const insertResult = await client.query(
        `INSERT INTO bookings (event_id, user_id, seat_number) VALUES ($1, $2, $3) RETURNING *`,
        [eventId, userId, seatNumber],
      );
      booking = insertResult.rows[0];
    } catch (err) {
      if (err.code === "23505") {
        // Postgres unique_violation
        throw new ConflictError("Seat is already taken");
      }
      throw err;
    }

    await client.query("COMMIT");
    return booking;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
