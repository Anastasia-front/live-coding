const products = [
  { id: 1, name: "Laptop", category: "electronics", price: 1200 },
  { id: 2, name: "Phone", category: "electronics", price: 800 },
  { id: 3, name: "Desk", category: "furniture", price: 500 },
  { id: 4, name: "Chair", category: "furniture", price: 250 },
  { id: 5, name: "Headphones", category: "electronics", price: 200 },
];

const sales = [
  { productId: 1, quantity: 2 },
  { productId: 2, quantity: 3 },
  { productId: 1, quantity: 1 },
  { productId: 4, quantity: 4 },
  { productId: 5, quantity: 5 },
  { productId: 2, quantity: 1 },
];

function getProductSales(products, sales) {
  const productSummary = {};
  for (const product of products) {
    const { id, name, category, price } = product;
    if (!productSummary[product]) {
      productSummary[product.name] = {
        name,
        category,
        totalQuantity: 0,
        revenue: 0,
      };
    }
    for (const sale of sales) {
      const { productId, quantity } = sale;

      if (productId !== id) continue;
      productSummary[product.name].totalQuantity += quantity;
      console.log(
        "productSummary[product.name].totalQuantity",
        productSummary[product.name].totalQuantity,
      );
    }
    productSummary[product.name].revenue =
      productSummary[product.name].totalQuantity * price;
    console.log(
      "productSummary[product.name].revenue",
      productSummary[product.name].revenue,
    );
  }

  return Object.values(productSummary)
    .filter((product) => product.totalQuantity > 0)
    .sort((a, b) => b.revenue - a.revenue);
}

console.log(getProductSales(products, sales));

// Return only products that have at least one sale.
// For each product return:
// name
// category
// totalQuantity
// revenue
// revenue = price * totalQuantity
// Sort by revenue descending.

// Expected result:

// [
//   {
//     name: "Laptop",
//     category: "electronics",
//     totalQuantity: 3,
//     revenue: 3600,
//   },
//   {
//     name: "Phone",
//     category: "electronics",
//     totalQuantity: 4,
//     revenue: 3200,
//   },
//   {
//     name: "Headphones",
//     category: "electronics",
//     totalQuantity: 5,
//     revenue: 1000,
//   },
//   {
//     name: "Chair",
//     category: "furniture",
//     totalQuantity: 4,
//     revenue: 1000,
//   },
// ]
