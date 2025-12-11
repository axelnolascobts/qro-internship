/*
Purpose: Authentication for registering, loging in, and validation.
*/

const bcrypt = require('bcrypt');
const { v4: uuid } = require('uuid');
const { readJSON, writeJSON } = require('../services/fileService');
const { generateToken, verifyToken } = require('../services/tokenService');

// -------- Helper validation -----------
function validateUserInput(user) {
    if (!user.name || !user.lastname) return "Name and lastname are required";
    if (!user.email || !user.email.includes("@")) return "Valid email required";
    if (!user.password || user.password.length < 6) return "Password too short";
    if (!user.birthdate) return "Birthdate required";
    if (!user.address) return "Address required";
    return null;
}

// -------- REGISTER -----------
async function register(req, res) {
    const { name, lastname, birthdate, email, address, password } = req.body;

    const error = validateUserInput({ name, lastname, birthdate, email, address, password });
    if (error) return res.status(400).json({ error });

    const users = await readJSON('users.json');

    const exists = users.find(u => u.email === email);
    if (exists) return res.status(400).json({ error: "Email already registered" });

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = {
        id: uuid(),
        name,
        lastname,
        birthdate,
        email,
        address,
        passwordHash,
        role: "customer",
        createdAt: new Date().toISOString()
    };

    users.push(newUser);
    await writeJSON('users.json', users);

    res.json({ message: "User registered successfully" });
}

// -------- LOGIN -----------
async function login(req, res) {
    const { email, password } = req.body;

    const users = await readJSON('users.json');
    const user = users.find(u => u.email === email);

    if (!user) return res.status(400).json({ error: "Invalid email or password" });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(400).json({ error: "Invalid email or password" });

    const token = generateToken({ id: user.id, role: user.role });

    res.json({
        token,
        user: {
            id: user.id,
            name: user.name,
            lastname: user.lastname,
            email: user.email,
            role: user.role
        }
    });
}

// -------- VALIDATE TOKEN -----------
function validate(req, res) {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ error: "No token" });

    const [, token] = header.split(" ");

    try {
        const decoded = verifyToken(token);
        res.json({ valid: true, user: decoded });
    } catch (err) {
        res.status(401).json({ valid: false, error: "Invalid or expired token" });
    }
}

module.exports = { register, login, validate };
