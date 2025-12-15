const productId = window.location.pathname.split("/").pop();

async function loadProduct() {
  const loading = document.getElementById("loading");
  const productDetail = document.getElementById("productDetail");

  try {
    const response = await fetch(`${API_BASE}/products/${productId}`);
    
    if (!response.ok) {
      throw new Error("Product not found");
    }

    const product = await response.json();

    loading.classList.add("hidden");
    productDetail.classList.remove("hidden");

    document.getElementById("productImage").src = product.image;
    document.getElementById("productName").textContent = product.name;
    document.getElementById("productDescription").textContent = product.description;
    document.getElementById("productPrice").textContent = formatPrice(product.price);
    document.getElementById("productCategory").textContent = product.category;
    document.getElementById("productStock").textContent = `In stock: ${product.stock}`;
    
    const quantityInput = document.getElementById("quantity");
    quantityInput.max = product.stock;

    document.getElementById("addToCartBtn").addEventListener("click", () => {
      const quantity = parseInt(quantityInput.value);
      
      if (quantity > product.stock) {
        showMessage("message", "Insufficient stock");
        return;
      }

      addToCart(product, quantity);
      showMessage("message", "Product added to cart!", "success");
      
      setTimeout(() => {
        window.location.href = "/cart";
      }, 1000);
    });

  } catch (error) {
    console.error("Error loading product:", error);
    loading.innerHTML = '<p>Product not found</p><a href="/catalog" class="btn btn-primary">Back to Catalog</a>';
  }
}

document.addEventListener("DOMContentLoaded", loadProduct);
