// Purpose: Handles JWT token generation and verification for user authentication
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production-2024';
const JWT_EXPIRATION = '1h';

// Generates JWT token with expiration
function generateToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
}

// Verifies JWT token and returns payload
function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
}

module.exports = { generateToken, verifyToken, JWT_SECRET };
