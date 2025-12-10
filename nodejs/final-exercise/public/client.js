// Socket connection to server
const socket = io();

// HTML elements
const loginBox = document.getElementById('login');
const chatBox = document.getElementById('chat');
const roomNameDisplay = document.getElementById('roomName');

const usernameInput = document.getElementById('username');
const roomSelect = document.getElementById('room');
const joinBtn = document.getElementById('join');
const leaveBtn = document.getElementById('leave');

const messageInput = document.getElementById('message');
const messagesDiv = document.getElementById('messages');
const sendBtn = document.getElementById('send');
const typingDiv = document.getElementById('typing');

// User and time info variables
let username = null;
let cooldown = false;
let typingTimeout = null;

//-----------------------------------------------------
// UI to server events

// Join room
joinBtn.addEventListener('click', () => {
    const name = usernameInput.value.trim();
    // If username empty, alert and stop.
    if (!name) return alert("Enter a username");

    // Save username and get selected room
    username = name;
    const room = roomSelect.value;

    // Send join event to server
    socket.emit("join", { username, room });

    // Update UI
    roomNameDisplay.textContent = room;
    loginBox.classList.add("hidden");
    chatBox.classList.remove("hidden");
});

// Leave room
leaveBtn.addEventListener('click', () => {
    // Send leave event to server
    socket.emit("leave");
    // Show login again and hide chat
    chatBox.classList.add("hidden");
    loginBox.classList.remove("hidden");
});

// Send message to room via click or Enter key
sendBtn.addEventListener("click", sendMessage);
messageInput.addEventListener("keyup", (e) => {
    if (e.key === "Enter") sendMessage();
});

// Function for process of sending message
function sendMessage() {
    // Get mesage and stop message if empty, >200 chars, or no cooldown active.
    const text = messageInput.value.trim();
    if (!text || text.length > 200 || cooldown) return;

    // Send chat_message event to server
    socket.emit("chat_message", {
        username,
        text
    });

    // Clear input, hide typing, and activate cooldown timer
    messageInput.value = "";
    typingDiv.textContent = "";
    cooldown = true;
    setTimeout(() => cooldown = false, 1000);
}

// Helper function: format timestamp
function formatTime(ts) {
    const d = new Date(ts);
    return d.toLocaleTimeString();
}

// Typing indicator 
messageInput.addEventListener("input", () => {
    // Send typing event to server w/ username
    socket.emit("typing", { username });

    // Reset timer: after 3s of no typing, remove typing message
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
        typingDiv.textContent = "";
    }, 3000);
});
//-----------------------------------------------------
// Server to Client events, for everyone in the room

// Listen for messages
socket.on("chat_message", (msg) => {
    // Update UI with message
    const div = document.createElement("div");
    div.classList.add("message");

    // Format message
    div.textContent = `${msg.username}: ${msg.text}`;

    // Add message to HTML and scroll to bottom
    messagesDiv.appendChild(div);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
});

// Typing indicator 
socket.on("typing", (data) => {
    // Typing format for indicator
    typingDiv.textContent = `${data.username} is typing...`;

    // Reset timer
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
        typingDiv.textContent = "";
    }, 3000);
});

// Message history 
socket.on("history", (history) => {
    // When user joins, send all old messages of room, clear UI messages,
    // and Add messages from history again
    messagesDiv.innerHTML = "";
    history.forEach(msg => {
        const div = document.createElement("div");
        div.classList.add("message");
        div.textContent = `${msg.username}: ${msg.text}`;
        messagesDiv.appendChild(div);
    });
});

// User joined announcement
socket.on("user_joined", (username) => {
    // When someone enters, show it
    const div = document.createElement("div");
    div.classList.add("system");
    div.textContent = `${username} joined the room`;
    messagesDiv.appendChild(div);
});

// User left announcement
socket.on("user_left", (username) => {
    // When someone leaves, show it
    const div = document.createElement("div");
    div.classList.add("system");
    div.textContent = `${username} left the room`;
    messagesDiv.appendChild(div);
});
