// app.get('/dashboard/:userId', async (req, res) => {
//   const { userId } = req.params;

//   const user = User.findById(userId);
//   const orders = await Order.find({ userId });

//   for (const order of orders) {
//     order.items = await OrderItem.find({ orderId: order.id });
//   }

//   res.json({ user, orders });
// });

app.get("/dashboard/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;

    const [user, orders] = await Promise.all([
      User.findById(userId),
      Order.find({ userId }),
    ]);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const orderIds = orders.map((o) => o.id);
    const allItems = await OrderItem.find({ orderId: { $in: orderIds } }); // 1 query instead of N
    const itemsByOrderId = allItems.reduce((acc, item) => {
      (acc[item.orderId] ||= []).push(item);
      return acc;
    }, {});

    orders.forEach((order) => {
      order.items = itemsByOrderId[order.id] || [];
    });

    res.json({ user, orders });
  } catch (err) {
    next(err);
  }
});
