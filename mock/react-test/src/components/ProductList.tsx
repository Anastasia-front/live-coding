import React, { useCallback, useMemo } from "react";

type Product = { id: number; name: string; price: number };

export function ProductList({
  products,
  onSelect,
}: {
  products: Product[];
  onSelect: (id: number) => void;
}) {
  const expensiveTotal = useMemo(() => {
    return products.reduce((sum, p) => sum + p.price, 0);
  }, [products]);

  const handleSelect = useCallback(
    (id: number) => {
      onSelect(id);
    },
    [onSelect],
  );

  return (
    <div>
      <p>Total: {expensiveTotal}</p>
      {products.map((p) => (
        <ProductRow key={p.id} product={p} onSelect={handleSelect} />
      ))}
    </div>
  );
}

const ProductRow = React.memo(function ProductRow({
  product,
  onSelect,
}: {
  product: Product;
  onSelect: (id: number) => void;
}) {
  console.log("rendering", product.name);
  return <button onClick={() => onSelect(product.id)}>{product.name}</button>;
});
