const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
const FileManager = require('./utils/fileManager');
const { specs, swaggerUi } = require('./docs/swagger');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

const PORT = process.env.PORT || 5050;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
const authRoutes = require('./routes/auth.route');
const productsRoutes = require('./routes/products.route');
const ordersRoutes = require('./routes/orders.route');

app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/orders', ordersRoutes);

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Serve frontend pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/pages/index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/pages/login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/pages/register.html'));
});

app.get('/catalog', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/pages/catalog.html'));
});

app.get('/product/:id', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/pages/product.html'));
});

app.get('/cart', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/pages/cart.html'));
});

app.get('/checkout', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/pages/checkout.html'));
});

app.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/pages/profile.html'));
});

app.get('/seller', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/pages/seller.html'));
});

app.get('/chat', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/pages/chat.html'));
});

// Socket.io for real-time chat
const messagesDB = new FileManager('data/messages.json');
const connectedUsers = new Map();
const typingUsers = new Set();

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join room
    socket.on('join-room', async ({ room, username }) => {
        socket.join(room);
        connectedUsers.set(socket.id, { username, room });

        // Load message history
        const messages = await messagesDB.read();
        const roomMessages = messages.filter(msg => msg.room === room);
        socket.emit('message-history', roomMessages);

        // Broadcast user joined
        socket.to(room).emit('user-joined', { username });

        // Send updated user list
        const roomUsers = Array.from(connectedUsers.values())
            .filter(user => user.room === room)
            .map(user => user.username);
        io.to(room).emit('users-update', roomUsers);
    });

    // Send message with cooldown check
    socket.on('send-message', async ({ room, username, message }) => {
        const now = Date.now();
        const userInfo = connectedUsers.get(socket.id);

        if (userInfo) {
            const lastMessageTime = userInfo.lastMessageTime || 0;
            const cooldown = 1000; // 1 second cooldown

            if (now - lastMessageTime < cooldown) {
                socket.emit('cooldown-error', {
                    message: 'Please wait before sending another message'
                });
                return;
            }

            userInfo.lastMessageTime = now;
            connectedUsers.set(socket.id, userInfo);
        }

        const newMessage = {
            id: Date.now().toString(),
            room,
            username,
            message,
            timestamp: new Date().toISOString()
        };

        await messagesDB.append(newMessage);
        io.to(room).emit('new-message', newMessage);
    });

    // Typing indicator
    socket.on('typing-start', ({ room, username }) => {
        const typingKey = `${socket.id}-${room}`;
        typingUsers.add(typingKey);
        socket.to(room).emit('user-typing', { username, typing: true });
    });

    socket.on('typing-stop', ({ room, username }) => {
        const typingKey = `${socket.id}-${room}`;
        typingUsers.delete(typingKey);
        socket.to(room).emit('user-typing', { username, typing: false });
    });

    // Disconnect
    socket.on('disconnect', () => {
        const userInfo = connectedUsers.get(socket.id);

        if (userInfo) {
            const { room, username } = userInfo;
            socket.to(room).emit('user-left', { username });

            connectedUsers.delete(socket.id);

            // Update user list
            const roomUsers = Array.from(connectedUsers.values())
                .filter(user => user.room === room)
                .map(user => user.username);
            io.to(room).emit('users-update', roomUsers);
        }

        console.log('User disconnected:', socket.id);
    });
});

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`API Documentation available at http://localhost:${PORT}/api-docs`);
});
