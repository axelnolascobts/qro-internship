let socket = null;
let currentRoom = "general";
let typingTimeout = null;
let isTyping = false;

async function initChat() {
  if (!requireAuth()) return;

  const user = getUser();

  // Connect to Socket.io
  socket = io("http://localhost:5050");

  socket.on("connect", () => {
    console.log("Connected to chat server");
    joinRoom(currentRoom);
    enableChat();
  });

  socket.on("disconnect", () => {
    console.log("Disconnected from chat server");
    disableChat();
  });

  socket.on("message-history", (messages) => {
    const chatMessages = document.getElementById("chatMessages");
    chatMessages.innerHTML = "";
    messages.forEach(msg => displayMessage(msg));
  });

  socket.on("new-message", (message) => {
    displayMessage(message);
  });

  socket.on("users-update", (users) => {
    document.getElementById("usersList").textContent = `Connected users: ${users.length}`;
  });

  socket.on("user-joined", (data) => {
    displaySystemMessage(`${data.userName} joined the chat`);
  });

  socket.on("user-left", (data) => {
    displaySystemMessage(`${data.userName} left the chat`);
  });

  socket.on("user-typing", (data) => {
    const user = getUser();
    if (data.userId !== user.id) {
      document.getElementById("typingIndicator").textContent = `${data.userName} is typing...`;
      document.getElementById("typingIndicator").classList.remove("hidden");
    }
  });

  socket.on("user-stopped-typing", (data) => {
    document.getElementById("typingIndicator").classList.add("hidden");
  });

  socket.on("error", (data) => {
    alert(data.message);
  });
}

function joinRoom(room) {
  const user = getUser();
  currentRoom = room;

  socket.emit("join-room", {
    room,
    userId: user.id,
    userName: `${user.name} ${user.lastname}`
  });
}

function enableChat() {
  document.getElementById("messageInput").disabled = false;
  document.getElementById("sendBtn").disabled = false;
}

function disableChat() {
  document.getElementById("messageInput").disabled = true;
  document.getElementById("sendBtn").disabled = true;
}

function displayMessage(message) {
  const user = getUser();
  const chatMessages = document.getElementById("chatMessages");
  const isOwn = message.userId === user.id;

  const messageEl = document.createElement("div");
  messageEl.className = `message ${isOwn ? "own" : "other"}`;

  messageEl.innerHTML = `
    ${!isOwn ? `<div class="message-sender">${message.userName}</div>` : ""}
    <div>${message.message}</div>
    <div class="message-time">${formatDate(message.timestamp)}</div>
  `;

  chatMessages.appendChild(messageEl);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function displaySystemMessage(text) {
  const chatMessages = document.getElementById("chatMessages");
  const messageEl = document.createElement("div");
  messageEl.style.textAlign = "center";
  messageEl.style.color = "#666";
  messageEl.style.fontSize = "0.875rem";
  messageEl.style.fontStyle = "italic";
  messageEl.style.padding = "0.5rem";
  messageEl.textContent = text;
  chatMessages.appendChild(messageEl);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function sendMessage() {
  const messageInput = document.getElementById("messageInput");
  const message = messageInput.value.trim();

  if (!message) return;

  const user = getUser();

  socket.emit("send-message", {
    room: currentRoom,
    userId: user.id,
    userName: `${user.name} ${user.lastname}`,
    message
  });

  messageInput.value = "";
  stopTyping();
}

function startTyping() {
  if (!isTyping) {
    isTyping = true;
    const user = getUser();
    socket.emit("typing-start", {
      room: currentRoom,
      userId: user.id,
      userName: `${user.name} ${user.lastname}`
    });
  }

  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(stopTyping, 5050);
}

function stopTyping() {
  if (isTyping) {
    isTyping = false;
    const user = getUser();
    socket.emit("typing-stop", {
      room: currentRoom,
      userId: user.id
    });
  }
  clearTimeout(typingTimeout);
}

// Event listeners
document.getElementById("sendBtn").addEventListener("click", sendMessage);

document.getElementById("messageInput").addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    sendMessage();
  }
});

document.getElementById("messageInput").addEventListener("input", () => {
  const message = document.getElementById("messageInput").value;
  if (message.length > 0) {
    startTyping();
  } else {
    stopTyping();
  }
});

document.getElementById("roomSelect").addEventListener("change", (e) => {
  joinRoom(e.target.value);
  document.getElementById("chatMessages").innerHTML = '<div style="text-align: center; color: #666; padding: 2rem;">Loading chat history...</div>';
});

document.addEventListener("DOMContentLoaded", initChat);

// Cleanup on page unload
window.addEventListener("beforeunload", () => {
  if (socket) {
    socket.disconnect();
  }
});
