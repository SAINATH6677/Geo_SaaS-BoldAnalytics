const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Geo SaaS API',
      version: '1.0.0',
      description: 'Village Location Intelligence API'
    },
    servers: [
      {
        url: 'https://geo-saas-api.onrender.com',
        description: 'Production server'
      },
      {
        url: 'http://localhost:5000/v1',
        description: 'Local development server'
      }
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key'
        }
      }
    },
    security: [
      {
        ApiKeyAuth: []
      }
    ]
  },

  apis: ['./routes/*.js']
};

module.exports = swaggerJsdoc(options);