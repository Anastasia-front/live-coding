// useSyncExternalStore subscribes React to state owned outside React.
// It is useful for browser APIs, event emitters, and state libraries that need concurrent-safe reads.
// The snapshot must be stable between changes, and subscribe must return a cleanup function.
import { useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  window.addEventListener("resize", callback);
  return () => window.removeEventListener("resize", callback);
}

function getSnapshot() {
  return window.innerWidth;
}

export function WindowWidth() {
  const width = useSyncExternalStore(subscribe, getSnapshot);

  return <div>Width: {width}</div>;
}

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

type CartSnapshot = {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
};

const emptyCart: CartSnapshot = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
};

let cartSnapshot = emptyCart;
const cartListeners = new Set<() => void>();

function createCartSnapshot(items: CartItem[]): CartSnapshot {
  return {
    items,
    totalItems: items.reduce((total, item) => total + item.quantity, 0),
    totalPrice: items.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    ),
  };
}

function updateCart(items: CartItem[]) {
  cartSnapshot = createCartSnapshot(items);
  cartListeners.forEach((listener) => listener());
}

const cartStore = {
  subscribe(listener: () => void) {
    cartListeners.add(listener);
    return () => cartListeners.delete(listener);
  },

  getSnapshot() {
    return cartSnapshot;
  },

  getServerSnapshot() {
    return emptyCart;
  },

  addItem(product: Omit<CartItem, "quantity">) {
    const existingItem = cartSnapshot.items.find(
      (item) => item.id === product.id,
    );

    if (existingItem) {
      updateCart(
        cartSnapshot.items.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        ),
      );
      return;
    }

    updateCart([...cartSnapshot.items, { ...product, quantity: 1 }]);
  },

  removeItem(productId: string) {
    updateCart(cartSnapshot.items.filter((item) => item.id !== productId));
  },

  clear() {
    updateCart([]);
  },
};

export function useShoppingCart() {
  return useSyncExternalStore(
    cartStore.subscribe,
    cartStore.getSnapshot,
    cartStore.getServerSnapshot,
  );
}

export function ShoppingCartExample() {
  const cart = useShoppingCart();

  return (
    <section>
      <button
        type="button"
        onClick={() =>
          cartStore.addItem({ id: "coffee", name: "Coffee", price: 4.5 })
        }
      >
        Add coffee
      </button>

      <p>Items: {cart.totalItems}</p>
      <p>Total: ${cart.totalPrice.toFixed(2)}</p>

      <ul>
        {cart.items.map((item) => (
          <li key={item.id}>
            {item.name} x {item.quantity}
            <button type="button" onClick={() => cartStore.removeItem(item.id)}>
              Remove
            </button>
          </li>
        ))}
      </ul>

      <button type="button" onClick={cartStore.clear}>
        Clear cart
      </button>
    </section>
  );
}
