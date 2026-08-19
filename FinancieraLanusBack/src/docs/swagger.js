const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'FinancieraLanus API',
    version: '0.1.0',
    description: 'API documentation for FinancieraLanus backend',
  },
  servers: [
    { url: '/api', description: 'API base path' }
  ],
  paths: {
    '/collectors': {
      get: {
        tags: ['Collectors'],
        summary: 'List collectors (paginated)',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
          { name: 'ownerId', in: 'query', schema: { type: 'string', format: 'uuid' } }
        ],
        responses: { '200': { description: 'OK' } }
      },
      post: {
        tags: ['Collectors'],
        summary: 'Create collector',
        requestBody: { content: { 'application/json': { schema: { type: 'object' } } } },
        responses: { '201': { description: 'Created' } }
      }
    },
    '/collectors/{id}': {
      get: { tags: ['Collectors'], summary: 'Get collector by id', parameters: [{ name: 'id', in: 'path', required: true }] , responses: { '200': { description: 'OK' } } },
      put: { tags: ['Collectors'], summary: 'Update collector', parameters: [{ name: 'id', in: 'path', required: true }], responses: { '200': { description: 'OK' } } },
      delete: { tags: ['Collectors'], summary: 'Soft delete collector', parameters: [{ name: 'id', in: 'path', required: true }], responses: { '200': { description: 'OK' } } }
    }
    ,
    '/clients': {
      get: {
        tags: ['Clients'],
        summary: 'List clients (paginated)',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
          { name: 'ownerId', in: 'query', schema: { type: 'string', format: 'uuid' } },
          { name: 'cobradorId', in: 'query', schema: { type: 'string', format: 'uuid' } }
        ],
        responses: { '200': { description: 'OK' } }
      },
      post: {
        tags: ['Clients'],
        summary: 'Create client',
        requestBody: { content: { 'application/json': { schema: { type: 'object' } } } },
        responses: { '201': { description: 'Created' } }
      }
    },
    '/clients/{id}': {
      get: { tags: ['Clients'], summary: 'Get client by id', parameters: [{ name: 'id', in: 'path', required: true }] , responses: { '200': { description: 'OK' } } },
      put: { tags: ['Clients'], summary: 'Update client', parameters: [{ name: 'id', in: 'path', required: true }], responses: { '200': { description: 'OK' } } },
      delete: { tags: ['Clients'], summary: 'Soft delete client', parameters: [{ name: 'id', in: 'path', required: true }], responses: { '200': { description: 'OK' } } }
    }
  }
};

export default swaggerSpec;
