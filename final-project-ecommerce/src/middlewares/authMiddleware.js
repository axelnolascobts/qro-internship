/*
Purpose: Authentication to protect routes.
*/
const { verifyToken } = require('../services/tokenService');

function authRequired(req, res, next) {
    const header = req.headers.authorization;

    if (!header) {
        return res.status(401).json({ error: "No token provided" });
    }

    const [type, token] = header.split(" ");

    if (type !== "Bearer" || !token) {
        return res.status(401).json({ error: "Invalid token format" });
    }

    try {
        const decoded = verifyToken(token);
        req.user = decoded;     // Store user payload (id, role)
        next();
    } catch (err) {
        return res.status(401).json({ error: "Invalid or expired token" });
    }
}

function requireSeller(req, res, next) {
    if (req.user.role !== "seller" && req.user.role !== "admin") {
        return res.status(403).json({ error: "Seller or admin role required" });
    }
    next();
}

module.exports = { authRequired, requireSeller };
