router.post("/orders", authMiddleware, async (req, res, next) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "items required" });
    }
    const order = await orderService.createOrder(req.user.id, items);
    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
});

// orderService.createOrder — inside a transaction
async function createOrder(userId, items) {
  return db.transaction(async (trx) => {
    const products = await getProductsByIds(
      items.map((i) => i.productId),
      trx,
    );
    const total = calculateTotal(items, products); // server-side prices, not client-sent
    for (const item of items) {
      await decrementStock(item.productId, item.quantity, trx);
    }
    return Order.create({ userId, items, total }, trx);
  });
}
