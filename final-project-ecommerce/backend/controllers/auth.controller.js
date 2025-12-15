const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/jwt.util');
const FileManager = require('../utils/fileManager');
const usersDB = new FileManager('data/users.json');

async function register(req, res) {
    try {
        const { name, lastname, birthdate, email, address, password, role } = req.body;

        // Validation
        if (!name || !lastname || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Name, lastname, email, and password are required'
            });
        }

        // Role validation
        const validRoles = ['customer', 'seller'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role specified'
            });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format'
            });
        }

        // Password validation
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            });
        }

        // Check if user already exists
        const existingUser = await usersDB.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const newUser = {
            id: Date.now().toString(),
            name,
            lastname,
            birthdate: birthdate || null,
            email,
            address: address || null,
            password: hashedPassword,
            role: role || 'customer',
            createdAt: new Date().toISOString()
        };

        await usersDB.append(newUser);

        // Remove password from response
        const { password: _, ...userWithoutPassword } = newUser;

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: userWithoutPassword
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Registration error',
            error: error.message
        });
    }
}

async function login(req, res) {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Find user
        const user = await usersDB.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate token
        const token = generateToken({
            userId: user.id,
            email: user.email,
            role: user.role
        });

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: userWithoutPassword
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Login error',
            error: error.message
        });
    }
}

async function validate(req, res) {
    try {
        // User is already validated by authMiddleware
        res.json({
            success: true,
            user: req.user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Validation error',
            error: error.message
        });
    }
}

module.exports = { register, login, validate };
