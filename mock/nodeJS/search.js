// app.get("/search", async (req, res) => {
//   const { q } = req.query;

//   const cacheKey = `search:${q}`;
//   let results = cache.get(cacheKey); //(cache poisoning / memory exhaustion)

//   if (!results) {
//     results = await Product.find({ name: { $regex: q, $options: "i" } }); // q - ReDoS (Regular Expression Denial of Service), i is a flag meaning "case-insensitive."
//     cache.set(cacheKey, results, 3600); // cache for 1 hour - need to use cache invalidation
//   }

//   res.json(results);
// });

app.get("/search", async (req, res, next) => {
  try {
    const { q } = req.query;
    if (typeof q !== "string" || q.trim().length === 0 || q.length > 100) {
      return res.status(400).json({ error: "Invalid search query" });
    }

    const safeQuery = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // escape regex special chars
    const cacheKey = `search:${safeQuery.toLowerCase()}`;

    let results = cache.get(cacheKey);
    if (!results) {
      results = await Product.find({
        name: { $regex: safeQuery, $options: "i" },
      });
      cache.set(cacheKey, results, 3600);
      //"I'd confirm with the team how fresh search results need to be —
      // if prices/stock must be exact, I'd either shorten the TTL,
      // or invalidate the cache explicitly whenever a product
      // is created/updated/deleted (e.g., a cache-busting call inside the product update service)."
    }

    res.json(results);
  } catch (err) {
    next(err);
  }
});
