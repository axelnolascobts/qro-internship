function renderCart() {
  const cart = getCart();
  const emptyCart = document.getElementById("emptyCart");
  const cartContent = document.getElementById("cartContent");
  const cartItems = document.getElementById("cartItems");

  if (cart.length === 0) {
    emptyCart.classList.remove("hidden");
    cartContent.classList.add("hidden");
    return;
  }

  emptyCart.classList.add("hidden");
  cartContent.classList.remove("hidden");

  cartItems.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}" class="cart-item-image" onerror="this.src='https://via.placeholder.com/100'">
      <div class="cart-item-info">
        <h3>${item.name}</h3>
        <p>${item.category}</p>
        <p class="product-price">${formatPrice(item.price)}</p>
      </div>
      <div class="cart-item-actions">
        <input 
          type="number" 
          class="quantity-input" 
          value="${item.quantity}" 
          min="1" 
          max="${item.stock || 999}"
          onchange="updateCartQuantity('${item.id}', this.value); renderCart();"
        >
        <button class="btn btn-danger" onclick="removeFromCart('${item.id}'); renderCart();">
          Remove
        </button>
      </div>
    </div>
  `).join("");

  updateCartSummary();
}

function updateCartSummary() {
  const total = getCartTotal();
  document.getElementById("subtotal").textContent = formatPrice(total);
  document.getElementById("total").textContent = formatPrice(total);
}

document.addEventListener("DOMContentLoaded", renderCart);
