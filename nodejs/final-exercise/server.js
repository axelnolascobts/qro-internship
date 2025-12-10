// Import libraries
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { join } = require('path');
const path = require('path');
const fs = require('fs').promises;

// Server Setup
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Files in /public can be served directly
app.use(express.static(join(__dirname, "public")));

// Route handler, if user goes to '/', send index.html
app.get("/", (req, res) => {
    res.sendFile(join(__dirname, "public", "index.html"));
});

// Setup history of messages:
// Path to messages.json
const dataFile = join(__dirname, "data", "messages.json");
let history = {
    general: [],
    random: []
};

// Load history into memory
async function loadHistory() {
    try {
        const raw = await fs.readFile(dataFile, "utf-8");
        history = JSON.parse(raw);
    }
    // If file doesn't exist, default empty history
    catch {
        history = { general: [], random: [] };
    }
}

// When message arrives, save history object
async function saveHistory() {
    await fs.writeFile(
        dataFile,
        JSON.stringify(history, null, 2)
    );
}

loadHistory();

// 1 sec cooldown tracking object
const lastMessageTime = {};

// socket events
io.on("connection", (socket) => {
    // New connection variables
    let currentRoom = null;
    let currentUser = null;

    // User join event
    socket.on("join", ({ username, room }) => {
        currentRoom = room;
        currentUser = username;
        socket.join(room);

        // send history for that room
        socket.emit("history", history[room]);

        // announce
        socket.to(room).emit("user_joined", username);
    });

    // User chat message event
    socket.on("chat_message", async (msg) => {

        // validation server-side (not empty and text length <= 200)
        if (!msg.text || msg.text.length > 200) return;

        // cooldown enforcement
        const now = Date.now();
        const last = lastMessageTime[socket.id] || 0;
        if (now - last < 1000) return; // <1 second
        lastMessageTime[socket.id] = now;

        // New message object
        const data = {
            username: msg.username,
            text: msg.text,
            timestamp: Date.now()
        };

        // Add & save message to history of room
        history[currentRoom].push(data);
        await saveHistory();

        // Emit message to all users in the same room
        io.to(currentRoom).emit("chat_message", data);
    });

    // User typing event
    socket.on("typing", ({ username }) => {
        socket.to(currentRoom).emit("typing", { username });
    });

    // User leave event
    socket.on("leave", () => {
        // Remove socket
        socket.leave(currentRoom);
        //Notify other users in room
        socket.to(currentRoom).emit("user_left", currentUser);
        // Clear username and room, server-side
        currentRoom = null;
        currentUser = null;
    });

    // User disconnect event
    socket.on("disconnect", () => {
        // If user closes browser, and we know their username and room, emit.
        if (currentRoom && currentUser) {
            socket.to(currentRoom).emit("user_left", currentUser);
        }
    });
});

// Listener for terminal
const PORT = 3000;
server.listen(PORT, () =>
    console.log(`http://localhost:${PORT}`)
);
