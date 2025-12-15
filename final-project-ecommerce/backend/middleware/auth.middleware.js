// Purpose: Provides JWT authentication middleware and role-based access control
const { verifyToken } = require('../utils/jwt.util');
const FileManager = require('../utils/fileManager');
const usersDB = new FileManager('data/users.json');

// Verifies JWT token and attaches user data to request
async function authMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        const token = authHeader.substring(7);
        const decoded = verifyToken(token);

        if (!decoded) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }

        const user = await usersDB.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        const { password, ...userWithoutPassword } = user;
        req.user = userWithoutPassword;

        next();
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Authentication error',
            error: error.message
        });
    }
}

// Restricts access to seller and admin roles
function sellerMiddleware(req, res, next) {
    if (req.user.role !== 'seller' && req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Seller role required.'
        });
    }
    next();
}

module.exports = { authMiddleware, sellerMiddleware };