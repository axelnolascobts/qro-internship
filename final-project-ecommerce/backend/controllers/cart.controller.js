const FileManager = require('../utils/fileManager');
const productsDB = new FileManager('data/products.json');
const cartsDB = new FileManager('data/carts.json');

async function getCart(req, res) {
    try {
        const userId = req.user.id;
        const carts = await cartsDB.read();
        let cart = carts.find(c => c.userId === userId);

        if (!cart) {
            cart = {
                id: Date.now().toString(),
                userId,
                items: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            await cartsDB.append(cart);
        }

        res.json({
            success: true,
            cart: cart
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching cart',
            error: error.message
        });
    }
}

async function addToCart(req, res) {
    try {
        const userId = req.user.id;
        const { productId, quantity = 1 } = req.body;

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: 'Product ID is required'
            });
        }

        // Verify product exists and get details
        const products = await productsDB.read();
        const product = products.find(p => p.id === productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        if (product.stock < quantity) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient stock'
            });
        }

        const carts = await cartsDB.read();
        let cart = carts.find(c => c.userId === userId);

        if (!cart) {
            cart = {
                id: Date.now().toString(),
                userId,
                items: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
        }

        const existingItem = cart.items.find(item => item.productId === productId);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.items.push({
                productId: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: quantity
            });
        }

        cart.updatedAt = new Date().toISOString();

        // Update the cart in database
        if (cart.id) {
            await cartsDB.update(cart.id, cart);
        } else {
            // If cart doesn't have an ID, find it by userId and update
            const carts = await cartsDB.read();
            const cartIndex = carts.findIndex(c => c.userId === userId);
            if (cartIndex !== -1) {
                carts[cartIndex] = cart;
                await cartsDB.write(carts);
            }
        }

        res.json({
            success: true,
            message: 'Product added to cart',
            cart: cart
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error adding to cart',
            error: error.message
        });
    }
}

async function updateCartItem(req, res) {
    try {
        const userId = req.user.id;
        const { productId, quantity } = req.body;

        if (!productId || quantity === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Product ID and quantity are required'
            });
        }

        if (quantity <= 0) {
            return removeFromCart(req, res);
        }

        const carts = await cartsDB.read();
        const cart = carts.find(c => c.userId === userId);

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        const item = cart.items.find(item => item.productId === productId);

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Item not found in cart'
            });
        }

        // Verify product has sufficient stock
        const products = await productsDB.read();
        const product = products.find(p => p.id === productId);

        if (product && product.stock < quantity) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient stock'
            });
        }

        item.quantity = quantity;
        cart.updatedAt = new Date().toISOString();

        // Update the cart in database
        if (cart.id) {
            await cartsDB.update(cart.id, cart);
        } else {
            // If cart doesn't have an ID, find it by userId and update
            const carts = await cartsDB.read();
            const cartIndex = carts.findIndex(c => c.userId === userId);
            if (cartIndex !== -1) {
                carts[cartIndex] = cart;
                await cartsDB.write(carts);
            }
        }

        res.json({
            success: true,
            message: 'Cart item updated',
            cart: cart
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating cart item',
            error: error.message
        });
    }
}

async function removeFromCart(req, res) {
    try {
        const userId = req.user.id;
        const { productId } = req.body;

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: 'Product ID is required'
            });
        }

        const carts = await cartsDB.read();
        const cart = carts.find(c => c.userId === userId);

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        const initialLength = cart.items.length;
        cart.items = cart.items.filter(item => item.productId !== productId);

        if (cart.items.length === initialLength) {
            return res.status(404).json({
                success: false,
                message: 'Item not found in cart'
            });
        }

        cart.updatedAt = new Date().toISOString();

        // Update the cart in database
        if (cart.id) {
            await cartsDB.update(cart.id, cart);
        } else {
            // If cart doesn't have an ID, find it by userId and update
            const carts = await cartsDB.read();
            const cartIndex = carts.findIndex(c => c.userId === userId);
            if (cartIndex !== -1) {
                carts[cartIndex] = cart;
                await cartsDB.write(carts);
            }
        }

        res.json({
            success: true,
            message: 'Item removed from cart',
            cart: cart
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error removing from cart',
            error: error.message
        });
    }
}

async function clearCart(req, res) {
    try {
        const userId = req.user.id;
        const carts = await cartsDB.read();
        const cart = carts.find(c => c.userId === userId);

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        cart.items = [];
        cart.updatedAt = new Date().toISOString();

        // Update the cart in database
        if (cart.id) {
            await cartsDB.update(cart.id, cart);
        } else {
            // If cart doesn't have an ID, find it by userId and update
            const carts = await cartsDB.read();
            const cartIndex = carts.findIndex(c => c.userId === userId);
            if (cartIndex !== -1) {
                carts[cartIndex] = cart;
                await cartsDB.write(carts);
            }
        }

        res.json({
            success: true,
            message: 'Cart cleared',
            cart: cart
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error clearing cart',
            error: error.message
        });
    }
}

async function mergeCart(req, res) {
    try {
        const userId = req.user.id;
        const { localCart } = req.body;

        if (!Array.isArray(localCart)) {
            return res.status(400).json({
                success: false,
                message: 'Local cart must be an array'
            });
        }

        const carts = await cartsDB.read();
        let cart = carts.find(c => c.userId === userId);

        if (!cart) {
            cart = {
                id: Date.now().toString(),
                userId,
                items: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            await cartsDB.append(cart);
        }

        const products = await productsDB.read();

        for (const localItem of localCart) {
            const product = products.find(p => p.id === localItem.productId);
            
            if (!product) {
                continue; // Skip invalid products
            }

            const existingItem = cart.items.find(item => item.productId === localItem.productId);

            if (existingItem) {
                existingItem.quantity += localItem.quantity || 1;
            } else {
                cart.items.push({
                    productId: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.image,
                    quantity: localItem.quantity || 1
                });
            }
        }

        cart.updatedAt = new Date().toISOString();

        // Update the cart in database
        if (cart.id) {
            await cartsDB.update(cart.id, cart);
        } else {
            // If cart doesn't have an ID, find it by userId and update
            const carts = await cartsDB.read();
            const cartIndex = carts.findIndex(c => c.userId === userId);
            if (cartIndex !== -1) {
                carts[cartIndex] = cart;
                await cartsDB.write(carts);
            }
        }

        res.json({
            success: true,
            message: 'Cart merged successfully',
            cart: cart
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error merging cart',
            error: error.message
        });
    }
}

module.exports = {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    mergeCart
};