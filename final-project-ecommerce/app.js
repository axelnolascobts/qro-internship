/*
Purpose: The Express Server. It helps setup the server, ports, 
middleware, route handler, paths, and start the server.
 */

// Imports
require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const authRoutes = require('./src/routes/authRoutes');

// Server Setup
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});

// Port
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Authenticate users/routes
app.use('/api/auth', authRoutes);

// Static frontend
app.use(express.static(path.join(__dirname, 'public')));

// Placeholder route handler
app.get('/api/health', (req, res) => {
    res.json({ status: "ok" });
});

// Placeholder socket namespace
io.of('/ws/support').on('connection', (socket) => {
    console.log("New WebSocket client connected");
});

// Start server and show it
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
