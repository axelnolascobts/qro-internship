# E-Commerce Full Stack Application

A complete full-stack e-commerce application built with Node.js, Express, Socket.io, and Vanilla JavaScript.

## Technologies Used

- **Backend**: Node.js, Express.js
- **Real-time**: Socket.io
- **Authentication**: JWT (JSON Web Tokens)
- **Database**: JSON files
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Documentation**: Swagger UI

## Features

### 1. Authentication System
- User registration with validation
- Password hashing with bcryptjs
- JWT-based authentication
- Protected routes with middleware
- Session management with token expiration (1 hour)
- Login/Logout functionality

### 2. Product Catalog
- View all products with pagination
- Product detail page
- Advanced filtering:
  - Filter by category
  - Filter by price range
  - Text search (name and description)
- Sorting options:
  - Price (ascending/descending)
  - Name (A-Z, Z-A)
  - Date (newest/oldest)
- Responsive product grid layout

### 3. Shopping Cart
- Add products to cart
- Edit product quantities
- Remove products from cart
- Persistent cart using localStorage
- Real-time cart badge updates
- Cart summary with totals

### 4. Checkout & Orders
- Secure checkout process
- Shipping address collection
- Payment information (encrypted storage)
- Order confirmation
- Order history in user profile
- Automatic stock management

### 5. Seller Dashboard
- Create new products
- Edit existing products
- Delete products
- View all products
- Role-based access control (seller/admin only)

### 6. Real-time Chat Support
- Live chat using Socket.io
- Multiple chat rooms (general support, order support)
- Connected users list
- Message history
- Typing indicators
- Message cooldown (1 second)
- Real-time notifications
- Sound alerts for new messages

### 7. Responsive Design
- 100% mobile-friendly (360px and above)
- Hamburger menu for mobile navigation
- Grid and flexbox layouts
- Touch-friendly buttons and inputs
- Optimized for all screen sizes

### 8. Dark/Light Mode
- Theme toggle
- Persistent theme selection
- Smooth transitions
- All pages support both themes

## API Documentation

The API is fully documented using Swagger and available at:
```
http://localhost:5050/api-docs
```

### API Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/validate` - Validate token

#### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (seller only)
- `PUT /api/products/:id` - Update product (seller only)
- `DELETE /api/products/:id` - Delete product (seller only)

#### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get order by ID

#### WebSocket Events
- `join-room` - Join chat room
- `send-message` - Send message
- `typing-start` - Start typing indicator
- `typing-stop` - Stop typing indicator

## Installation & Setup

1. **Install dependencies**:
```bash
npm install
```

2. **Start the server**:
```bash
npm start
```

3. **Access the application**:
- Main site: http://localhost:5050
- API Documentation: http://localhost:5050/api-docs

## Project Structure

```
├── backend/
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── orders.controller.js
│   │   └── products.controller.js
│   ├── docs/
│   │   └── swagger.js
│   ├── middleware/
│   │   └── auth.middleware.js
│   ├── routes/
│   │   ├── auth.route.js
│   │   ├── orders.route.js
│   │   └── products.route.js
│   ├── utils/
│   │   ├── fileManager.js
│   │   └── jwt.util.js
│   └── server.js
├── data/
│   ├── messages.json
│   ├── orders.json
│   ├── products.json
│   └── users.json
├── public/
│   ├── css/
│   │   └── main.css
│   ├── js/
│   │   └── common.js
│   └── pages/
│       ├── cart.html
│       ├── catalog.html
│       ├── chat.html
│       ├── checkout.html
│       ├── index.html
│       ├── login.html
│       ├── product.html
│       ├── profile.html
│       ├── register.html
│       └── seller.html
└── package.json
```

## Pages

1. **Home** (`/`) - Landing page with featured products
2. **Login** (`/login`) - User authentication
3. **Register** (`/register`) - User registration
4. **Catalog** (`/catalog`) - Browse all products with filters
5. **Product** (`/product/:id`) - Detailed product view
6. **Cart** (`/cart`) - Shopping cart management
7. **Checkout** (`/checkout`) - Order placement
8. **Profile** (`/profile`) - User profile and order history
9. **Seller** (`/seller`) - Seller dashboard (CRUD products)
10. **Chat** (`/chat`) - Real-time support chat

## Security Features

- Password hashing using bcryptjs
- JWT token authentication
- Sensitive payment data encryption
- Protected API routes
- Input validation
- SQL injection prevention (JSON-based storage)

## Data Persistence

All data is stored in JSON files:
- `users.json` - User accounts
- `products.json` - Product catalog
- `orders.json` - Order history
- `messages.json` - Chat messages

Data persists between server restarts.

## Testing the Application

### Create a Seller Account
1. Register a new user and select "Seller - Sell products" as account type
2. Login with your seller credentials
3. Access the seller dashboard immediately

### Create a Customer Account
1. Register a new user and select "Customer - Buy products" as account type
2. Login with your customer credentials
3. Browse products and shop normally

### Test Features
1. Browse products in the catalog
2. Use filters and search
3. Add products to cart
4. Complete checkout process
5. View orders in profile
6. Use the chat support
7. Test dark/light mode toggle

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers (iOS Safari, Chrome Mobile)

## Responsive Breakpoints

- Mobile: 360px - 768px
- Tablet: 769px - 1024px
- Desktop: 1025px+

## Future Enhancements

- User profile editing
- Password reset functionality
- Order status tracking
- Product reviews and ratings
- Wishlist functionality
- Advanced admin panel
- Email notifications
- Payment gateway integration
- Image upload for products
- Search suggestions
- Product recommendations

## Notes

- Port: 5050 (as required)
- JWT expiration: 1 hour
- Message cooldown: 1 second
- Default theme: Light mode
- Max file upload size: Not implemented (uses URLs)

## Development

For development with auto-reload:
```bash
npm run dev
```

## License

This project is for educational purposes.
