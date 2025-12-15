function renderOrderSummary() {
  const cart = getCart();
  
  if (cart.length === 0) {
    window.location.href = "/cart";
    return;
  }

  const orderItems = document.getElementById("orderItems");
  orderItems.innerHTML = cart.map(item => `
    <div style="display: flex; justify-content: space-between; margin: 0.5rem 0;">
      <span>${item.name} x ${item.quantity}</span>
      <span>${formatPrice(item.price * item.quantity)}</span>
    </div>
  `).join("");

  const total = getCartTotal();
  document.getElementById("total").textContent = formatPrice(total);
}

document.getElementById("checkoutForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!requireAuth()) return;

  const cart = getCart();
  if (cart.length === 0) {
    alert("Your cart is empty");
    window.location.href = "/cart";
    return;
  }

  const shippingAddress = {
    street: document.getElementById("street").value,
    city: document.getElementById("city").value,
    state: document.getElementById("state").value,
    zipCode: document.getElementById("zipCode").value,
    country: document.getElementById("country").value
  };

  const paymentInfo = {
    cardNumber: document.getElementById("cardNumber").value,
    cardHolder: document.getElementById("cardHolder").value,
    expiryDate: document.getElementById("expiryDate").value,
    cvv: document.getElementById("cvv").value
  };

  // Validate card number
  if (!/^\d{16}$/.test(paymentInfo.cardNumber)) {
    showMessage("message", "Card number must be 16 digits");
    return;
  }

  // Validate expiry date format
  if (!/^\d{2}\/\d{2}$/.test(paymentInfo.expiryDate)) {
    showMessage("message", "Expiry date must be in MM/YY format");
    return;
  }

  // Validate CVV
  if (!/^\d{3,4}$/.test(paymentInfo.cvv)) {
    showMessage("message", "CVV must be 3 or 4 digits");
    return;
  }

  const items = cart.map(item => ({
    productId: item.id,
    quantity: item.quantity
  }));

  const placeOrderBtn = document.getElementById("placeOrderBtn");
  placeOrderBtn.disabled = true;
  placeOrderBtn.textContent = "Processing...";

  try {
    const response = await fetch(`${API_BASE}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getToken()}`
      },
      body: JSON.stringify({ items, shippingAddress, paymentInfo })
    });

    const data = await response.json();

    if (response.ok) {
      clearCart();
      showMessage("message", "Order placed successfully!", "success");
      setTimeout(() => {
        window.location.href = "/profile";
      }, 2000);
    } else {
      showMessage("message", data.error || "Failed to place order");
      placeOrderBtn.disabled = false;
      placeOrderBtn.textContent = "Place Order";
    }
  } catch (error) {
    console.error("Checkout error:", error);
    showMessage("message", "An error occurred. Please try again.");
    placeOrderBtn.disabled = false;
    placeOrderBtn.textContent = "Place Order";
  }
});

// Format expiry date input
document.getElementById("expiryDate").addEventListener("input", (e) => {
  let value = e.target.value.replace(/\D/g, "");
  if (value.length >= 2) {
    value = value.slice(0, 2) + "/" + value.slice(2, 4);
  }
  e.target.value = value;
});

document.addEventListener("DOMContentLoaded", () => {
  if (!requireAuth()) return;
  renderOrderSummary();
});
