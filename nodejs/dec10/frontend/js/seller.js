let editingProductId = null;

async function loadProducts() {
  if (!await requireSeller()) return;

  const loading = document.getElementById("loading");
  const productsGrid = document.getElementById("productsGrid");

  loading.classList.remove("hidden");
  productsGrid.innerHTML = "";

  try {
    const response = await fetch(`${API_BASE}/products`);
    const data = await response.json();

    loading.classList.add("hidden");

    if (data.products.length === 0) {
      productsGrid.innerHTML = '<div class="empty-state"><p>No products yet. Add your first product!</p></div>';
      return;
    }

    renderProducts(data.products);
  } catch (error) {
    console.error("Error loading products:", error);
    loading.classList.add("hidden");
  }
}

function renderProducts(products) {
  const productsGrid = document.getElementById("productsGrid");
  
  productsGrid.innerHTML = products.map(product => `
    <div class="product-card">
      <img src="${product.image}" alt="${product.name}" class="product-image" onerror="this.src='https://via.placeholder.com/500'">
      <div class="product-info">
        <span class="product-category">${product.category}</span>
        <h3 class="product-name">${product.name}</h3>
        <p class="product-description">${product.description}</p>
        <div class="product-price">${formatPrice(product.price)}</div>
        <p style="margin: 0.5rem 0; font-size: 0.875rem; color: #666;">Stock: ${product.stock}</p>
        <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
          <button class="btn btn-primary" style="flex: 1;" onclick="editProduct('${product.id}')">
            Edit
          </button>
          <button class="btn btn-danger" style="flex: 1;" onclick="deleteProduct('${product.id}')">
            Delete
          </button>
        </div>
      </div>
    </div>
  `).join("");
}

function openModal(productId = null) {
  const modal = document.getElementById("productModal");
  const modalTitle = document.getElementById("modalTitle");
  const form = document.getElementById("productForm");
  
  form.reset();
  editingProductId = productId;

  if (productId) {
    modalTitle.textContent = "Edit Product";
    loadProductForEdit(productId);
  } else {
    modalTitle.textContent = "Add Product";
    document.getElementById("productId").value = "";
  }

  modal.classList.add("active");
}

function closeModal() {
  const modal = document.getElementById("productModal");
  modal.classList.remove("active");
  editingProductId = null;
}

async function loadProductForEdit(productId) {
  try {
    const response = await fetch(`${API_BASE}/products/${productId}`);
    const product = await response.json();

    document.getElementById("productId").value = product.id;
    document.getElementById("name").value = product.name;
    document.getElementById("description").value = product.description;
    document.getElementById("price").value = product.price;
    document.getElementById("category").value = product.category;
    document.getElementById("stock").value = product.stock;
    document.getElementById("image").value = product.image;
  } catch (error) {
    console.error("Error loading product:", error);
    alert("Failed to load product");
  }
}

async function editProduct(productId) {
  openModal(productId);
}

async function deleteProduct(productId) {
  if (!confirm("Are you sure you want to delete this product?")) return;

  try {
    const response = await fetch(`${API_BASE}/products/${productId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${getToken()}`
      }
    });

    if (response.ok) {
      alert("Product deleted successfully");
      loadProducts();
    } else {
      const data = await response.json();
      alert(data.error || "Failed to delete product");
    }
  } catch (error) {
    console.error("Error deleting product:", error);
    alert("An error occurred");
  }
}

document.getElementById("addProductBtn").addEventListener("click", () => openModal());
document.getElementById("closeModal").addEventListener("click", closeModal);

document.getElementById("productForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const productData = {
    name: document.getElementById("name").value,
    description: document.getElementById("description").value,
    price: parseFloat(document.getElementById("price").value),
    category: document.getElementById("category").value,
    stock: parseInt(document.getElementById("stock").value),
    image: document.getElementById("image").value || "https://via.placeholder.com/500"
  };

  // Validation
  if (productData.price <= 0) {
    showMessage("modalMessage", "Price must be greater than 0");
    return;
  }

  if (productData.stock < 0) {
    showMessage("modalMessage", "Stock cannot be negative");
    return;
  }

  const isEdit = !!editingProductId;
  const url = isEdit ? `${API_BASE}/products/${editingProductId}` : `${API_BASE}/products`;
  const method = isEdit ? "PUT" : "POST";

  try {
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getToken()}`
      },
      body: JSON.stringify(productData)
    });

    const data = await response.json();

    if (response.ok) {
      showMessage("modalMessage", `Product ${isEdit ? "updated" : "created"} successfully!`, "success");
      setTimeout(() => {
        closeModal();
        loadProducts();
      }, 1000);
    } else {
      showMessage("modalMessage", data.error || "Operation failed");
    }
  } catch (error) {
    console.error("Error saving product:", error);
    showMessage("modalMessage", "An error occurred");
  }
});

// Close modal when clicking outside
document.getElementById("productModal").addEventListener("click", (e) => {
  if (e.target.id === "productModal") {
    closeModal();
  }
});

document.addEventListener("DOMContentLoaded", loadProducts);
