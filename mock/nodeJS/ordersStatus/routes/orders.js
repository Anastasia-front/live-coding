// app.use('/orders', ordersRouter)

router(express.Router());

router.patch("/orders/:id/status", authMiddleware, orderUpdate);
