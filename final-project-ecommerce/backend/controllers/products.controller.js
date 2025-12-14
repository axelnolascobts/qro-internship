const FileManager = require('../utils/fileManager');
const productsDB = new FileManager('data/products.json');

async function getAllProducts(req, res) {
    try {
        const { category, minPrice, maxPrice, search, sort, page = 1, limit = 12 } = req.query;

        let products = await productsDB.read();

        // Filter by category
        if (category && category !== 'all') {
            products = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
        }

        // Filter by price range
        if (minPrice) {
            products = products.filter(p => p.price >= parseFloat(minPrice));
        }
        if (maxPrice) {
            products = products.filter(p => p.price <= parseFloat(maxPrice));
        }

        // Search by name or description
        if (search) {
            const searchLower = search.toLowerCase();
            products = products.filter(p =>
                p.name.toLowerCase().includes(searchLower) ||
                p.description.toLowerCase().includes(searchLower)
            );
        }

        // Sort
        if (sort) {
            switch (sort) {
                case 'price-asc':
                    products.sort((a, b) => a.price - b.price);
                    break;
                case 'price-desc':
                    products.sort((a, b) => b.price - a.price);
                    break;
                case 'name-asc':
                    products.sort((a, b) => a.name.localeCompare(b.name));
                    break;
                case 'name-desc':
                    products.sort((a, b) => b.name.localeCompare(a.name));
                    break;
                case 'date-desc':
                    products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    break;
                case 'date-asc':
                    products.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                    break;
            }
        }

        // Pagination
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const paginatedProducts = products.slice(startIndex, endIndex);

        res.json({
            success: true,
            products: paginatedProducts,
            pagination: {
                total: products.length,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(products.length / limit)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching products',
            error: error.message
        });
    }
}

async function getProductById(req, res) {
    try {
        const { id } = req.params;
        const product = await productsDB.findById(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching product',
            error: error.message
        });
    }
}

async function createProduct(req, res) {
    try {
        const { name, description, price, category, stock, image } = req.body;

        // Validation
        if (!name || !description || !price || !category) {
            return res.status(400).json({
                success: false,
                message: 'Name, description, price, and category are required'
            });
        }

        if (price <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Price must be greater than 0'
            });
        }

        if (stock < 0) {
            return res.status(400).json({
                success: false,
                message: 'Stock cannot be negative'
            });
        }

        const newProduct = {
            id: Date.now().toString(),
            name,
            description,
            price: parseFloat(price),
            category,
            stock: parseInt(stock) || 0,
            image: image || 'https://via.placeholder.com/400',
            createdAt: new Date().toISOString()
        };

        await productsDB.append(newProduct);

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            product: newProduct
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating product',
            error: error.message
        });
    }
}

async function updateProduct(req, res) {
    try {
        const { id } = req.params;
        const { name, description, price, category, stock, image } = req.body;

        const product = await productsDB.findById(id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Validation
        if (price && price <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Price must be greater than 0'
            });
        }

        if (stock && stock < 0) {
            return res.status(400).json({
                success: false,
                message: 'Stock cannot be negative'
            });
        }

        const updates = {};
        if (name) updates.name = name;
        if (description) updates.description = description;
        if (price) updates.price = parseFloat(price);
        if (category) updates.category = category;
        if (stock !== undefined) updates.stock = parseInt(stock);
        if (image) updates.image = image;

        const updatedProduct = await productsDB.update(id, updates);

        res.json({
            success: true,
            message: 'Product updated successfully',
            product: updatedProduct
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating product',
            error: error.message
        });
    }
}

async function deleteProduct(req, res) {
    try {
        const { id } = req.params;
        const deleted = await productsDB.delete(id);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting product',
            error: error.message
        });
    }
}

module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};
