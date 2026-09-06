const reviewRouter = express.Router();

reviewRouter.post("/reviews", authMiddleware, validateBody, createReview);

module.exports = { reviewRouter };
