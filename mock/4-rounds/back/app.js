import { refundRouter } from "./router/refund";

const app = express();
app.use(express.json());
app.use(refundRouter);
app.use((err, req, res, next) => {
  const { status = 500, message = "server error" } = err;
  res.status(status).json({ message });
});
