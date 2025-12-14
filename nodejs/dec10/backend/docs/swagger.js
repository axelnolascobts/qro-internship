import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "E-shop API Docs",
      version: "1.0.0",
      description: "E-Commerce WebApp API",
    },
    servers: [
      {
        url: "http://localhost:5050",
        description: "Development server"
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT token in the format Bearer <token>"
        }
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "string", example: "1234567890" },
            name: { type: "string", example: "John" },
            lastname: { type: "string", example: "Doe" },
            email: { type: "string", format: "email", example: "john@example.com" },
            birthdate: { type: "string", format: "date", example: "2000-01-01" },
            address: { type: "string", example: "123 Main St" },
            role: { type: "string", enum: ["customer", "seller", "admin"], example: "customer" },
            createdAt: { type: "string", example: "date-time" }
          }
        },
        Product: {
          type: "object",
          properties: {
            id: { type: "string", example: "1" },
            name: { type: "string", example: "Headphones" },
            description: { type: "string", example: "High-quality headphones" },
            price: { type: "number", example: 99.99 },
            category: { type: "string", example: "Electronics" },
            stock: { type: "integer", example: 10 },
            image: { type: "string", example: "https://example.com/pic.jpg" },
            createdAt: { type: "string", example: "date-time" }
          }
        },
        Order: {
          type: "object",
          properties: {
            id: { type: "string", example: "1234567890" },
            userId: { type: "string", example: "1234567890" },
            items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  productId: { type: "string" },
                  name: { type: "string" },
                  price: { type: "number" },
                  quantity: { type: "integer" },
                  subtotal: { type: "number" }
                }
              }
            },
            total: { type: "number", example: 300.00 },
            shippingAddress: {
              type: "object",
              properties: {
                street: { type: "string" },
                city: { type: "string" },
                state: { type: "string" },
                zipCode: { type: "string" },
                country: { type: "string" }
              }
            },
            status: { type: "string", enum: ["pending", "processing", "shipped", "delivered"], example: "pending" },
            createdAt: { type: "string", format: "date-time" }
          }
        },
        Error: {
          type: "object",
          properties: {
            error: { type: "string", example: "Error message" }
          }
        }
      }
    },
    tags: [
      { name: "Auth", description: "Authentication endpoints" },
      { name: "Products", description: "Product management endpoints" },
      { name: "Orders", description: "Order management endpoints" },
    ]
  },
  apis: ["./backend/routes/*.js"]
};

const specs = swaggerJSDoc(options);

export { specs, swaggerUi };