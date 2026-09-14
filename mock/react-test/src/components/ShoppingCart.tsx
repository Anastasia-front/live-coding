import { useState } from "react";

type Item = { id: number; name: string; price: number; quantity: number };

const initialItems: Item[] = [
  { id: 1, name: "Coffee", price: 4.5, quantity: 2 },
  { id: 2, name: "Tea", price: 3.0, quantity: 1 },
];

export function Cart() {
  const [items, setItems] = useState<Item[]>(initialItems);

  function handleQuantityChange(id: number, delta: number) {
    setItems(
      (prevItems) =>
        prevItems
          .map((item) =>
            item.id === id
              ? { ...item, quantity: item.quantity + delta }
              : item,
          )
          .filter((item) => item.quantity > 0), // remove if it hits 0
    );
  }

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return (
    <div>
      {items.map((item) => (
        <CartItem
          key={item.id}
          item={item}
          onQuantityChange={handleQuantityChange}
        />
      ))}
      <p>Total: ${total.toFixed(2)}</p>
    </div>
  );
}

type CartItemProps = {
  item: Item;
  onQuantityChange: (id: number, delta: number) => void;
};

function CartItem({ item, onQuantityChange }: CartItemProps) {
  return (
    <div>
      <span>
        {item.name} — ${item.price.toFixed(2)} x {item.quantity}
      </span>
      <button onClick={() => onQuantityChange(item.id, -1)}>−</button>
      <button onClick={() => onQuantityChange(item.id, 1)}>+</button>
    </div>
  );
}
