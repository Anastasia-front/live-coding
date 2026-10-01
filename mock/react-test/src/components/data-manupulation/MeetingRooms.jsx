// import { useEffect, useState } from "react";

// export default function MeetingRooms({ initialRooms }) {
//   const [rooms, setRooms] = useState(initialRooms);
//   const [availableRooms, setAvailableRooms] = useState(initialRooms);

//   const [minCapacity, setMinCapacity] = useState(1);
//   const [projectorRequired, setProjectorRequired] = useState(false);

//   useEffect(() => {
//     setAvailableRooms(
//       rooms.filter((room) => room.capacity >= minCapacity),
//     );
//   }, [rooms, minCapacity]);

//   const bookRoom = (roomId) => {
//     const room = rooms.find((room) => room.id === roomId);

//     room.booked = true;

//     setRooms(rooms);
//   };

//   const cancelBooking = (roomId) => {
//     const room = rooms.find((room) => room.id === roomId);

//     room.booked = false;

//     setRooms(rooms);
//   };

//   return (
//     <div>
//       <h2>Meeting Rooms</h2>

//       <label>
//         Minimum capacity:
//         <input
//           type="number"
//           value={minCapacity}
//           onChange={(e) => setMinCapacity(Number(e.target.value))}
//         />
//       </label>

//       <label>
//         <input
//           type="checkbox"
//           checked={projectorRequired}
//           onChange={(e) => setProjectorRequired(e.target.checked)}
//         />
//         Projector required
//       </label>

//       <p>Available rooms: 0</p>
//       <p>Total available seats: 0</p>
//       <p>Largest available room: -</p>

//       {availableRooms.map((room) => (
//         <div key={room.name}>
//           <h3>{room.name}</h3>

//           <p>Capacity: {room.capacity}</p>
//           <p>Projector: {room.hasProjector ? "Yes" : "No"}</p>
//           <p>Status: {room.booked ? "Booked" : "Available"}</p>

//           <button onClick={() => bookRoom(room.id)}>
//             Book
//           </button>

//           <button onClick={() => cancelBooking(room.id)}>
//             Cancel booking
//           </button>
//         </div>
//       ))}
//     </div>
//   );
// }

// Requirements

// The user can choose a minimum capacity. For example:

// Minimum capacity = 7

// means rooms with capacity below 7 must not appear.

// The "Projector required" checkbox must work together with capacity filtering. When unchecked, both projector and non-projector rooms are allowed. When checked, only:

// room.hasProjector === true

// may appear.

// However, booked rooms must never appear in the available-room list.

// So the displayed rooms are based on:

// not booked
// AND
// capacity >= minimum
// AND
// projector requirement, if enabled
// Derived summary

// Based only on the currently displayed rooms, show:

// Available rooms: X
// Total available seats: X
// Largest available room: Room Name

// For example, if the visible rooms are:

// Berlin     capacity 8
// Amsterdam  capacity 10

// then:

// Available rooms: 2
// Total available seats: 18
// Largest available room: Amsterdam

// If no rooms match:

// Available rooms: 0
// Total available seats: 0
// Largest available room: -

// and render:

// No rooms available

// instead of an empty list.

// Booking

// Clicking:

// Book

// must immutably update that room:

// booked: true

// Because booked rooms aren't displayed, the room should immediately disappear from the current list.

// This is important: do not manually remove it from some second array.

// Cancel booking

// Add a separate section underneath:

// Booked rooms

// It should display all currently booked rooms, regardless of the capacity/projector filters.

// Each booked room gets:

// Cancel booking

// Clicking it immutably changes:

// booked: false

// The room should then automatically:

// disappear from the booked section
// reappear in the available section if it matches the current filters
// UI behavior

// For available rooms, show only:

// Book

// For booked rooms, show only:

// Cancel booking
// Important design constraints

// Do not store these separately in state:

// availableRooms
// bookedRooms
// availableRoomsCount
// totalSeats
// largestRoom

// They can all be determined from existing state.

