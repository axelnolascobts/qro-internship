import { encrypt } from "../utils/auth.util.js";
import { readJSON, writeJSON } from "../utils/fileHandler.js";

export const createOrderController = async (req, res) => {
  try {
    const { items, shippingAddress, paymentInfo } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Cart cannot be empty" });
    }

    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city ||
      !shippingAddress.state || !shippingAddress.zipCode || !shippingAddress.country) {
      return res.status(400).json({ error: "Complete shipping address is required" });
    }

    if (!paymentInfo || !paymentInfo.cardNumber || !paymentInfo.cardHolder ||
      !paymentInfo.expiryDate || !paymentInfo.cvv) {
      return res.status(400).json({ error: "Complete payment information is required" });
    }

    const products = await readJSON("products.json");
    const orders = await readJSON("orders.json");

    let total = 0;
    const orderItems = [];

    for (const item of items) {
      const product = products.find(p => p.id === item.productId);
      if (!product) {
        return res.status(400).json({ error: `Product ${item.productId} not found` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({
          error: `Insufficient stock for ${product.name}. Available: ${product.stock}`
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

      product.stock -= item.quantity;
    }

    const encryptedCardNumber = encrypt(paymentInfo.cardNumber);
    const encryptedCVV = encrypt(paymentInfo.cvv);

    const newOrder = {
      id: Date.now().toString(),
      userId: req.user.id,
      items: orderItems,
      total,
      shippingAddress,
      paymentInfo: {
        cardNumber: encryptedCardNumber,
        cardHolder: paymentInfo.cardHolder,
        expiryDate: paymentInfo.expiryDate,
        cvv: encryptedCVV
      },
      status: "pending",
      createdAt: new Date().toISOString()
    };

    orders.push(newOrder);

    await writeJSON("orders.json", orders);
    await writeJSON("products.json", products);

    const orderResponse = {
      ...newOrder,
      paymentInfo: {
        cardNumber: `****${paymentInfo.cardNumber.slice(-4)}`,
        cardHolder: paymentInfo.cardHolder,
        expiryDate: paymentInfo.expiryDate
      }
    };

    res.status(201).json({
      message: "Order created successfully",
      order: orderResponse
    });
  } catch (error) {
    console.error("Create order controller error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export const getOrderByIdController = async (req, res) => {
  try {
    const orders = await readJSON("orders.json");
    const order = orders.find(o => o.id === req.body.id);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    if (order.userId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }
    const orderResponse = {
      ...order,
      paymentInfo: {
        cardHolder: order.paymentInfo.cardHolder,
        expiryDate: order.paymentInfo.expiryDate,
        cardNumber: "Encrypted"
      }
    };

    res.status(200).json(orderResponse);

  } catch (error) {
    console.error("Get order by ID controller error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export const getAllOrdersController = async (req, res) => {
  try {
    const orders = await readJSON("orders.json");

    const userOrders = orders.filter(o => o.userId === req.user.id);

    const ordersResponse = userOrders.map(order => ({
      ...order,
      paymentInfo: {
        cardHolder: order.paymentInfo.cardHolder,
        expiryDate: order.paymentInfo.expiryDate,
        cardNumber: "Encrypted"
      }
    }));

    res.status(200).json(ordersResponse);
  } catch (error) {
    console.error("Get all orders controller error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}