/*
Purpose: JWT helpers, for web token generation and verification.
*/

const jwt = require('jsonwebtoken');
require('dotenv').config();

const secret = process.env.JWT_SECRET;
const express_in = process.env.JWT_EXPIRES_IN || '1h';

function generateToken(payload) {
    return jwt.sign(payload, secret, { expiresIn: express_in });
}

function verifyToken(token) {
    return jwt.verify(token, secret);
}

module.exports = { generateToken, verifyToken };
