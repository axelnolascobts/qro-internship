class ChatApp {
    constructor() {
        this.socket = null;
        this.username = null;
        this.currentRoom = "general";
        this.userColors = new Map();
        this.emojis = ["😀", "😂", "😍", "🤔", "😎", "👍", "❤️", "🎉", "🔥", "✨"];
        this.typingUsers = new Map(); // Track typing users with timeouts
        this.lastTypingEmit = 0; // Throttle typing events

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.connectSocket();
    }

    connectSocket() {
        this.socket = io();

        this.socket.on("connect", () => {
            console.log("Connected to server");
        });

        this.socket.on("message_history", (messages) => {
            this.displayMessageHistory(messages);
        });

        this.socket.on("chat_message", (message) => {
            this.displayMessage(message);
        });

        this.socket.on("user_joined", (data) => {
            this.displaySystemMessage(`${data.username} joined the chat`);
        });

        this.socket.on("user_left", (data) => {
            this.displaySystemMessage(`${data.username} left the chat`);
        });

        this.socket.on("typing", (data) => {
            this.showTypingIndicator(data.username);
        });

        this.socket.on("stop_typing", (data) => {
            this.hideTypingIndicator(data.username);
        });

        this.socket.on("user_count", (count) => {
            this.updateUserCount(count);
        });

        this.socket.on("error", (errorMessage) => {
            this.showError(errorMessage);
        });

        this.socket.on("disconnect", () => {
            console.log("Disconnected from server");
        });
    }

    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById("loginForm");

        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            this.joinChat();
        });

        // Room selection
        const roomButtons = document.querySelectorAll(".room-btn");
        roomButtons.forEach(btn => {
            btn.addEventListener("click", () => this.changeRoom(btn.dataset.room));
        });

        // Message form
        const messageForm = document.getElementById("messageForm");
        const messageInput = document.getElementById("messageInput");

        messageForm.addEventListener("submit", (e) => {
            e.preventDefault();
            this.sendMessage();
        });

        messageInput.addEventListener("input", () => {
            this.handleTyping();
        });

        // Emoji button
        const emojiBtn = document.getElementById("emojiBtn");
        emojiBtn.addEventListener("click", () => this.showEmojiPicker());
    }

    joinChat() {
        const usernameInput = document.getElementById("usernameInput");
        const username = usernameInput.value.trim();

        if (!username) {
            this.showError("Please enter a username");
            return;
        }

        this.username = username;
        this.socket.emit("join", username);

        // Show chat interface
        document.getElementById("loginContainer").style.display = "none";
        document.getElementById("chatContent").style.display = "flex";
        document.getElementById("currentUser").textContent = `👤 ${username}`;

        // Focus on message input
        document.getElementById("messageInput").focus();
    }

    changeRoom(newRoom) {
        if (newRoom === this.currentRoom) return;

        this.currentRoom = newRoom;
        this.socket.emit("change_room", newRoom);

        // Update UI
        const roomButtons = document.querySelectorAll(".room-btn");
        roomButtons.forEach(btn => {
            btn.classList.toggle("active", btn.dataset.room === newRoom);
        });

        // Clear messages
        document.getElementById("messagesContainer").innerHTML = "";
        document.getElementById("typingIndicator").textContent = "";
    }

    sendMessage() {
        const messageInput = document.getElementById("messageInput");
        const message = messageInput.value.trim();

        if (!message) return;

        this.socket.emit("chat_message", { message });
        messageInput.value = "";

        // Clear typing indicator for current user immediately
        if (this.typingUsers.has(this.username)) {
            clearTimeout(this.typingUsers.get(this.username));
            this.typingUsers.delete(this.username);
            this.updateTypingIndicator();
        }

        // Reset typing throttle to allow immediate typing again
        this.lastTypingEmit = 0;
    }

    handleTyping() {
        if (!this.username) return;

        const now = Date.now();

        // Throttle typing events to once per second
        if (now - this.lastTypingEmit < 1000) {
            return;
        }

        this.lastTypingEmit = now;

        // Emit typing event
        this.socket.emit("typing");
    }

    showTypingIndicator(username) {
        // Clear existing timeout for this user
        if (this.typingUsers.has(username)) {
            clearTimeout(this.typingUsers.get(username));
        }

        // Set new timeout for this user
        const timeout = setTimeout(() => {
            this.typingUsers.delete(username);
            this.updateTypingIndicator();
        }, 3000);

        this.typingUsers.set(username, timeout);
        this.updateTypingIndicator();
    }

    updateTypingIndicator() {
        const indicator = document.getElementById("typingIndicator");

        if (this.typingUsers.size === 0) {
            indicator.textContent = "";
        } else if (this.typingUsers.size === 1) {
            const username = Array.from(this.typingUsers.keys())[0];
            indicator.textContent = `${username} is typing...`;
        } else {
            indicator.textContent = `${this.typingUsers.size} people are typing...`;
        }
    }

    hideTypingIndicator(username) {
        if (this.typingUsers.has(username)) {
            clearTimeout(this.typingUsers.get(username));
            this.typingUsers.delete(username);
            this.updateTypingIndicator();
        }
    }

    displayMessage(message) {
        const container = document.getElementById("messagesContainer");
        const messageElement = document.createElement("div");
        messageElement.className = "message";

        const userColor = this.getUserColor(message.user);
        const time = new Date(message.timestamp).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit"
        });

        messageElement.innerHTML = `
            <div class="message-header">
                <span class="message-username" style="color: ${userColor}">${this.escapeHtml(message.user)}</span>
                <span class="message-time">${time}</span>
            </div>
            <div class="message-text">${this.escapeHtml(message.message)}</div>
        `;

        container.appendChild(messageElement);

        // Clear typing indicator for the user who sent the message
        if (this.typingUsers.has(message.user)) {
            clearTimeout(this.typingUsers.get(message.user));
            this.typingUsers.delete(message.user);
            this.updateTypingIndicator();
        }

        this.scrollToBottom();
    }

    displaySystemMessage(text) {
        const container = document.getElementById("messagesContainer");
        const messageElement = document.createElement("div");
        messageElement.className = "system-message";
        messageElement.textContent = text;

        container.appendChild(messageElement);
        this.scrollToBottom();
    }

    displayMessageHistory(messages) {
        const container = document.getElementById("messagesContainer");
        container.innerHTML = "";

        messages.forEach(message => {
            this.displayMessage(message);
        });
    }

    updateUserCount(count) {
        const userCountElement = document.getElementById("userCount");
        userCountElement.textContent = `${count} ${count === 1 ? "user" : "users"}`;
    }

    showError(message) {
        // Remove existing error messages
        const existingErrors = document.querySelectorAll(".error-message");
        existingErrors.forEach(error => error.remove());

        // Create new error message
        const errorElement = document.createElement("div");
        errorElement.className = "error-message";
        errorElement.textContent = message;

        // Insert at the top of the current view
        const container = document.getElementById("chatContent").style.display === "flex"
            ? document.getElementById("messagesContainer")
            : document.getElementById("loginContainer");

        container.insertBefore(errorElement, container.firstChild);

        // Remove after 5 seconds
        setTimeout(() => {
            errorElement.remove();
        }, 5000);
    }

    showEmojiPicker() {
        // Toggle: remove existing popup if any
        const existingPopup = document.getElementById("emojiPopup");
        if (existingPopup) {
            this.closeEmojiPicker(existingPopup);
            return;
        }

        // Create emoji popup
        const popup = document.createElement("div");
        popup.id = "emojiPopup";

        // Event handlers that need cleanup
        const clickOutsideHandler = (e) => {
            if (!popup.contains(e.target) && e.target.id !== "emojiBtn") {
                this.closeEmojiPicker(popup);
            }
        };

        const keydownHandler = (e) => {
            if (e.key === "Escape") {
                this.closeEmojiPicker(popup);
            }
        };

        // Store handlers on popup for cleanup
        popup._clickHandler = clickOutsideHandler;
        popup._keyHandler = keydownHandler;

        // Add close button
        const closeBtn = document.createElement("button");
        closeBtn.textContent = "✕";
        closeBtn.className = "close-btn";
        closeBtn.onclick = () => this.closeEmojiPicker(popup);
        popup.appendChild(closeBtn);

        // Add emoji buttons
        this.emojis.forEach(emoji => {
            const emojiBtn = document.createElement("button");
            emojiBtn.textContent = emoji;
            emojiBtn.className = "emoji-btn";
            emojiBtn.onclick = () => {
                const messageInput = document.getElementById("messageInput");
                messageInput.value += emoji;
                messageInput.focus();
                this.closeEmojiPicker(popup);
            };
            popup.appendChild(emojiBtn);
        });

        // Add to page
        document.body.appendChild(popup);

        // Add event listeners after a short delay to prevent immediate trigger
        setTimeout(() => {
            document.addEventListener("click", clickOutsideHandler);
            document.addEventListener("keydown", keydownHandler);
        }, 100);
    }

    closeEmojiPicker(popup) {
        if (!popup || !popup.parentNode) return;

        // Clean up event listeners
        if (popup._clickHandler) {
            document.removeEventListener("click", popup._clickHandler);
        }
        if (popup._keyHandler) {
            document.removeEventListener("keydown", popup._keyHandler);
        }

        // Remove popup from DOM
        popup.remove();
    }

    getUserColor(username) {
        if (!this.userColors.has(username)) {
            const colors = ["#667eea", "#f093fb", "#4facfe", "#43e97b", "#fa709a", "#fee140", "#30cfd0", "#a8edea"];
            const color = colors[username.length % colors.length];
            this.userColors.set(username, color);
        }

        const userColor = this.userColors.get(username);

        // Validate hex color format to prevent CSS injection
        if (!/^#[0-9A-F]{6}$/i.test(userColor)) {
            return "#000000";
        }

        return userColor;
    }

    escapeHtml(text) {
        const div = document.createElement("div");
        div.textContent = text;
        return div.innerHTML;
    }

    scrollToBottom() {
        const container = document.getElementById("messagesContainer");
        setTimeout(() => {
            container.scrollTop = container.scrollHeight;
        }, 100);
    }
}

// Initialize the chat app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    new ChatApp();
});