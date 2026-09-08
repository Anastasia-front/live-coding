// app.put("/users/:id", async (req, res) => {
//   const { id } = req.params;
//   const updates = req.body;

//   await db.query(`UPDATE users SET ? WHERE id = ?`, [updates, id]);

//   res.json({ success: true });
// });

app.put("/users/:id", authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { email, phone } = req.body;

    if (req.user.id !== id && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Not authorized to update this user" });
    }
    if (!email || !phone) {
      return res.status(400).json({ error: "email and phone are required" });
    }

    const result = await db.query(
      `UPDATE users SET email = $1, phone = $2 WHERE id = $3 RETURNING id`,
      [email, phone, id],
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});
