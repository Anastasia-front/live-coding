export async function refundService(user, orderId) {
  const orderResult = await db.query(
    `SELECT id, status, deliveryDate  FROM orders WHERE id = $1 AND user_id = $2`,
    [orderId, user.id],
  );

  const order = orderResult.rows[0];
  if (!order) throw new NotFoundError("Order not found");
  const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000;
  if (
    order.status !== "delivered" &&
    Date.now() - order.deliveryDate > FOURTEEN_DAYS_MS
  )
    throw new Error(
      "Only orders delivered within the last 14 days can be refunded",
    );

  // const refund = { success: false, amount: 0 };
  // await fetch(`stripe/refund/${order.id}`)
  //   .then((res) => {
  //     if (!res.ok) throw new Error("Fetch Failed");
  //     return res.json();
  //   })
  //   .then(
  //     ({ success, amount }) => (
  //       (refund.success = success),
  //       (refund.amount = amount)
  //     ),
  //   )
  //   .catch((e) => console.error(e));

  // let result;
  // if (refund.success) {
  //   result = await db.query(
  //     "UPDATE order SET status = 'refunded' WHERE user_id = $1 AND id = $2 RETURNING *",
  //     [user.id, order.id],
  //   );
  // }
  // if (!result.rows[0]) throw new Error("No order found");
  // return result.rows[0];

  const stripeRes = await fetch(`https://api.stripe.com/refund/${order.id}`, {
    method: "POST",
  });
  if (!stripeRes.ok) throw new Error("Refund payment call failed");
  const { success, amount } = await stripeRes.json();
  if (!success) throw new Error("Payment provider declined the refund");

  const result = await db.query(
    `UPDATE orders SET status = 'refunded' WHERE id = $1 AND user_id = $2 AND status = 'delivered' RETURNING *`,
    [order.id, user.id],
  );
  if (result.rowCount === 0)
    throw new ConflictError("Order state changed, refund could not complete");

  return result.rows[0];
}
