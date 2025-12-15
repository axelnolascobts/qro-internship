async function loadProfile() {
  if (!requireAuth()) return;

  const user = getUser();
  const userInfo = document.getElementById("userInfo");

  userInfo.innerHTML = `
    <div style="margin: 1rem 0;">
      <strong>Name:</strong> ${user.name} ${user.lastname}
    </div>
    <div style="margin: 1rem 0;">
      <strong>Email:</strong> ${user.email}
    </div>
    <div style="margin: 1rem 0;">
      <strong>Role:</strong> ${user.role.charAt(0).toUpperCase() + user.role.slice(1)}
    </div>
  `;

  await loadOrders();
}

async function loadOrders() {
  const loading = document.getElementById("loading");
  const ordersList = document.getElementById("ordersList");
  const emptyState = document.getElementById("emptyState");

  loading.classList.remove("hidden");
  ordersList.innerHTML = "";
  emptyState.classList.add("hidden");

  try {
    const response = await fetch(`${API_BASE}/orders`, {
      headers: {
        "Authorization": `Bearer ${getToken()}`
      }
    });

    const orders = await response.json();
    loading.classList.add("hidden");

    if (orders.length === 0) {
      emptyState.classList.remove("hidden");
      return;
    }

    ordersList.innerHTML = orders.map(order => `
      <div class="cart-summary" style="margin-bottom: 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <h3>Order #${order.id}</h3>
          <span style="background: var(--primary-color); color: white; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.875rem;">
            ${order.status}
          </span>
        </div>
        <p style="color: #666; font-size: 0.875rem; margin-bottom: 1rem;">
          ${formatDate(order.createdAt)}
        </p>
        <div style="margin: 1rem 0;">
          ${order.items.map(item => `
            <div style="display: flex; justify-content: space-between; margin: 0.5rem 0;">
              <span>${item.name} x ${item.quantity}</span>
              <span>${formatPrice(item.subtotal)}</span>
            </div>
          `).join("")}
        </div>
        <hr style="margin: 1rem 0; border: none; border-top: 1px solid var(--border-color);">
        <div style="display: flex; justify-content: space-between;">
          <strong>Total:</strong>
          <strong class="product-price">${formatPrice(order.total)}</strong>
        </div>
        <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border-color);">
          <p style="font-size: 0.875rem;"><strong>Shipping Address:</strong></p>
          <p style="font-size: 0.875rem; color: #666;">
            ${order.shippingAddress.street}, ${order.shippingAddress.city}, 
            ${order.shippingAddress.state} ${order.shippingAddress.zipCode}, 
            ${order.shippingAddress.country}
          </p>
        </div>
      </div>
    `).join("");

  } catch (error) {
    console.error("Error loading orders:", error);
    loading.classList.add("hidden");
    emptyState.classList.remove("hidden");
  }
}

document.addEventListener("DOMContentLoaded", loadProfile);
