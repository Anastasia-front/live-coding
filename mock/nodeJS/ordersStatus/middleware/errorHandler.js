function errorHandler(err, req, res, next) {
  console.error(err); // always log server-side, even for "expected" errors

  const statusCode = err.statusCode || 500;
  const message = err.statusCode ? err.message : "Internal server error"; // don't leak raw error details for unexpected 500s

  res.status(statusCode).json({ error: message });
}

module.exports = errorHandler;
