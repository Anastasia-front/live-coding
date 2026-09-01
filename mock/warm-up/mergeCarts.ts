export type CartItem = { productId: number; quantity: number };

export const mergeCarts = (
  cart1: CartItem[],
  cart2: CartItem[],
): CartItem[] => {
  const mergedArrays = [...cart1, ...cart2];
  const result = mergedArrays.reduce(
    (acc: Record<number, number>, item: CartItem) => {
      acc[item.productId] = (acc[item.productId] || 0) + item.quantity;
      return acc;
    },
    {},
  );

  return Object.entries(result).map(([productId, quantity]) => ({
    productId: Number(productId),
    quantity,
  }));
};

// Related example:
// const cart1: CartItem[] = [
//   { productId: 1, quantity: 2 },
//   { productId: 2, quantity: 1 },
// ];
//
// const cart2: CartItem[] = [
//   { productId: 2, quantity: 3 },
//   { productId: 3, quantity: 5 },
// ];
//
// console.log(mergeCarts(cart1, cart2));
// Output: [{ productId: 1, quantity: 2 }, { productId: 2, quantity: 4 }, { productId: 3, quantity: 5 }]
