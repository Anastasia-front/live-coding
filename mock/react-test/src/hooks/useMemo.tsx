// useMemo memoizes a calculated value between renders.
// It is useful for avoiding repeated expensive calculations or preserving derived object identity.
// It is a performance hint, not a semantic guarantee, and dependencies must include every reactive input.
import { useMemo } from "react";

type Product = {
  price: number;
};

type ProductTotalProps = {
  products: Product[];
};

export function ProductTotal({ products }: ProductTotalProps) {
  const total = useMemo(
    () => products.reduce((sum, product) => sum + product.price, 0),
    [products],
  );

  return <div>Total: {total}</div>;
}
