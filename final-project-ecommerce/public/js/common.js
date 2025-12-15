// Purpose: Provides common utilities for authentication, cart management, and real-time chat functionality
// API Base URL
const API_URL = 'http://localhost:5050/api';

// Authentication utilities
// Retrieves JWT token from localStorage
function getToken() {
    return localStorage.getItem('token');
}

// Stores JWT token in localStorage
function setToken(token) {
    localStorage.setItem('token', token);
}

// Removes JWT token from localStorage
function removeToken() {
    localStorage.removeItem('token');
}

// Retrieves user data from localStorage
function getUserData() {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
}

// Stores user data in localStorage
function setUserData(user) {
    localStorage.setItem('user', JSON.stringify(user));
}

// Removes user data from localStorage
function removeUserData() {
    localStorage.removeItem('user');
}

// Checks if user is authenticated
function isAuthenticated() {
    return !!getToken();
}

// Logs out user and clears authentication data
async function logout() {
    // Clear server cart if authenticated
    if (isAuthenticated()) {
        try {
            await clearCart();
        } catch (error) {
            console.error('Error clearing cart on logout:', error);
        }
    }

    removeToken();
    removeUserData();
    window.location.href = '/login';
}

// API Request helper
// Makes authenticated API requests with error handling
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
// Retrieves user cart from server or localStorage
async function getCart() {
    if (!isAuthenticated()) {
        // Fallback to localStorage for guest users
        const cart = localStorage.getItem('cart');
        return cart ? JSON.parse(cart) : [];
    }

    try {
        const response = await apiRequest('/cart');
        if (response.ok && response.data.success) {
            return response.data.cart.items || [];
        }
    } catch (error) {
        console.error('Error fetching cart:', error);
    }

    // Fallback to localStorage on error
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
}

// Stores cart data and updates badge
async function setCart(cart) {
    if (!isAuthenticated()) {
        // Use localStorage for guest users
        localStorage.setItem('cart', JSON.stringify(cart));
        // Store count for sync updates
        const count = cart.reduce((total, item) => total + item.quantity, 0);
        localStorage.setItem('cart-badge-count', count.toString());
        updateCartBadge();
        return;
    }

    try {
        // For authenticated users, cart is managed on server
        // This function is mainly used for updating the badge
        updateCartBadge();
    } catch (error) {
        console.error('Error setting cart:', error);
        // Fallback to localStorage
        localStorage.setItem('cart', JSON.stringify(cart));
        const count = cart.reduce((total, item) => total + item.quantity, 0);
        localStorage.setItem('cart-badge-count', count.toString());
        updateCartBadge();
    }
}

