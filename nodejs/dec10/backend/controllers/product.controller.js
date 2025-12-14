import { readJSON, writeJSON } from "../utils/fileHandler.js";

export const getAllProductsController = async (req, res) => {
  try {
    let products = await readJSON("products.json");
    const { category, minPrice, maxPrice, search, sortBy, page = 1, limit = 12 } = req.query;

    if (category) {
      products = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    if (minPrice) {
      products = products.filter(p => p.price >= parseFloat(minPrice));
    }

    if (maxPrice) {
      products = products.filter(p => p.price <= parseFloat(maxPrice));
    }

    if (search) {
      const searchLower = search.toLowerCase();
      products = products.filter(p =>
        p.name.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower)
      );
    }

    if (sortBy) {
      switch (sortBy) {
        case "price-asc":
          products.sort((a, b) => a.price - b.price);
          break;
        case "price-desc":
          products.sort((a, b) => b.price - a.price);
          break;
        case "name-asc":
          products.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case "name-desc":
          products.sort((a, b) => b.name.localeCompare(a.name));
          break;
        case "date-asc":
          products.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          break;
        case "date-desc":
          products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          break;
      }
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedProducts = products.slice(startIndex, endIndex);

    res.status(200).json({
      products: paginatedProducts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: products.length,
        totalPages: Math.ceil(products.length / limitNum)
      }
    });
  } catch (error) {
    console.error("Get all products controller error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export const getProductByIdController = async (req, res) => {
  try {
    const products = await readJSON("products.json");
    const product = products.find(p => p.id === req.params.id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error("Get product by ID controller error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export const createProductController = async (req, res) => {
  try {
    const { name, description, price, category, stock, image } = req.body;
    if (!name || !description || price === undefined || !category || stock === undefined) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (price <= 0) {
      return res.status(400).json({ error: "Price must be greater than 0" });
    }

    if (stock < 0) {
      return res.status(400).json({ error: "Stock cannot be negative" });
    }

    const products = await readJSON("products.json");

    const newProduct = {
      id: Date.now().toString(),
      name,
      description,
      price: parseFloat(price),
      category,
      stock: parseInt(stock),
      image: image || "https://placeholder.com/img.png",
      createdAt: new Date().toISOString()
    };

    products.push(newProduct);
    await writeJSON("products.json", products);

    res.status(201).json({ message: "Product created successfully" });
  } catch (error) {
    console.error("Create product controller error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export const updateProductController = async (req, res) => {
  try {
    const products = await readJSON("products.json");
    const index = products.findIndex(p => p.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: "Product not found" });
    }

    const { name, description, price, category, stock, image } = req.body;
    if (price !== undefined && price <= 0) {
      return res.status(400).json({ error: "Price must be greater than 0" });
    }
    if (stock !== undefined && stock < 0) {
      return res.status(400).json({ error: "Stock cannot be negative" });
    }
    products[index] = {
      ...products[index],
      ...(name && { name }),
      ...(description && { description }),
      ...(price !== undefined && { price: parseFloat(price) }),
      ...(category && { category }),
      ...(stock !== undefined && { stock: parseInt(stock) }),
      ...(image && { image })
    };
    await writeJSON("products.json", products);
    res.status(200).json({ message: "Product updated successfully", product: products[index] });
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export const deleteProductController = async (req, res) => {
  try {
    const products = await readJSON("products.json");
    const index = products.findIndex(p => p.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: "Product not found" });
    }

    products.splice(index, 1);
    await writeJSON("products.json", products);

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete product controller error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}