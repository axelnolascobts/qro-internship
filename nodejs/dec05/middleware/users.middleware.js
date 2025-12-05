export function validateUser(req, res, next) {
  const user = req.body;
  if (!user || typeof user !== "object") {
    return res.status(400).json({ error: "Invalid user object" });
  }
  next();
}