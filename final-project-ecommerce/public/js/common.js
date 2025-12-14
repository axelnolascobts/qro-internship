// API Base URL
const API_URL = 'http://localhost:5050/api';

// Authentication utilities
function getToken() {
    return localStorage.getItem('token');
}

function setToken(token) {
    localStorage.setItem('token', token);
}

function removeToken() {
    localStorage.removeItem('token');
}

function getUserData() {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
}

function setUserData(user) {
    localStorage.setItem('user', JSON.stringify(user));
}

function removeUserData() {
    localStorage.removeItem('user');
}

function isAuthenticated() {
    return !!getToken();
}

function logout() {
    removeToken();
    removeUserData();
    window.location.href = '/login';
}

// API Request helper
async function apiRequest(endpoint, options = {}) {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers,
        });

        const data = await response.json();

        if (response.status === 401) {
            logout();
            return null;
        }

        return { data, status: response.status, ok: response.ok };
    } catch (error) {
        console.error('API Request Error:', error);
        return { error: error.message, ok: false };
    }
}

// Cart utilities
function getCart() {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
}

function setCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartBadge();
}

function addToCart(product, quantity = 1) {
    const cart = getCart();
    const existingItem = cart.find(item => item.productId === product.id);

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            productId: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: quantity,
        });
    }

    setCart(cart);
    showNotification('Product added to cart!', 'success');
}

function removeFromCart(productId) {
    const cart = getCart();
    const updatedCart = cart.filter(item => item.productId !== productId);
    setCart(updatedCart);
}

function updateCartItemQuantity(productId, quantity) {
    const cart = getCart();
    const item = cart.find(item => item.productId === productId);

    if (item) {
        if (quantity <= 0) {
            removeFromCart(productId);
        } else {
            item.quantity = quantity;
            setCart(cart);
        }
    }
}

function clearCart() {
    setCart([]);
}

