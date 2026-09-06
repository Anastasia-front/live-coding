export const createReview = async (
  { productId, rating, comment },
  { id: userId },
) => {
  const product = await db.query("SELECT id FROM products WHERE id = $1", [
    productId,
  ]);
  if (!product.rows[0]) throw new NotFoundError();
  const review = await db.query(
    "SELECT user_id FROM reviews WHERE user_id = $1 AND id = $2",
    [userId, productId],
  );
  if (review.rows[0]) throw new ConflictError();

  const result = await db.query(
    `INSERT INTO reviews (product_id, user_id, rating, comment) VALUES ($1, $2, $3, $4) RETURNING *`,
    [productId, userId, rating, comment],
  );
  return result;
};