// Adds product to cart with validation
async function addToCart(product, quantity = 1) {
    if (!isAuthenticated()) {
        // Use localStorage for guest users
        const cart = await getCart();
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

        await setCart(cart);
        showNotification('Product added to cart!', 'success');
        return;
    }

    try {
        const response = await apiRequest('/cart/add', {
            method: 'POST',
            body: JSON.stringify({
                productId: product.id,
                quantity: quantity
            })
        });

        if (response.ok && response.data.success) {
            showNotification('Product added to cart!', 'success');
            updateCartBadge();
        } else {
            showNotification(response.data?.message || 'Error adding to cart', 'error');
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
        showNotification('Error adding to cart', 'error');
    }
}

// Removes item from cart
async function removeFromCartAPI(productId) {
    if (!isAuthenticated()) {
        // Use localStorage for guest users
        const cart = await getCart();
        const updatedCart = cart.filter(item => item.productId !== productId);
        await setCart(updatedCart);
        return;
    }

    try {
        const response = await apiRequest('/cart/remove', {
            method: 'DELETE',
            body: JSON.stringify({
                productId: productId
            })
        });

        if (response.ok && response.data.success) {
            updateCartBadge();
        } else {
            showNotification(response.data?.message || 'Error removing from cart', 'error');
        }
    } catch (error) {
        console.error('Error removing from cart:', error);
        showNotification('Error removing from cart', 'error');
    }
}

// Updates cart item quantity
async function updateCartItemQuantityAPI(productId, quantity) {
    if (!isAuthenticated()) {
        // Use localStorage for guest users
        const cart = await getCart();
        const item = cart.find(item => item.productId === productId);

        if (item) {
            if (quantity <= 0) {
                await removeFromCartAPI(productId);
            } else {
                item.quantity = quantity;
                await setCart(cart);
            }
        }
        return;
    }

    try {
        const response = await apiRequest('/cart/update', {
            method: 'PUT',
            body: JSON.stringify({
                productId: productId,
                quantity: quantity
            })
        });

        if (response.ok && response.data.success) {
            updateCartBadge();
        } else {
            showNotification(response.data?.message || 'Error updating cart', 'error');
        }
    } catch (error) {
        console.error('Error updating cart:', error);
        showNotification('Error updating cart', 'error');
    }
}

// Clears all items from cart
async function clearCart() {
    if (!isAuthenticated()) {
        // Use localStorage for guest users
        await setCart([]);
        return;
    }

    try {
        const response = await apiRequest('/cart/clear', {
            method: 'DELETE'
        });

        if (response.ok && response.data.success) {
            updateCartBadge();
        } else {
            showNotification(response.data?.message || 'Error clearing cart', 'error');
        }
    } catch (error) {
        console.error('Error clearing cart:', error);
        showNotification('Error clearing cart', 'error');
    }
}

// Calculates total cart value
async function getCartTotal() {
    const cart = await getCart();
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Counts total items in cart
async function getCartItemCount() {
    const cart = await getCart();
    return cart.reduce((count, item) => count + item.quantity, 0);
}

// Updates cart badge with item count
async function updateCartBadge() {
    const badge = document.querySelector('.cart-badge .badge');
    if (badge) {
        try {
            const count = await getCartItemCount();
            badge.textContent = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        } catch (error) {
            console.error('Error updating cart badge:', error);
            badge.textContent = '0';
            badge.style.display = 'none';
        }
    }
}

// Synchronous version for non-critical updates
// Synchronously updates cart badge
function updateCartBadgeSync() {
    const badge = document.querySelector('.cart-badge .badge');
    if (badge) {
        const count = parseInt(localStorage.getItem('cart-badge-count') || '0');
        badge.textContent = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
    }
}

// Merge local cart with server cart on login
// Merges local cart with server cart on login
async function mergeCartOnLogin() {
    if (!isAuthenticated()) return;

    const localCart = localStorage.getItem('cart');
    if (!localCart) return;

    try {
        const cartItems = JSON.parse(localCart);
        if (cartItems.length === 0) return;

        const response = await apiRequest('/cart/merge', {
            method: 'POST',
            body: JSON.stringify({
                localCart: cartItems
            })
        });

        if (response.ok && response.data.success) {
            // Clear local cart after successful merge
            localStorage.removeItem('cart');
            updateCartBadge();
            showNotification('Cart items merged successfully!', 'success');
        }
    } catch (error) {
        console.error('Error merging cart:', error);
    }
}

// Theme utilities
// Retrieves current theme from localStorage
function getTheme() {
    return localStorage.getItem('theme') || 'light';
}

// Sets theme and updates document
function setTheme(theme) {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
}

// Toggles between light and dark themes
function toggleTheme() {
    const currentTheme = getTheme();
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
}

// Initialize theme
// Initializes theme on page load
function initTheme() {
    const theme = getTheme();
    setTheme(theme);
}

// Notification utility
// Shows notification message to user
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
// Initializes navigation menu and event listeners
async function initNavigation() {
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

    // Add page transition detection for navigation links
    document.querySelectorAll('a[href^="/"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            // Skip if it's the same page or external link
            if (href !== window.location.pathname && !href.includes('http')) {
                showPageTransition();
            }
        });
    });

    // Update navigation based on auth status
    try {
        await updateNavigation();
        await updateCartBadge();
    } catch (error) {
        console.error('Navigation initialization error:', error);
    }
}

