const FileManager = require('../utils/fileManager');
const crypto = require('crypto');
const ordersDB = new FileManager('data/orders.json');
const productsDB = new FileManager('data/products.json');

// Simple encryption for sensitive data
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-32-character-secret-key!!';
const ALGORITHM = 'aes-256-cbc';

function encrypt(text) {
    const iv = crypto.randomBytes(16);
    const key = Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32));
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
}

function decrypt(text) {
    const parts = text.split(':');
    const iv = Buffer.from(parts.shift(), 'hex');
    const key = Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32));
    const encryptedText = parts.join(':');
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

async function createOrder(req, res) {
    try {
        const { items, shippingAddress, cardNumber, cardHolder, cardExpiry, cardCVV } = req.body;
        const userId = req.user.id;

        // Validation
        if (!items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Cart is empty'
            });
        }

        if (!shippingAddress || !cardNumber || !cardHolder) {
            return res.status(400).json({
                success: false,
                message: 'Shipping address and payment information are required'
            });
        }

        // Verify products and calculate total
        const products = await productsDB.read();
        let total = 0;
        const orderItems = [];

        for (const item of items) {
            const product = products.find(p => p.id === item.productId);

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: `Product ${item.productId} not found`
                });
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${product.name}`
                });
            }

            const itemTotal = product.price * item.quantity;
            total += itemTotal;

            orderItems.push({
                productId: product.id,
                name: product.name,
                price: product.price,
                quantity: item.quantity,
                subtotal: itemTotal
            });

            // Update product stock
            await productsDB.update(product.id, {
                stock: product.stock - item.quantity
            });
        }

        // Encrypt sensitive payment information
        const encryptedCardNumber = encrypt(cardNumber);
        const encryptedCVV = encrypt(cardCVV);

        const newOrder = {
            id: Date.now().toString(),
            userId,
            items: orderItems,
            total,
            shippingAddress,
            paymentInfo: {
                cardNumber: encryptedCardNumber,
                cardHolder,
                cardExpiry,
                cardCVV: encryptedCVV
            },
            status: 'pending',
            createdAt: new Date().toISOString()
        };

        await ordersDB.append(newOrder);

        // Remove sensitive info from response
        const responseOrder = { ...newOrder };
        responseOrder.paymentInfo = {
            cardHolder,
            cardLast4: cardNumber.slice(-4)
        };

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            order: responseOrder
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating order',
            error: error.message
        });
    }
}

async function getOrderById(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const order = await ordersDB.findById(id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Only allow users to see their own orders (or admin)
        if (order.userId !== userId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Remove sensitive payment info
        const responseOrder = { ...order };
        if (responseOrder.paymentInfo) {
            responseOrder.paymentInfo = {
                cardHolder: responseOrder.paymentInfo.cardHolder,
                cardLast4: '****'
            };
        }

        res.json({
            success: true,
            order: responseOrder
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching order',
            error: error.message
        });
    }
}

async function getUserOrders(req, res) {
    try {
        const userId = req.user.id;
        const orders = await ordersDB.read();

        const userOrders = orders
            .filter(order => order.userId === userId)
            .map(order => {
                const responseOrder = { ...order };
                if (responseOrder.paymentInfo) {
                    responseOrder.paymentInfo = {
                        cardHolder: responseOrder.paymentInfo.cardHolder,
                        cardLast4: '****'
                    };
                }
                return responseOrder;
            })
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.json({
            success: true,
            orders: userOrders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching orders',
            error: error.message
        });
    }
}

module.exports = {
    createOrder,
    getOrderById,
    getUserOrders
};
