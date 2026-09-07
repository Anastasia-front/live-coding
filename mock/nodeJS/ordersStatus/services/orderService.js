async function updateOrder(orderId, userId) {
  const order = await Order.find(orderId);
  if (!order) throw new NotFoundError("Order not found");

  const updateStatuses = ["pending", "processing", "shipped", "delivered"];

  const currentIndex = updateStatuses.indexOf(order.status);
  if (currentIndex === -1)
    throw new ConflictError("Order has an invalid status");
  const nextIndex = currentIndex + 1;
  if (nextIndex > updateStatuses.length) {
    throw new ConflictError("Order state is delivered, cannot changed");
  }
  const result = await db.query(
    `UPDATE orders SET status = $1 WHERE id = $2 AND userId = $3 AND status = $4 RETURNING *`,
    [updateStatuses[nextIndex], orderId, userId, order.status],
  );

  if (result.rowCount === 0) {
    throw new ConflictError("Order state changed, cannot cancel");
  }

  return result.rows[0];
}

export const orderService = { updateOrder };
