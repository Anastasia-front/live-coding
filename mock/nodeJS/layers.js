// middleware/auth.js
// function authMiddleware(req, res, next) {
//   const token = req.headers.authorization?.split(' ')[1];
//   const payload = jwt.verify(token, process.env.JWT_SECRET);
//   req.user = payload;
//   next();
// }

// // controllers/orderController.js
// async function cancelOrder(req, res, next) {
//   try {
//     const order = await Order.findById(req.params.id);

//     if (order.userId !== req.user.id) {
//       return res.status(403).json({ error: 'Not your order' }); //wrong status code
//     }

//     if (order.status === 'shipped') { // missing || order.status === 'cancelled'
//       return res.status(400).json({ error: 'Cannot cancel a shipped order' });
//     }

//     order.status = 'cancelled'; //race condition
//     await order.save();
//     await emailService.sendCancellationEmail(order.userId, order.id);

//     res.json({ success: true });
//   } catch (err) {
//     next(err);
//   }
// }

// routes/orders.js
// router.post('/orders/:id/cancel', cancelOrder); // no middleware

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

// controllers/orderController.js
async function cancelOrder(req, res, next) {
  try {
    const order = await orderService.cancelOrder(req.params.id, req.user.id);
    res.json({ success: true, order });
  } catch (err) {
    next(err);
  }
}

// routes/orders.js
router.post("/orders/:id/cancel", authMiddleware, cancelOrder);

// service — owns the business logic, DB update, and orchestration
async function cancelOrderService(orderId, userId) {
  const order = await Order.findById(orderId);
  if (!order || order.userId !== userId) {
    throw new NotFoundError("Order not found"); // controller catches and maps to 404
  }
  const cancellableStatuses = ["pending", "processing"];
  if (!cancellableStatuses.includes(order.status)) {
    throw new BadRequestError(
      `Cannot cancel an order with status: ${order.status}`,
    );
  }

  const result = await db.query(
    `UPDATE orders SET status = 'cancelled' WHERE id = $1 AND status IN ('pending','processing') RETURNING *`,
    [orderId],
  );
  if (result.rowCount === 0) {
    throw new ConflictError("Order state changed, cannot cancel");
  }

  await emailService.sendCancellationEmail(userId, orderId); // orchestration lives here
  return result.rows[0];
}
