export function errorMiddleware(err, req, res, next) {
  console.error(err);
  const statusCode = err.status || 500;
  const errorMessage = err.status ? err.message : "internal server error";

  res.status(statusCode).json({ error: errorMessage });
}
