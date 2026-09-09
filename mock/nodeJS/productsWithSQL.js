// app.get('/products', async (req, res) => {
//   const { category, sortBy } = req.query;

//   const query = `SELECT * FROM products WHERE category = '${category}' ORDER BY ${sortBy}`;
//   const products = await db.query(query);

//   res.json(products);
// });

app.get("/products", async (req, res, next) => {
  try {
    const { category, sortBy } = req.query;
    if (!category) {
      return res.status(400).json({ error: "category is required" });
    }

    const allowedSortColumns = ["price", "name", "created_at"];
    const safeSortBy = allowedSortColumns.includes(sortBy) ? sortBy : "name";

    const products = await db.query(
      `SELECT id, name, price FROM products WHERE category = $1 ORDER BY ${safeSortBy} LIMIT 20`,
      [category],
    );
    res.json(products); // [] if none found — that's a valid 200 response
  } catch (err) {
    next(err);
  }
});

// with limit, offset
app.get("/products", async (req, res, next) => {
  try {
    const { category, sortBy } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const allowedSortColumns = ["price", "name", "created_at"];
    const safeSortBy = allowedSortColumns.includes(sortBy) ? sortBy : "name";

    const products = await db.query(
      `SELECT id, name, price FROM products
       WHERE category = $1
       ORDER BY ${safeSortBy}
       LIMIT $2 OFFSET $3`,
      [category, limit, offset],
    );

    res.json({ page, limit, products });
  } catch (err) {
    next(err);
  }
});

// with limit, cursor
app.get("/products", async (req, res, next) => {
  try {
    const { category, sortBy, cursor } = req.query;
    const limit = parseInt(req.query.limit) || 20;

    const products = await db.query(
      `SELECT id, name, price FROM products
       WHERE category = $1 AND id > $2
       ORDER BY id ASC
       LIMIT $3`,
      [category, cursor || 0, limit],
    );

    const nextCursor =
      products.length > 0 ? products[products.length - 1].id : null;
    res.json({ products, nextCursor });
  } catch (err) {
    next(err);
  }
});