function getCartTotal() {
    const cart = getCart();
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

function getCartItemCount() {
    const cart = getCart();
    return cart.reduce((count, item) => count + item.quantity, 0);
}

function updateCartBadge() {
    const badge = document.querySelector('.cart-badge .badge');
    if (badge) {
        const count = getCartItemCount();
        badge.textContent = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
    }
}

// Theme utilities
function getTheme() {
    return localStorage.getItem('theme') || 'light';
}

function setTheme(theme) {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
}

function toggleTheme() {
    const currentTheme = getTheme();
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
}

// Initialize theme
function initTheme() {
    const theme = getTheme();
    setTheme(theme);
}

// Notification utility
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type}`;
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.zIndex = '9999';
    notification.style.minWidth = '250px';
    notification.style.animation = 'slideIn 0.3s ease';

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add CSS for notification animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// Navigation utilities
function initNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const themeToggle = document.querySelector('.theme-toggle');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close menu when clicking on a link
        document.querySelectorAll('.nav-menu a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    // Update navigation based on auth status
    updateNavigation();
    updateCartBadge();
}

function updateNavigation() {
    const user = getUserData();
    const navMenu = document.querySelector('.nav-menu');

    if (!navMenu) return;

    if (user) {
        const logoutBtn = navMenu.querySelector('#logout-btn');
        if (logoutBtn) {
            logoutBtn.style.display = 'block';
        }

        const loginLink = navMenu.querySelector('a[href="/login"]');
        const registerLink = navMenu.querySelector('a[href="/register"]');
        if (loginLink) loginLink.style.display = 'none';
        if (registerLink) registerLink.style.display = 'none';

        // Show seller dashboard for sellers
        if (user.role === 'seller' || user.role === 'admin') {
            const sellerLink = navMenu.querySelector('a[href="/seller"]');
            if (sellerLink) sellerLink.style.display = 'block';
        }
    }
}

// Protected page check
function checkAuth() {
    const publicPages = ['/login', '/register', '/catalog', '/', '/product'];
    const currentPath = window.location.pathname;

    const isPublicPage = publicPages.some(page =>
        currentPath === page || currentPath.startsWith(page)
    );

    if (!isPublicPage && !isAuthenticated()) {
        window.location.href = '/login';
    }
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);
}

// Format date
function formatDate(dateString) {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(dateString));
}

// Global Chat Widget
function initGlobalChat() {
    // Don't initialize on the chat page itself
    if (window.location.pathname === '/chat') return;

    // Inject Socket.IO if not already loaded
    if (typeof io === 'undefined') {
        const socketScript = document.createElement('script');
        socketScript.src = 'https://cdn.socket.io/4.6.1/socket.io.min.js';
        socketScript.onload = setupChat;
        document.head.appendChild(socketScript);
    } else {
        setupChat();
    }
}

function setupChat() {
    // Create chat bubble HTML
    const chatHTML = `
    <button id="chat-bubble" class="chat-bubble">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
      <span class="chat-badge" id="chat-badge">0</span>
    </button>

    <div id="chat-window" class="chat-window">
      <div class="chat-header">
        <h3>Support Chat</h3>
        <button id="chat-close" class="chat-close-btn">&times;</button>
      </div>
      
      <div class="chat-body">
        <div class="chat-users">
          <h4>Online</h4>
          <div id="users-list"></div>
        </div>
        
        <div class="chat-messages-container">
          <div id="messages" class="chat-messages">
            <p style="color: var(--text-secondary); text-align: center;">Loading messages...</p>
          </div>
          
          <div id="typing-indicator" class="typing-indicator"></div>
          
          <form id="message-form" class="chat-form">
            <input type="text" id="message-input" class="chat-input" placeholder="Type your message...">
            <button type="submit" class="chat-send-btn">Send</button>
          </form>
        </div>
      </div>
    </div>
  `;

    // Add chat styles
    const chatStyles = document.createElement('style');
    chatStyles.textContent = `
    .chat-bubble {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: var(--primary-color);
      color: white;
      border: none;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s, box-shadow 0.2s;
      z-index: 999;
    }
    
    .chat-bubble:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
    }
    
    .chat-badge {
      position: absolute;
      top: -5px;
      right: -5px;
      background: #ef4444;
      color: white;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      display: none;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: bold;
      border: 2px solid white;
    }
    
    .chat-window {
      position: fixed;
      bottom: 90px;
      right: 20px;
      width: 400px;
      height: 550px;
      background: var(--surface);
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
      display: none;
      flex-direction: column;
      overflow: hidden;
      z-index: 998;
      animation: slideUp 0.3s ease;
    }
    
    .chat-window.open {
      display: flex;
    }
    
    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .chat-header {
      background: var(--primary-color);
      color: white;
      padding: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .chat-header h3 {
      margin: 0;
      font-size: 1.125rem;
    }
    
    .chat-close-btn {
      background: none;
      border: none;
      color: white;
      font-size: 1.5rem;
      cursor: pointer;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      transition: background 0.2s;
    }
    
    .chat-close-btn:hover {
      background: rgba(255, 255, 255, 0.1);
    }
    
    .chat-body {
      display: grid;
      grid-template-columns: 100px 1fr;
      flex: 1;
      overflow: hidden;
    }
    
    .chat-users {
      background: var(--background);
      padding: 1rem 0.75rem;
      border-right: 1px solid var(--border-color);
      overflow-y: auto;
    }
    
    .chat-users h4 {
      font-size: 0.75rem;
      text-transform: uppercase;
      color: var(--text-secondary);
      margin: 0 0 0.75rem 0;
      font-weight: 600;
    }
    
    #users-list {
      font-size: 0.75rem;
      color: var(--text-secondary);
    }
    
    #users-list p {
      margin: 0.5rem 0;
      word-break: break-word;
    }
    
    .chat-messages-container {
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    
    .chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 1rem;
    }
    
    .message-item {
      margin-bottom: 1rem;
    }
    
    .typing-indicator {
      height: 20px;
      padding: 0 1rem;
      color: var(--text-secondary);
      font-size: 0.875rem;
      font-style: italic;
    }
    
    .chat-form {
      display: flex;
      gap: 0.5rem;
      padding: 1rem;
      border-top: 1px solid var(--border-color);
      background: var(--surface);
    }
    
    .chat-input {
      flex: 1;
      padding: 0.75rem;
      border: 2px solid var(--border-color);
      border-radius: 8px;
      background: var(--background);
      color: var(--text-color);
      font-size: 0.875rem;
    }
    
    .chat-input:focus {
      outline: none;
      border-color: var(--primary-color);
    }
    
    .chat-send-btn {
      padding: 0.75rem 1.25rem;
      background: var(--primary-color);
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      transition: background 0.2s;
    }
    
    .chat-send-btn:hover {
      background: var(--primary-hover);
    }
    
    @media (max-width: 768px) {
      .chat-window {
        width: calc(100vw - 40px);
        height: calc(100vh - 120px);
        bottom: 90px;
        right: 20px;
      }
      
      .chat-body {
        grid-template-columns: 80px 1fr;
      }
      
      .chat-users h4 {
        font-size: 0.625rem;
      }
      
      #users-list {
        font-size: 0.625rem;
      }
    }
  `;

    document.head.appendChild(chatStyles);
    document.body.insertAdjacentHTML('beforeend', chatHTML);

    // Initialize chat functionality
    const socket = io('http://localhost:5050');
    const user = getUserData();
    const username = user ? `${user.name} ${user.lastname}` : `Guest${Math.floor(Math.random() * 1000)}`;
    const room = 'general-support';
    let typingTimeout;
    let unreadCount = 0;
    let chatOpen = false;

    // Chat bubble toggle
    document.getElementById('chat-bubble').addEventListener('click', () => {
        const chatWindow = document.getElementById('chat-window');
        chatOpen = !chatOpen;
        chatWindow.classList.toggle('open');
        if (chatOpen) {
            unreadCount = 0;
            updateChatBadge();
            document.getElementById('message-input').focus();
        }
    });

    document.getElementById('chat-close').addEventListener('click', () => {
        document.getElementById('chat-window').classList.remove('open');
        chatOpen = false;
    });

    function updateChatBadge() {
        const badge = document.getElementById('chat-badge');
        badge.textContent = unreadCount;
        badge.style.display = unreadCount > 0 ? 'flex' : 'none';
    }

    socket.emit('join-room', { room, username });

    socket.on('message-history', (messages) => {
        const container = document.getElementById('messages');
        if (messages.length === 0) {
            container.innerHTML = '<p style="color: var(--text-secondary); text-align: center;">No messages yet. Start the conversation!</p>';
        } else {
            container.innerHTML = messages.map(msg => `
        <div class="message-item">
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
            <strong style="color: var(--primary-color);">${msg.username}</strong>
            <span style="font-size: 0.75rem; color: var(--text-secondary);">${formatDate(msg.timestamp)}</span>
          </div>
          <p style="padding: 0.5rem; background: var(--surface); border-radius: 0.5rem;">${msg.message}</p>
        </div>
      `).join('');
            container.scrollTop = container.scrollHeight;
        }
    });

    socket.on('new-message', (message) => {
        const container = document.getElementById('messages');
        const messageEl = document.createElement('div');
        messageEl.className = 'message-item';
        messageEl.innerHTML = `
      <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
        <strong style="color: var(--primary-color);">${message.username}</strong>
        <span style="font-size: 0.75rem; color: var(--text-secondary);">${formatDate(message.timestamp)}</span>
      </div>
      <p style="padding: 0.5rem; background: var(--surface); border-radius: 0.5rem;">${message.message}</p>
    `;

        if (container.querySelector('p[style*="text-align: center"]')) {
            container.innerHTML = '';
        }

        container.appendChild(messageEl);
        container.scrollTop = container.scrollHeight;

        // Show unread badge if chat is closed
        if (!chatOpen && message.username !== username) {
            unreadCount++;
            updateChatBadge();
        }

        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDGH0fPTgjMGHm7A7+OZURE');
        audio.play().catch(() => { });
    });

    socket.on('users-update', (users) => {
        document.getElementById('users-list').innerHTML = users.map(u => `<p>• ${u}</p>`).join('');
    });

    socket.on('user-joined', (data) => {
        showNotification(`${data.username} joined the chat`, 'info');
    });

    socket.on('user-left', (data) => {
        showNotification(`${data.username} left the chat`, 'info');
    });

    socket.on('user-typing', (data) => {
        if (data.typing) {
            document.getElementById('typing-indicator').textContent = `${data.username} is typing...`;
        } else {
            document.getElementById('typing-indicator').textContent = '';
        }
    });

    socket.on('cooldown-error', (data) => {
        showNotification(data.message, 'error');
    });

    document.getElementById('message-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('message-input');
        const message = input.value.trim();

        if (message) {
            socket.emit('send-message', { room, username, message });
            input.value = '';
            socket.emit('typing-stop', { room, username });
        }
    });

    document.getElementById('message-input').addEventListener('input', (e) => {
        if (e.target.value.trim()) {
            socket.emit('typing-start', { room, username });
            clearTimeout(typingTimeout);
            typingTimeout = setTimeout(() => {
                socket.emit('typing-stop', { room, username });
            }, 1000);
        } else {
            socket.emit('typing-stop', { room, username });
        }
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initNavigation();
    checkAuth();
    initGlobalChat();
});
