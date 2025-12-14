import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import { specs, swaggerUi } from "./docs/swagger.js";
import authRoutes from "./routes/auth.route.js";
import productRoutes from "./routes/products.route.js";
import orderRoutes from "./routes/orders.route.js";
import { readJSON, writeJSON } from "./utils/fileHandler.js"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = 5050;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "../frontend")));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs, {
  customCss: ".swagger-ui .topbar {display: none}"
}));

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Join room
  socket.on("join-room", async ({ room, userId, userName }) => {
    socket.join(room);

    // Track connected users
    connectedUsers.set(socket.id, { userId, userName, room });

    // Get all users in the room
    const roomUsers = Array.from(connectedUsers.values())
      .filter(user => user.room === room);

    io.to(room).emit("users-update", roomUsers);

    // Load message history
    const messages = await readJSON("messages.json");
    const roomMessages = messages.filter(msg => msg.room === room);
    socket.emit("message-history", roomMessages);

    // Notify others
    socket.to(room).emit("user-joined", { userName, userId });

    console.log(`${userName} joined room: ${room}`);
  });

  // Send message
  socket.on("send-message", async ({ room, userId, userName, message }) => {
    // Check cooldown
    const now = Date.now();
    const lastMessageTime = messageCooldowns.get(userId) || 0;

    if (now - lastMessageTime < COOLDOWN_TIME) {
      socket.emit("error", { message: "Please wait before sending another message" });
      return;
    }

    messageCooldowns.set(userId, now);

    const newMessage = {
      id: Date.now().toString(),
      room,
      userId,
      userName,
      message,
      timestamp: new Date().toISOString()
    };

    // Save message to file
    const messages = await readJSON("messages.json");
    messages.push(newMessage);
    await writeJSON("messages.json", messages);

    // Broadcast message to room
    io.to(room).emit("new-message", newMessage);
  });

  // Typing indicator
  socket.on("typing-start", ({ room, userId, userName }) => {
    const typingKey = `${room}-${userId}`;
    typingUsers.set(typingKey, { userId, userName, room });

    socket.to(room).emit("user-typing", { userId, userName });
  });

  socket.on("typing-stop", ({ room, userId }) => {
    const typingKey = `${room}-${userId}`;
    typingUsers.delete(typingKey);

    socket.to(room).emit("user-stopped-typing", { userId });
  });

  // Disconnect
  socket.on("disconnect", () => {
    const user = connectedUsers.get(socket.id);

    if (user) {
      const { room, userName, userId } = user;
      connectedUsers.delete(socket.id);

      // Remove from typing users
      const typingKey = `${room}-${userId}`;
      typingUsers.delete(typingKey);

      // Update users list
      const roomUsers = Array.from(connectedUsers.values())
        .filter(u => u.room === room);

      io.to(room).emit("users-update", roomUsers);
      io.to(room).emit("user-left", { userName, userId });

      console.log(`${userName} disconnected from room: ${room}`);
    }
  });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/pages/index.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/pages/login.html"));
});

app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/pages/register.html"));
});

app.get("/catalog", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/pages/catalog.html"));
});

app.get("/product/:id", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/pages/product.html"));
});

app.get("/cart", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/pages/cart.html"));
});

app.get("/checkout", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/pages/checkout.html"));
});

app.get("/profile", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/pages/profile.html"));
});

app.get("/seller", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/pages/seller.html"));
});

app.get("/chat", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/pages/chat.html"));
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API Documentation available at http://localhost:${PORT}/api-docs`);
});