import { errorMiddleware } from "./middleware/errorMiddleware";
import { reviewRouter } from "./routes/review";
const app = express();
express.json();
app.use(reviewRouter);
app.use(errorMiddleware);
