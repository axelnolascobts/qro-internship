// Purpose: Configures Swagger API documentation for the e-commerce endpoints
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'E-Commerce API Documentation',
            version: '1.0.0',
            description: 'Full Stack E-Commerce API with authentication, products, orders, and real-time chat',
            contact: {
                name: 'API Support',
                email: 'support@ecommerce.com'
            }
        },
        servers: [
            {
                url: 'http://localhost:5050',
                description: 'Development server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            description: 'User ID'
                        },
                        name: {
                            type: 'string',
                            description: 'User first name'
                        },
                        lastname: {
                            type: 'string',
                            description: 'User last name'
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'User email'
                        },
                        birthdate: {
                            type: 'string',
                            format: 'date',
                            description: 'User birthdate'
                        },
                        address: {
                            type: 'string',
                            description: 'User address'
                        },
                        role: {
                            type: 'string',
                            enum: ['customer', 'seller', 'admin'],
                            description: 'User role'
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'User creation date'
                        }
                    }
                },
                Product: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            description: 'Product ID'
                        },
                        name: {
                            type: 'string',
                            description: 'Product name'
                        },
                        description: {
                            type: 'string',
                            description: 'Product description'
                        },
                        price: {
                            type: 'number',
                            format: 'float',
                            description: 'Product price'
                        },
                        category: {
                            type: 'string',
                            description: 'Product category'
                        },
                        stock: {
                            type: 'integer',
                            description: 'Available stock'
                        },
                        image: {
                            type: 'string',
                            format: 'uri',
                            description: 'Product image URL'
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Product creation date'
                        }
                    }
                },
                Order: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            description: 'Order ID'
                        },
                        userId: {
                            type: 'string',
                            description: 'User ID'
                        },
                        items: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    productId: {
                                        type: 'string'
                                    },
                                    name: {
                                        type: 'string'
                                    },
                                    price: {
                                        type: 'number'
                                    },
                                    quantity: {
                                        type: 'integer'
                                    },
                                    subtotal: {
                                        type: 'number'
                                    }
                                }
                            }
                        },
                        total: {
                            type: 'number',
                            format: 'float',
                            description: 'Order total'
                        },
                        shippingAddress: {
                            type: 'string',
                            description: 'Shipping address'
                        },
                        status: {
                            type: 'string',
                            enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
                            description: 'Order status'
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Order creation date'
                        }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: false
                        },
                        message: {
                            type: 'string',
                            description: 'Error message'
                        },
                        error: {
                            type: 'string',
                            description: 'Detailed error'
                        }
                    }
                }
            }
        }
    },
    apis: ['./backend/routes/*.js']
};

const specs = swaggerJsdoc(options);

module.exports = { specs, swaggerUi };
