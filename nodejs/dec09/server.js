import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server);

const PORT = 5050;

app.use(express.static("public"));

const MESSAGES_FILE = path.join(__dirname, "data/messages.json");

function loadMessages(MESSAGES_FILE) {
  try {
    if (fs.existsSync(MESSAGES_FILE)) {
      const data = fs.readFileSync(MESSAGES_FILE, "utf8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error loading messages:", error);
  }
  return { messages: [] };
}

function saveMessage(message) {
  try {
    const data = loadMessages(MESSAGES_FILE);
    data.messages.push(message);
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error saving message:", error);
  }
}

const userRooms = new Map();
const connectedUsers = new Map();
const messageCooldowns = new Map();

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  // New connection
  socket.on("join", (username) => {
    if (!username || username.trim().length === 0) {
      socket.emit("error", "Username is required");
      return;
    }
    const cleanUsername = username.trim().substring(0, 20);
    socket.username = cleanUsername;

    // Store info
    connectedUsers.set(socket.id, {
      username: cleanUsername,
      joinTime: Date.now(),
      socket: socket
    });

    const defaultRoom = "general";
    socket.join(defaultRoom);
    userRooms.set(socket.id, defaultRoom);

    // Announce join
    socket.to(defaultRoom).emit("user_joined", {
      username: cleanUsername,
      timestamp: Date.now()
    });

    // Show room history
    const data = loadMessages(MESSAGES_FILE);
    const roomMessages = data.messages.filter(msg => msg.room === defaultRoom);
    socket.emit("message_history", roomMessages);

    // Update user count
    socket.emit("user_count", connectedUsers.size);
    socket.to(defaultRoom).emit("user_count", connectedUsers.size);

    console.log(`${cleanUsername} joined room ${defaultRoom}`);
  });

  socket.on("change_room", (newRoom) => {
    if (!socket.username) {
      socket.emit("error", "Please set username first");
      return;
    }

    const oldRoom = userRooms.get(socket.id) || "general";

    socket.leave(oldRoom);
    socket.to(oldRoom).emit("user_left", {
      username: socket.username,
      timestamp: Date.now()
    });

    socket.join(newRoom);
    userRooms.set(socket.id, newRoom);

    // Show room history
    const data = loadMessages(MESSAGES_FILE);
    const roomMessages = data.messages.filter(msg => msg.room === newRoom);
    socket.emit("message_history", roomMessages);

    // Announce join
    socket.to(newRoom).emit("user_joined", {
      username: socket.username,
      timestamp: Date.now()
    });

    // Update user count
    const oldRoomUsers = Array.from(io.sockets.adapter.rooms.get(oldRoom) || []).length;
    const newRoomUsers = Array.from(io.sockets.adapter.rooms.get(newRoom) || []).length;

    socket.to(oldRoom).emit("user_count", oldRoomUsers);
    socket.to(newRoom).emit("user_count", newRoomUsers);
    socket.emit("user_count", newRoomUsers);

    console.log(`${socket.username} changed from ${oldRoom} to ${newRoom}`);
  });
  socket.on("chat_message", (messageData) => {
    if (!socket.username) {
      socket.emit("error", "Please set username first");
      return;
    }

    const message = messageData.message ? messageData.message.trim() : "";
    if (!message) {
      socket.emit("error", "Message cannot be empty");
      return;
    }

    if (message.length > 200) {
      socket.emit("error", "Message too long (max 200 characters)");
      return;
    }

    const now = Date.now();
    const lastMessageTime = messageCooldowns.get(socket.id) || 0;
    if (now - lastMessageTime < 1000) {
      socket.emit("error", "Please wait before sending another message");
      return;
    }

    messageCooldowns.set(socket.id, now);

    // Create message json
    const currentRoom = userRooms.get(socket.id) || "general";
    const messageObj = {
      user: socket.username,
      message: message,
      timestamp: now,
      room: currentRoom
    };
    saveMessage(messageObj);
    io.to(currentRoom).emit("chat_message", messageObj);
    console.log(`${socket.username} said ${message} in ${currentRoom}`)
  });

  socket.on("typing", () => {
    if (!socket.username) {
      return;
    }
    const currentRoom = userRooms.get(socket.id) || "general";
    socket.to(currentRoom).emit("typing", {
      username: socket.username
    });
  });

  socket.on("disconnect", () => {
    const user = connectedUsers.get(socket.id);
    if (user) {
      const currentRoom = userRooms.get(socket.id) || "general";

      socket.to(currentRoom).emit("user_left", {
        username: user.username,
        timestamp: Date.now()
      });

      connectedUsers.delete(socket.id);
      userRooms.delete(socket.id);
      messageCooldowns.delete(socket.id);

      socket.to(currentRoom).emit("user_count", connectedUsers.size);

      console.log(`${user.username} disconnected`);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});