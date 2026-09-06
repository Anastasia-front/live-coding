import { createReview as createReviewService } from "../services/reviewService";

export async function createReview(req, res, next) {
  try {
    const review = await createReviewService(req.body, req.user);
    res.status(201).json(review);
  } catch (e) {
    next(e);
  }
}
