// Common utilities and functions

const API_BASE = "http://localhost:5050/api";

// Theme management
function initTheme() {
  const theme = localStorage.getItem("theme") || "light";
  document.documentElement.setAttribute("data-theme", theme);
  const themeToggle = document.getElementById("themeToggle");
  if (themeToggle) {
    themeToggle.textContent = theme === "dark" ? "☀️" : "🌙";
    themeToggle.addEventListener("click", toggleTheme);
  }
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);
  document.getElementById("themeToggle").textContent = newTheme === "dark" ? "☀️" : "🌙";
}

// Hamburger menu
function initHamburger() {
  const hamburger = document.getElementById("hamburger");
  const navLinks = document.getElementById("navLinks");

  if (hamburger && navLinks) {
    hamburger.addEventListener("click", () => {
      const isActive = hamburger.classList.toggle("active");
      navLinks.classList.toggle("active");
      hamburger.textContent = isActive ? "✕" : "☰";
    });

    // Close menu when clicking a link
    navLinks.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        hamburger.classList.remove("active");
        navLinks.classList.remove("active");
        hamburger.textContent = "☰";
      });
    });
  }
}

// Auth utilities
function getToken() {
  return localStorage.getItem("token");
}

function setToken(token) {
  localStorage.setItem("token", token);
}

function removeToken() {
  localStorage.removeItem("token");
}

function getUser() {
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
}

function setUser(user) {
  localStorage.setItem("user", JSON.stringify(user));
}

function removeUser() {
  localStorage.removeItem("user");
}

function isAuthenticated() {
  return !!getToken();
}

async function validateToken() {
  const token = getToken();
  if (!token) return false;

  try {
    const response = await fetch(`${API_BASE}/auth/validate`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      setUser(data.user);
      return true;
    } else {
      removeToken();
      removeUser();
      return false;
    }
  } catch (error) {
    console.error("Token validation error:", error);
    return false;
  }
}

function logout() {
  removeToken();
  removeUser();
  clearCart();
  window.location.href = "/login";
}

// Update auth links in navigation
async function updateAuthLinks() {
  const authLinksContainer = document.getElementById("authLinks");
  if (!authLinksContainer) return;

  const isValid = await validateToken();
  const user = getUser();

  if (isValid && user) {
    authLinksContainer.innerHTML = `
      <li><a href="/profile">Profile</a></li>
      ${user.role === "seller" || user.role === "admin" ? "<li><a href='/seller'>Seller Dashboard</a></li>" : ""}
      <li><a href="#" onclick="logout()">Logout</a></li>
    `;
  } else {
    authLinksContainer.innerHTML = `
      <li><a href="/login">Login</a></li>
      <li><a href="/register">Register</a></li>
    `;
  }
}

// Cart utilities
function getCart() {
  const cartStr = localStorage.getItem("cart");
  return cartStr ? JSON.parse(cartStr) : [];
}

function setCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
}

function clearCart() {
  localStorage.removeItem("cart");
  updateCartCount();
}

function addToCart(product, quantity = 1) {
  const cart = getCart();
  const existingItem = cart.find(item => item.id === product.id);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({ ...product, quantity });
  }

  setCart(cart);
}

function removeFromCart(productId) {
  let cart = getCart();
  cart = cart.filter(item => item.id !== productId);
  setCart(cart);
}

function updateCartQuantity(productId, quantity) {
  const cart = getCart();
  const item = cart.find(item => item.id === productId);

  if (item) {
    item.quantity = parseInt(quantity);
    if (item.quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(cart);
    }
  }
}

function getCartTotal() {
  const cart = getCart();
  return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

function updateCartCount() {
  const cart = getCart();
  const count = cart.reduce((total, item) => total + item.quantity, 0);
  const cartCountElements = document.querySelectorAll("#cartCount");
  cartCountElements.forEach(el => el.textContent = count);
}

// Protected routes
function requireAuth() {
  if (!isAuthenticated()) {
    window.location.href = "/login";
    return false;
  }
  return true;
}

async function requireSeller() {
  if (!isAuthenticated()) {
    window.location.href = "/login";
    return false;
  }

  const isValid = await validateToken();
  const user = getUser();

  if (!isValid || (user.role !== "seller" && user.role !== "admin")) {
    alert("Access denied. Seller role required.");
    window.location.href = "/";
    return false;
  }

  return true;
}

// Show message
function showMessage(elementId, message, type = "error") {
  const messageEl = document.getElementById(elementId);
  if (messageEl) {
    messageEl.textContent = message;
    messageEl.className = type;
  }
}

// Format price
function formatPrice(price) {
  return `$${parseFloat(price).toFixed(2)}`;
}

// Format date
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString() + " " + date.toLocaleTimeString();
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initHamburger();
  updateAuthLinks();
  updateCartCount();
});
