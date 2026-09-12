export function authMiddleware(req, res, next) {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    req.user = jwt.verify(token, JWT_SECRET);
    res.json(req.user);
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}
