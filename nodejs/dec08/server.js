import express from "express";
import { Server } from "socket.io";
import cors from "cors";
import { createServer } from "http";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  path: "/socket.io"
});

app.use(cors());
app.use(express.json());

const PORT = 5050;

io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on("chat_message", (data) => {
    console.log(`Message received from ${socket.id}:`, data);
    io.emit("chat_message", {
      id: socket.id,
      message: data.message,
      timestamp: new Date().toISOString()
    });
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

app.listen(PORT, () => {
  console.log(`Server created at ${PORT}`);
});