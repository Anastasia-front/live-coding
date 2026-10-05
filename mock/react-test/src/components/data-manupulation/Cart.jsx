// import { useState } from "react";

// export default function Cart({ initialItems }) {
//   const [items, setItems] = useState(initialItems);

//   const increaseQuantity = (productId) => {
//     const item = items.find((item) => item.id === productId);
//     item.quantity++;

//     setItems(items);
//   };

//   const decreaseQuantity = (productId) => {
//     const item = items.find((item) => item.id === productId);
//     item.quantity--;

//     setItems(items);
//   };

//   const toggleSelected = (productId) => {
//     const item = items.find((item) => item.id === productId);
//     item.selected = !item.selected;

//     setItems(items);
//   };

//   return (
//     <div>
//       <h2>Shopping Cart</h2>

//       <p>Selected items: 0</p>
//       <p>Subtotal: $0</p>
//       <p>Discount: $0</p>
//       <p>Total: $0</p>

//       {items.map((item) => (
//         <div key={item.name}>
//           <input
//             type="checkbox"
//             checked={item.selected}
//             onChange={() => toggleSelected(item.id)}
//           />

//           <strong>{item.name}</strong>

//           <p>
//             ${item.price} × {item.quantity}
//           </p>

//           <button onClick={() => decreaseQuantity(item.id)}>-</button>

//           <button onClick={() => increaseQuantity(item.id)}>+</button>
//         </div>
//       ))}
//     </div>
//   );
// }

// Requirements
// 1. Quantity updates

// + increases the quantity of only the clicked item.

// - decreases its quantity.

// But quantity must never go below:

// 1

// So if quantity is already 1, disable the - button.

// All state updates must be immutable.

// 2. Selecting items

// Checkboxes must toggle:

// selected

// Only selected items contribute to the cart summary.

// 3. Selected item count

// Display:

// Selected items: X

// But count units, not products.

// For example:

// Laptop quantity = 1
// Monitor quantity = 2
// Mouse quantity = 3

// means:

// Selected items: 6
// 4. Subtotal

// For selected items:

// price × quantity

// Initial selected subtotal:

// Laptop:  1200 × 1 = 1200
// Monitor:  300 × 2 = 600
// Mouse:      80 × 3 = 240

// Subtotal = 2040
// 5. Discounts

// Each product has its own:

// discountPercent

// Discount for an item is:

// price × quantity × discountPercent / 100

// Only selected items count.

// Initially:

// Laptop discount = 120
// Monitor discount = 0
// Mouse discount = 0

// So:

// Discount: $120
// 6. Final total
// total = subtotal - discount

// Initially:

// Total: $1920
// 7. Remove an item

// Add:

// Remove

// button to every product.

// Clicking it removes that product entirely from the cart.

// Do not mutate the existing array.

// 8. Select all

// Add a checkbox:

// ☑ Select all

// Behavior:

// if checked → every item becomes selected
// if unchecked → every item becomes unselected

// Its checked state must reflect the current cart.

// For example, if all four items are selected:

// checked === true

// If even one isn't selected:

// checked === false

// Do not create a separate selectAll state if it can be determined from items.

// 9. Empty cart

// If every item has been removed, show:

// Your cart is empty

// instead of the item list.

// Summary values should then naturally be:

// Selected items: 0
// Subtotal: $0
// Discount: $0
// Total: $0
// 10. Fix existing React problems

// The existing component deliberately contains problems with:

// item.quantity++
// item.selected = ...
// setItems(items)

// and:

// key={item.name}

// Fix them properly.

// Constraints

// Do not use useEffect.

// Do not keep subtotal, discount, total, selected count, or selectAll in separate state.

// Only items should be state.

import { useRef, useState } from "react";

export const initialItems = [
  {
    id: 1,
    name: "Laptop",
    price: 1200,
    quantity: 1,
    selected: true,
    discountPercent: 10,
  },
  {
    id: 2,
    name: "Monitor",
    price: 300,
    quantity: 2,
    selected: true,
    discountPercent: 0,
  },
  {
    id: 3,
    name: "Keyboard",
    price: 150,
    quantity: 1,
    selected: false,
    discountPercent: 20,
  },
  {
    id: 4,
    name: "Mouse",
    price: 80,
    quantity: 3,
    selected: true,
    discountPercent: 0,
  },
];

export default function Cart({ initialItems }) {
  const [items, setItems] = useState(initialItems);
  const selectAllRef = useRef(null);

  const increaseQuantity = (productId) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId ? { ...item, quantity: item.quantity + 1 } : item,
      ),
    );
  };

  const decreaseQuantity = (productId) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId && item.quantity >= 2
          ? { ...item, quantity: item.quantity - 1 }
          : item,
      ),
    );
  };

  const toggleSelected = (productId) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId ? { ...item, selected: !item.selected } : item,
      ),
    );
  };

  const removeItem = (productId) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== productId));
  };

  const selectedItems = items.reduce((acc, item) => {
    if (item.selected) acc += item.quantity;
    return acc;
  }, 0);

  const subtotal = items.reduce((acc, item) => {
    if (item.selected) acc += item.price * item.quantity;
    return acc;
  }, 0);

  const discount = items.reduce((acc, item) => {
    if (item.selected)
      acc += (item.price * item.quantity * item.discountPercent) / 100;
    return acc;
  }, 0);

  const allSelected = items.length > 0 && items.every((item) => item.selected);

  const toggleAllSelected = () => {
    setItems((prevItems) =>
      prevItems.map((item) => ({ ...item, selected: !allSelected })),
    );
  };

  return (
    <div>
      <h2>Shopping Cart</h2>

      <p>Selected items:{selectedItems}</p>
      <p>Subtotal: ${subtotal}</p>
      <p>Discount: ${discount}</p>
      <p>Total: ${subtotal - discount}</p>
      <input
        type="checkbox"
        ref={selectAllRef}
        checked={allSelected}
        onChange={toggleAllSelected}
      />

      {items.length > 0 &&
        items.map((item) => (
          <div key={item.id}>
            <input
              type="checkbox"
              checked={item.selected}
              onChange={() => toggleSelected(item.id)}
            />

            <strong>{item.name}</strong>

            <p>
              ${item.price} × {item.quantity}
            </p>

            <button
              onClick={() => decreaseQuantity(item.id)}
              disabled={item.quantity === 1}
            >
              -
            </button>

            <button onClick={() => increaseQuantity(item.id)}>+</button>

            <button onClick={() => removeItem(item.id)}>Remove</button>
          </div>
        ))}
    </div>
  );
}
