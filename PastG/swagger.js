const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API PastG',
      version: '1.0.0',
      description: 'Documentazione API per PastG',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Server di sviluppo',
      },
    ],
  },
  apis: ['./server.js'], // file contenenti le annotazioni
};

const specs = swaggerJsdoc(options);
module.exports = specs;