export function validateSellerRoute(req, res, next) {
  if (req.user.role !== "seller" && req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied. Seller or Admin role required" });
  }
  next();
}