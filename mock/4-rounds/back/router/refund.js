import { refund } from "../controller/refund";
import { authMiddleware } from "../middleware/auth";

const router = express.Router();

router.post("/orders/:id/refund", authMiddleware, refund);

module.exports = { refundRouter: router };
