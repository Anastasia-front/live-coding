// app.post('/products/:id/purchase', async (req, res) => {
//   const { id } = req.params;
//   const { quantity } = req.body;

//   const product = await Product.findById(id);

//   if (product.stock < quantity) {
//     return res.status(400).json({ error: 'Not enough stock' });
//   }

//   product.stock = product.stock - quantity; //race condition
//   await product.save();

//   res.json({ success: true, remainingStock: product.stock });
// });

app.post("/products/:id/purchase", authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (!Number.isInteger(quantity) || quantity <= 0) {
      return res
        .status(400)
        .json({ error: "quantity must be a positive integer" });
    }

    const result = await db.query(
      `UPDATE products
       SET stock = stock - $1
       WHERE id = $2 AND stock >= $1
       RETURNING stock`,
      [quantity, id],
    );

    if (result.rowCount === 0) {
      const exists = await db.query(`SELECT id FROM products WHERE id = $1`, [
        id,
      ]);
      if (exists.rowCount === 0) {
        return res.status(404).json({ error: "Product not found" });
      }
      return res.status(409).json({ error: "Not enough stock" });
    }

    res.json({ success: true, remainingStock: result.rows[0].stock });
  } catch (err) {
    next(err);
  }
});
