// Imports
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');

// Server setup
const app = express();
const server = createServer(app); // HTTP Server
const io = new Server(server);    // Connect Socket io


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Socket logic
io.on("connection", (socket) => {
    console.log(`Client ${socket.id} connected.`);

    socket.on("chat_message", (data) => {
        console.log("Msg received:", data);

        io.emit("chat_message", data);
    });

    socket.on("disconnect", () => {
        console.log(`Client ${socket.id} disconnected.`);
    });
});

// Route for server
app.get('/', (require, response) => {
    response.send('Server running');
});

// Check if server's running
server.listen(3000, () => {
    console.log("Server running on: http://localhost:3000");
});