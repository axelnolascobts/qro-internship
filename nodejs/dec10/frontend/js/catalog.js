let currentPage = 1;
const itemsPerPage = 12;

async function loadProducts() {
  const loading = document.getElementById("loading");
  const productsGrid = document.getElementById("productsGrid");
  const emptyState = document.getElementById("emptyState");

  loading.classList.remove("hidden");
  productsGrid.innerHTML = "";
  emptyState.classList.add("hidden");

  // Get filters
  const category = document.getElementById("categoryFilter").value;
  const minPrice = document.getElementById("minPrice").value;
  const maxPrice = document.getElementById("maxPrice").value;
  const search = document.getElementById("searchInput").value;
  const sortBy = document.getElementById("sortBy").value;

  // Build query string
  const params = new URLSearchParams();
  if (category) params.append("category", category);
  if (minPrice) params.append("minPrice", minPrice);
  if (maxPrice) params.append("maxPrice", maxPrice);
  if (search) params.append("search", search);
  if (sortBy) params.append("sortBy", sortBy);
  params.append("page", currentPage);
  params.append("limit", itemsPerPage);

  try {
    const response = await fetch(`${API_BASE}/products?${params.toString()}`);
    const data = await response.json();

    loading.classList.add("hidden");

    if (data.products.length === 0) {
      emptyState.classList.remove("hidden");
      return;
    }

    renderProducts(data.products);
    renderPagination(data.pagination);
  } catch (error) {
    console.error("Error loading products:", error);
    loading.classList.add("hidden");
    emptyState.classList.remove("hidden");
  }
}

function renderProducts(products) {
  const productsGrid = document.getElementById("productsGrid");
  
  productsGrid.innerHTML = products.map(product => `
    <div class="product-card" onclick="window.location.href='/product/${product.id}'">
      <img src="${product.image}" alt="${product.name}" class="product-image" onerror="this.src='https://via.placeholder.com/500'">
      <div class="product-info">
        <span class="product-category">${product.category}</span>
        <h3 class="product-name">${product.name}</h3>
        <p class="product-description">${product.description}</p>
        <div class="product-price">${formatPrice(product.price)}</div>
        <button class="btn btn-primary" onclick="event.stopPropagation(); quickAddToCart('${product.id}')">
          Add to Cart
        </button>
      </div>
    </div>
  `).join("");
}

function renderPagination(pagination) {
  const paginationEl = document.getElementById("pagination");
  
  if (pagination.totalPages <= 1) {
    paginationEl.innerHTML = "";
    return;
  }

  let html = `
    <button ${pagination.page === 1 ? "disabled" : ""} onclick="changePage(${pagination.page - 1})">
      Previous
    </button>
  `;

  for (let i = 1; i <= pagination.totalPages; i++) {
    if (i === 1 || i === pagination.totalPages || (i >= pagination.page - 2 && i <= pagination.page + 2)) {
      html += `
        <button class="${i === pagination.page ? "active" : ""}" onclick="changePage(${i})">
          ${i}
        </button>
      `;
    } else if (i === pagination.page - 3 || i === pagination.page + 3) {
      html += "<span>...</span>";
    }
  }

  html += `
    <button ${pagination.page === pagination.totalPages ? "disabled" : ""} onclick="changePage(${pagination.page + 1})">
      Next
    </button>
  `;

  paginationEl.innerHTML = html;
}

function changePage(page) {
  currentPage = page;
  loadProducts();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function quickAddToCart(productId) {
  try {
    const response = await fetch(`${API_BASE}/products/${productId}`);
    const product = await response.json();
    addToCart(product, 1);
    alert("Product added to cart!");
  } catch (error) {
    console.error("Error adding to cart:", error);
    alert("Failed to add product to cart");
  }
}

// Event listeners
document.getElementById("applyFilters").addEventListener("click", () => {
  currentPage = 1;
  loadProducts();
});

document.getElementById("searchInput").addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    currentPage = 1;
    loadProducts();
  }
});

// Load URL parameters on page load
document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const category = urlParams.get("category");
  
  if (category) {
    document.getElementById("categoryFilter").value = category;
  }

  loadProducts();
});
