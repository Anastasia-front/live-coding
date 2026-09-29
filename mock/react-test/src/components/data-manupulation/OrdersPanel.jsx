// export default function OrdersPanel({ initialOrders }) {
//   const [orders, setOrders] = useState(initialOrders);

//   const markAsShipped = (orderId) => {
//     const order = orders.find((order) => order.id === orderId);

//     order.status = "shipped";

//     setOrders(orders);
//   };

//   const cancelOrder = (orderId) => {
//     orders.forEach((order) => {
//       if (order.id === orderId) {
//         order.status = "cancelled";
//       }
//     });

//     setOrders(orders);
//   };

//   return (
//     <div>
//       <h2>Orders</h2>

//       <p>Total revenue: $0</p>
//       <p>Pending orders: 0</p>

//       {orders.map((order) => (
//         <div key={order.customer}>
//           <strong>{order.customer}</strong>

//           <p>
//             {order.product} — ${order.amount}
//           </p>

//           <p>Status: {order.status}</p>

//           <button onClick={() => markAsShipped(order.id)}>Mark shipped</button>

//           <button onClick={() => cancelOrder(order.id)}>Cancel</button>
//         </div>
//       ))}
//     </div>
//   );
// }

// Your task

// Fix and extend the component.

// markAsShipped(orderId) must change only that order to:

// status: "shipped"

// cancelOrder(orderId) must change only that order to:

// status: "cancelled"

// You must update React state immutably.

// Do not mutate:

// orders

// or individual order objects directly.

// The revenue line:

// <p>Total revenue: $0</p>

// must calculate total revenue from all orders except cancelled ones.

// For the initial data:

// 1200 + 300 + 150 = 1650

// So:

// Total revenue: $1650

// The pending line must show the actual number of:

// status === "pending"

// For the initial data:

// Pending orders: 2

// Add a new summary:

// Shipped revenue: $300

// This should include only:

// status === "shipped"

// orders.

// When an order is cancelled, all summary values must immediately update.

// When an order is shipped, the pending count and shipped revenue must immediately update.

// Button behavior

// If an order is already:

// status === "shipped"

// do not show:

// Mark shipped

// If an order is already:

// status === "cancelled"

// show neither action button.

// So:

// pending
// → Mark shipped + Cancel

// shipped
// → Cancel

// cancelled
// → no buttons
// Also fix the existing React problems

// There are deliberate bugs in:

// order.status = ...
// setOrders(orders)

// and:

// key={order.customer}

// Fix them appropriately.

// Do not add useEffect.

// Do not add another copy of the orders array into state.

import { useState } from "react";

export const initialOrders = [
  {
    id: 101,
    customer: "Anna",
    product: "Laptop",
    amount: 1200,
    status: "pending",
  },
  {
    id: 102,
    customer: "John",
    product: "Monitor",
    amount: 300,
    status: "shipped",
  },
  {
    id: 103,
    customer: "Kate",
    product: "Keyboard",
    amount: 150,
    status: "pending",
  },
  {
    id: 104,
    customer: "Mike",
    product: "Mouse",
    amount: 80,
    status: "cancelled",
  },
];

export default function OrdersPanel({ initialOrders }) {
  const [orders, setOrders] = useState(initialOrders);

  const handleUpdateStatus = (orderId, status) => {
    setOrders((prevState) => {
      prevState.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status,
            }
          : order,
      );
    });
  };

  const totalRevenue = orders.reduce((acc, order) => {
    if (order.status !== "cancelled") acc += order.amount;
    return acc;
  }, 0);
  const shippedRevenue = orders.reduce((acc, order) => {
    if (order.status === "shipped") acc += order.amount;
    return acc;
  }, 0);
  const pendingOrders = orders.reduce((acc, order) => {
    if (order.status === "pending") acc++;
    return acc;
  }, 0);

  return (
    <div>
      <h2>Orders</h2>

      <p>Total revenue: ${totalRevenue}</p>
      <p>Pending orders: {pendingOrders}</p>
      <p>Shipped revenue: {shippedRevenue}</p>

      {orders.map((order) => (
        <div key={order.id}>
          <strong>{order.customer}</strong>

          <p>
            {order.product} — ${order.amount}
          </p>

          <p>Status: {order.status}</p>

          {order.status === "pending" && (
            <button onClick={() => handleUpdateStatus(order.id, "shipped")}>
              Mark shipped
            </button>
          )}

          {order.status !== "cancelled" && (
            <button onClick={() => handleUpdateStatus(order.id, "cancelled")}>
              Cancel
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
