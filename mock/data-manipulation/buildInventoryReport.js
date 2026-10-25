const products = [
  { id: 1, name: "Laptop", categoryId: 10, active: true },
  { id: 2, name: "Monitor", categoryId: 10, active: true },
  { id: 3, name: "Chair", categoryId: 20, active: true },
  { id: 4, name: "Desk", categoryId: 20, active: false },
  { id: 5, name: "Keyboard", categoryId: 10, active: true },
  { id: 6, name: "Lamp", categoryId: 30, active: true },
];

const categories = [
  { id: 10, name: "Electronics" },
  { id: 20, name: "Furniture" },
  { id: 30, name: "Lighting" },
];

const movements = [
  { id: 101, productId: 1, type: "in", quantity: 5, unitPrice: 1000 },
  { id: 102, productId: 1, type: "out", quantity: 2, unitPrice: 1000 },
  { id: 103, productId: 2, type: "in", quantity: 10, unitPrice: 300 },
  { id: 104, productId: 2, type: "out", quantity: 4, unitPrice: 300 },
  { id: 105, productId: 3, type: "in", quantity: 8, unitPrice: 150 },
  { id: 106, productId: 3, type: "out", quantity: 3, unitPrice: 150 },
  { id: 107, productId: 4, type: "in", quantity: 6, unitPrice: 400 },
  { id: 108, productId: 5, type: "in", quantity: 20, unitPrice: 50 },
  { id: 109, productId: 5, type: "out", quantity: 5, unitPrice: 50 },
  { id: 110, productId: 6, type: "in", quantity: 7, unitPrice: 80 },
  { id: 111, productId: 6, type: "out", quantity: 2, unitPrice: 80 },
];

function buildInventoryReport(products, categories, movements, valueLimit) {
  const productById = {};
  for (const product of products) {
    productById[product.id] = product;
  }
  const categoryById = {};
  for (const category of categories) {
    categoryById[category.id] = category;
  }
  const movementById = {};
  for (const movement of movements) {
    const { productId, type, quantity, unitPrice } = movement;
    const currentProduct = productById[productId];
    if (!currentProduct) continue;

    const { name, categoryId, active } = currentProduct;
    if (!active) continue;

    const currentCategory = categoryById[categoryId];
    if (!currentCategory) continue;

    if (!movementById[categoryId]) {
      movementById[categoryId] = {
        category: currentCategory.name,
        stockQuantity: 0,
        stockValue: 0,
        totalMovements: 0,
        uniqueProducts: new Set(),
        mostStockedProduct: {},
        hasOutOfStockProduct: false,
        averageUnitValue: 0,
      };
    }

    const stats = movementById[categoryId];

    switch (type) {
      case "in":
        stats.stockQuantity += quantity;
        stats.stockValue += quantity * unitPrice;
        stats.mostStockedProduct[productId] += quantity;
        break;

      case "out":
        stats.stockQuantity -= quantity;
        stats.stockValue -= quantity * unitPrice;
        stats.mostStockedProduct[productId] -= quantity;
        break;

      default:
        continue;
    }

    stats.totalMovements += 1;
    stats.uniqueProducts.add(productId);

    if (!stats.mostStockedProduct[productId]) {
      stats.mostStockedProduct[productId] = 0;
    }
  }

  const summary = Object.values(movementById)
    .map((item) => {
      const mostStockedProductId = Object.keys(item.mostStockedProduct).find(
        (key) =>
          item.mostStockedProduct[key] ===
          Math.max(...Object.values(item.mostStockedProduct)),
      );

      return {
        category: item.category,
        stockQuantity: item.stockQuantity,
        stockValue: item.stockValue,
        totalMovements: item.totalMovements,
        uniqueProducts: item.uniqueProducts.size,
        mostStockedProduct: productById[mostStockedProductId]?.name,
        hasOutOfStockProduct: Object.values(item.mostStockedProduct).some(
          (quantity) => quantity <= 0,
        ),
        averageUnitValue:
          item.stockQuantity === 0
            ? 0
            : Number((item.stockValue / item.stockQuantity).toFixed(2)),
      };
    })
    .sort((a, b) => b.stockValue - a.stockValue);

  const result = [];
  let totalValue = 0;
  for (const item of summary) {
    if (totalValue >= valueLimit) break;
    totalValue += item.stockValue;
    result.push(item);
  }

  return result;
}

console.log(buildInventoryReport(products, categories, movements, 5000));

// Requirements:

// Ignore movements belonging to inactive products.
// Ignore movements with an unknown productId.
// Ignore products whose categoryId does not exist in categories.
// For each category, calculate the current stock based on movements:
// "in"  → adds quantity
// "out" → subtracts quantity
// Return one object per category that has at least one valid movement.

// Each object must have this shape:

// {
//   category: "Electronics",
//   stockQuantity: 24,
//   stockValue: 5700,
//   totalMovements: 6,
//   uniqueProducts: 3,
//   mostStockedProduct: "Keyboard",
//   hasOutOfStockProduct: false,
//   averageUnitValue: 237.5
// }

// Definitions:

// stockQuantity — total current quantity across all products in that category.

// stockValue — sum of:

// current product quantity * unitPrice

// for every product in the category.

// totalMovements — total number of valid movements for the category.

// uniqueProducts — number of unique products that had at least one valid movement.

// mostStockedProduct — product with the highest final current quantity in that category.

// hasOutOfStockProduct — true if at least one product in that category finishes with:

// quantity <= 0

// averageUnitValue —:

// stockValue / stockQuantity

// rounded to 2 decimals.

// If stockQuantity === 0, return:

// averageUnitValue: 0
// Assume all movements for a product use the same unitPrice.
// Sort categories by:
// stockValue

// descending.

// After sorting, return categories only until cumulative stockValue becomes greater than or equal to:
// valueLimit

// Example:

// buildInventoryReport(products, categories, movements, 5000);

// If the sorted category values are:

// Electronics: 4950
// Furniture: 750
// Lighting: 400

// return:

// Electronics
// Furniture

// because:

// 4950 + 750 = 5700 >= 5000
// If valueLimit is larger than the total value of all categories, return all categories.
// Your function must not crash on malformed references such as:
// { productId: 999, ... }

// or products with an unknown category.