// Updates navigation based on auth status
async function updateNavigation() {
    try {
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

            // Merge local cart with server cart on login
            try {
                await mergeCartOnLogin();
            } catch (error) {
                console.error('Cart merge error:', error);
            }
        } else {
            // Reset to guest mode
            const logoutBtn = navMenu.querySelector('#logout-btn');
            if (logoutBtn) logoutBtn.style.display = 'none';

            const loginLink = navMenu.querySelector('a[href="/login"]');
            const registerLink = navMenu.querySelector('a[href="/register"]');
            if (loginLink) loginLink.style.display = 'block';
            if (registerLink) registerLink.style.display = 'block';

            const sellerLink = navMenu.querySelector('a[href="/seller"]');
            if (sellerLink) sellerLink.style.display = 'none';
        }
    } catch (error) {
        console.error('Navigation update error:', error);
    }
}

// Protected page check
// Redirects unauthenticated users from protected pages
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
// Formats amount as currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);
}

// Format date
// Formats date string to readable format
function formatDate(dateString) {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(dateString));
}

// Chat username utilities
// Retrieves or generates chat username
function getChatUsername() {
    const storedUsername = localStorage.getItem('chatUsername');
    if (storedUsername) {
        return storedUsername;
    }

    const user = getUserData();
    if (user) {
        const username = `${user.name} ${user.lastname}`;
        localStorage.setItem('chatUsername', username);
        return username;
    }

    // Generate guest username only once
    const guestUsername = `Guest${Math.floor(Math.random() * 1000)}`;
    localStorage.setItem('chatUsername', guestUsername);
    return guestUsername;
}

// Stores chat username in localStorage
function setChatUsername(username) {
    localStorage.setItem('chatUsername', username);
}

// Removes chat username from localStorage
function clearChatUsername() {
    localStorage.removeItem('chatUsername');
}

// Session management utilities
// Generates or retrieves session ID for socket
function getSessionId() {
    let sessionId = sessionStorage.getItem('socketSessionId');
    if (!sessionId) {
        sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        sessionStorage.setItem('socketSessionId', sessionId);
    }
    return sessionId;
}

// Clears session data from sessionStorage
function clearSessionData() {
    sessionStorage.removeItem('socketSessionId');
    sessionStorage.removeItem('socketReconnecting');
}

// Centralized Socket Manager
class SocketManager {
    // Initializes SocketManager with connection settings
    constructor() {
        this.socket = null;
        this.username = null;
        this.isConnected = false;
        this.room = 'general-support';
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
        this.eventListeners = new Map();
        this.typingTimeout = null;
        this.sessionId = getSessionId();
        this.isReconnecting = false;
        this.hasJoinedRoom = false;
    }

    // Returns singleton socket instance
    getInstance() {
        if (!this.socket) {
            this.initializeConnection();
        }
        return this.socket;
    }

    // Creates socket connection with session tracking
    initializeConnection() {
        if (typeof io === 'undefined') {
            console.error('Socket.IO library not loaded');
            return null;
        }

        this.username = getChatUsername();

        // Check if we're reconnecting from a page navigation
        const isReconnecting = sessionStorage.getItem('socketReconnecting') === 'true';

        // Create socket with session ID for server identification
        this.socket = io('http://localhost:5050', {
            query: {
                sessionId: this.sessionId,
                isReconnecting: isReconnecting
            }
        });

        this.setupConnectionEvents();

        // Don't auto-join room if reconnecting - wait for server to acknowledge
        if (!isReconnecting) {
            this.joinRoom();
        }

        return this.socket;
    }

