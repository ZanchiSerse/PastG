const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API PastG',
      version: '1.0.0',
      description: 'API documentation for PastG order management system',
      contact: {
        name: 'PastG Support',
        email: 'support@pastg.example'
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication endpoints'
      },
      {
        name: 'Orders',
        description: 'Order management endpoints'
      },
      {
        name: 'API',
        description: 'API endpoints for AJAX operations'
      }
    ],
    components: {
      securitySchemes: {
        sessionAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'connect.sid'
        }
      }
    }
  },
  apis: ['./server.js'], // files containing annotations
};

const specs = swaggerJsdoc(options);
module.exports = specs;