// Your actual source/mutable state should be essentially:

// rooms
// minCapacity
// projectorRequired

// No useEffect is necessary.

// Also fix:

// room.booked = true
// setRooms(rooms)

// and:

// key={room.name}

import { useMemo, useState } from "react";

export const initialRooms = [
  {
    id: 1,
    name: "Paris",
    capacity: 4,
    hasProjector: true,
    booked: false,
  },
  {
    id: 2,
    name: "Berlin",
    capacity: 8,
    hasProjector: false,
    booked: false,
  },
  {
    id: 3,
    name: "Prague",
    capacity: 12,
    hasProjector: true,
    booked: true,
  },
  {
    id: 4,
    name: "Oslo",
    capacity: 6,
    hasProjector: true,
    booked: false,
  },
  {
    id: 5,
    name: "Amsterdam",
    capacity: 10,
    hasProjector: false,
    booked: false,
  },
];

export default function MeetingRooms({ initialRooms }) {
  const [rooms, setRooms] = useState(initialRooms);
  const [minCapacity, setMinCapacity] = useState(1);
  const [projectorRequired, setProjectorRequired] = useState(false);

  const availableRooms = useMemo(() => {
    return rooms
      .filter((room) => !room.booked)
      .filter((room) => room.capacity >= minCapacity)
      .filter((room) => projectorRequired || room.hasProjector);
  }, [rooms, minCapacity, projectorRequired]);

  const bookRoom = (roomId) => {
    setRooms((prevState) =>
      prevState.map((room) =>
        room.id === roomId ? { ...room, booked: true } : room,
      ),
    );
  };

  const cancelBooking = (roomId) => {
    setRooms((prevState) =>
      prevState.map((room) =>
        room.id === roomId ? { ...room, booked: false } : room,
      ),
    );
  };

  const totalSeats = availableRooms.reduce((acc, room) => {
    acc += room.capacity;
    return acc;
  }, 0);

  const largestRoom =
    availableRooms.length > 0
      ? availableRooms.reduce((largest, room) =>
          room.capacity > largest.capacity ? room : largest,
        ).name
      : "-";

  const bookedRooms = rooms.filter((room) => room.booked);

  return (
    <div>
      <h2>Meeting Rooms</h2>

      <label>
        Minimum capacity:
        <input
          type="number"
          value={minCapacity}
          onChange={(e) => setMinCapacity(Number(e.target.value))}
        />
      </label>

      <label>
        <input
          type="checkbox"
          checked={projectorRequired}
          onChange={(e) => setProjectorRequired(e.target.checked)}
        />
        Projector required
      </label>

      <p>Available rooms: {availableRooms.length}</p>
      <p>Total available seats: {totalSeats}</p>
      <p>Largest available room: {largestRoom}</p>

      {availableRooms.length > 0
        ? availableRooms.map((room) => (
            <div key={room.id}>
              <h3>{room.name}</h3>

              <p>Capacity: {room.capacity}</p>
              <p>Projector: {room.hasProjector ? "Yes" : "No"}</p>
              <p>Status: {room.booked ? "Booked" : "Available"}</p>

              {!room.booked && (
                <button onClick={() => bookRoom(room.id)}>Book</button>
              )}

              {room.booked && (
                <button onClick={() => cancelBooking(room.id)}>
                  Cancel booking
                </button>
              )}
            </div>
          ))
        : "No rooms available"}

      <section>
        <h2>Booked rooms</h2>
        {bookedRooms.length > 0
          ? bookedRooms.map(
              (room) =>
                room.booked && (
                  <div key={room.id}>
                    <h3>{room.name}</h3>

                    <p>Capacity: {room.capacity}</p>
                    <p>Projector: {room.hasProjector ? "Yes" : "No"}</p>
                    <p>Status: {"Booked"}</p>

                    <button onClick={() => cancelBooking(room.id)}>
                      Cancel booking
                    </button>
                  </div>
                ),
            )
          : "No rooms available"}
      </section>
    </div>
  );
}