    // Sets up socket event listeners
    setupConnectionEvents() {
        this.socket.on('connect', () => {
            console.log('Socket connected:', this.socket.id);
            this.isConnected = true;
            this.reconnectAttempts = 0;

            // Clear reconnecting flag on successful connection
            sessionStorage.removeItem('socketReconnecting');

            // Join room if not already joined (server will acknowledge reconnection)
            if (!this.hasJoinedRoom) {
                this.joinRoom();
            }
        });

        this.socket.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason);
            this.isConnected = false;
            this.hasJoinedRoom = false;

            // Set reconnecting flag for page navigation scenarios
            if (reason === 'io client disconnect' || reason === 'transport close') {
                sessionStorage.setItem('socketReconnecting', 'true');
            }

            if (reason === 'io server disconnect') {
                // Server initiated disconnect, don't reconnect automatically
                this.socket.connect();
            }
        });

        this.socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            this.handleReconnect();
        });

        // Handle server acknowledgment of reconnection
        this.socket.on('session-acknowledged', (data) => {
            console.log('Session acknowledged by server:', data);
            if (data.rejoined) {
                console.log('User rejoined chat session');
                this.hasJoinedRoom = true;
            }
        });
    }

    // Handles socket reconnection logic
    handleReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

            setTimeout(() => {
                this.socket.connect();
            }, this.reconnectDelay * this.reconnectAttempts);
        } else {
            console.error('Max reconnection attempts reached');
        }
    }

    // Joins chat room with username
    joinRoom() {
        if (this.socket && this.isConnected && this.username) {
            this.socket.emit('join-room', {
                room: this.room,
                username: this.username,
                sessionId: this.sessionId
            });
            this.hasJoinedRoom = true;
        }
    }

    // Disconnects socket and clears session
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
        }
    }

    // Updates username and rejoins room
    updateUsername(newUsername) {
        this.username = newUsername;
        setChatUsername(newUsername);

        if (this.socket && this.isConnected) {
            // Rejoin room with new username
            this.joinRoom();
        }
    }

    // Event listener management
    // Adds event listener to socket
    addEventListener(event, callback) {
        if (this.socket) {
            this.socket.on(event, callback);

            // Store listener for cleanup
            if (!this.eventListeners.has(event)) {
                this.eventListeners.set(event, []);
            }
            this.eventListeners.get(event).push(callback);
        }
    }

    // Removes event listener from socket
    removeEventListener(event, callback) {
        if (this.socket) {
            this.socket.off(event, callback);

            if (this.eventListeners.has(event)) {
                const listeners = this.eventListeners.get(event);
                const index = listeners.indexOf(callback);
                if (index > -1) {
                    listeners.splice(index, 1);
                }
            }
        }
    }

    // Emits event to socket
    emit(event, data) {
        if (this.socket && this.isConnected) {
            this.socket.emit(event, data);
        }
    }

    // Cleanup method
    // Cleans up event listeners and timeouts
    cleanup() {
        if (this.typingTimeout) {
            clearTimeout(this.typingTimeout);
            this.typingTimeout = null;
        }

        // Remove all event listeners
        this.eventListeners.forEach((listeners, event) => {
            listeners.forEach(callback => {
                this.socket.off(event, callback);
            });
        });
        this.eventListeners.clear();

        // Don't disconnect on page navigation - preserve session
        // Only disconnect on explicit logout or browser close
        // this.disconnect();
    }

    // Explicit disconnect for logout scenarios
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
            this.hasJoinedRoom = false;
            clearSessionData();
        }
    }
}

// Global socket manager instance
let socketManager = null;

// Returns global socket manager instance
function getSocketManager() {
    if (!socketManager) {
        socketManager = new SocketManager();
    }
    return socketManager;
}

// Preserve session on page navigation
window.addEventListener('beforeunload', () => {
    if (socketManager) {
        // Mark as reconnecting for next page load
        sessionStorage.setItem('socketReconnecting', 'true');
        // Don't disconnect - preserve session
        socketManager.cleanup();
    }
});

