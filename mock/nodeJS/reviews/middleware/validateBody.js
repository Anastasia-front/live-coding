function validateBody(req, res, next) {
  const { productId, rating, comment } = req.body;

  try {
    if (!productId) {
      throw new BadRequestError("No productId provided");
    }
    if (!rating) {
      throw new BadRequestError("No rating provided");
    }
    if (parseInt(rating) < 1 || parseInt(rating) > 5) {
      throw new BadRequestError("Rating must be between 1 and 5");
    }
    if (comment && comment.length > 500) {
      throw new BadRequestError("Comment must be 500 characters or fewer");
    }
    next();
  } catch (e) {
    next(e);
  }
}