// Clear session on browser close (detect via pagehide)
window.addEventListener('pagehide', (event) => {
    // Only clear if not a page navigation
    if (event.persisted === false) {
        if (socketManager) {
            socketManager.disconnect();
        }
    }
});

// Global Chat Widget
// Initializes global chat widget
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

// Sets up chat widget UI and functionality
function setupChat() {
    // Check if chat widget already exists
    if (document.getElementById('chat-bubble')) {
        return;
    }

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

    // Initialize chat functionality using SocketManager
    const socketManager = getSocketManager();
    const socket = socketManager.getInstance();
    const username = socketManager.username;
    const room = socketManager.room;
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

    // Socket event listeners
    socketManager.addEventListener('message-history', (messages) => {
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

    socketManager.addEventListener('new-message', (message) => {
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

    socketManager.addEventListener('users-update', (users) => {
        document.getElementById('users-list').innerHTML = users.map(u => `<p>• ${u}</p>`).join('');
    });

    socketManager.addEventListener('user-joined', (data) => {
        showNotification(`${data.username} joined the chat`, 'info');
    });

    socketManager.addEventListener('user-reconnected', (data) => {
        showNotification(`${data.username} reconnected to the chat`, 'info');
    });

    socketManager.addEventListener('user-left', (data) => {
        showNotification(`${data.username} left the chat`, 'info');
    });

    socketManager.addEventListener('user-typing', (data) => {
        if (data.typing) {
            document.getElementById('typing-indicator').textContent = `${data.username} is typing...`;
        } else {
            document.getElementById('typing-indicator').textContent = '';
        }
    });

    socketManager.addEventListener('cooldown-error', (data) => {
        showNotification(data.message, 'error');
    });

    document.getElementById('message-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('message-input');
        const message = input.value.trim();

        if (message) {
            socketManager.emit('send-message', { room, username, message });
            input.value = '';
            socketManager.emit('typing-stop', { room, username });
        }
    });

    document.getElementById('message-input').addEventListener('input', (e) => {
        if (e.target.value.trim()) {
            socketManager.emit('typing-start', { room, username });
            clearTimeout(socketManager.typingTimeout);
            socketManager.typingTimeout = setTimeout(() => {
                socketManager.emit('typing-stop', { room, username });
            }, 1000);
        } else {
            socketManager.emit('typing-stop', { room, username });
        }
    });
}

// Loading state management
let loadingTimeout = null;
let loadingStartTime = null;

// Shows page loading transition
function showPageTransition() {
    loadingStartTime = Date.now();

    // Create loading overlay if it doesn't exist
    let overlay = document.getElementById('page-transition');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'page-transition';
        overlay.innerHTML = `
            <div class="page-transition-content">
                <div class="page-transition-text">Loading...</div>
            </div>
        `;
        document.body.appendChild(overlay);
    }

    // Only show overlay after 2 seconds
    loadingTimeout = setTimeout(() => {
        // Show overlay with current theme
        const theme = getTheme();
        document.documentElement.setAttribute('data-theme', theme);
        overlay.classList.remove('hidden');

        // Prevent scrolling during loading
        document.body.style.overflow = 'hidden';
    }, 2000);
}

// Hides page loading transition
function hidePageTransition() {
    // Clear the timeout if it hasn't fired yet
    if (loadingTimeout) {
        clearTimeout(loadingTimeout);
        loadingTimeout = null;
    }

    const overlay = document.getElementById('page-transition');
    if (overlay && !overlay.classList.contains('hidden')) {
        overlay.classList.add('hidden');
        // Remove overlay after transition completes
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
        }, 300);

        // Restore scrolling
        document.body.style.overflow = '';
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize everything else
    initTheme();
    try {
        await initNavigation();
    } catch (error) {
        console.error('Navigation initialization failed:', error);
    }
    checkAuth();
    initGlobalChat();
});
