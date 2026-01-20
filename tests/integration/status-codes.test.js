/**
 * Status Codes Integration Tests
 * Tests HTTP status codes for success, client errors, and server errors
 * 
 * @file tests/integration/status-codes.test.js
 */

const request = require('supertest');
const { server, start, stop, resetDataStore } = require('../../server');

describe('Status Codes', () => {
  let serverAddress;

  beforeAll(async () => {
    serverAddress = await start(0, '127.0.0.1');
  });

  afterAll(async () => {
    await stop();
  });

  beforeEach(() => {
    resetDataStore();
  });

  describe('Success Responses (2xx)', () => {
    it('should return 200 OK for GET /', async () => {
      await request(server)
        .get('/')
        .expect(200);
    });

    it('should return 200 OK for GET /health', async () => {
      await request(server)
        .get('/health')
        .expect(200);
    });

    it('should return 200 OK for GET /items', async () => {
      await request(server)
        .get('/items')
        .expect(200);
    });

    it('should return 200 OK for GET /text', async () => {
      await request(server)
        .get('/text')
        .expect(200);
    });

    it('should return 200 OK for GET /items/:id with valid item', async () => {
      // Create item first
      const createResponse = await request(server)
        .post('/items')
        .send({ name: 'Test Item' });
      
      const itemId = createResponse.body.item.id;
      
      await request(server)
        .get(`/items/${itemId}`)
        .expect(200);
    });

    it('should return 201 Created for POST /items', async () => {
      await request(server)
        .post('/items')
        .send({ name: 'New Item' })
        .expect(201);
    });

    it('should return 200 OK for PUT /items/:id', async () => {
      // Create item first
      const createResponse = await request(server)
        .post('/items')
        .send({ name: 'Original Item' });
      
      const itemId = createResponse.body.item.id;
      
      await request(server)
        .put(`/items/${itemId}`)
        .send({ name: 'Updated Item' })
        .expect(200);
    });

    it('should return 200 OK for PATCH /items/:id', async () => {
      // Create item first
      const createResponse = await request(server)
        .post('/items')
        .send({ name: 'Original Item' });
      
      const itemId = createResponse.body.item.id;
      
      await request(server)
        .patch(`/items/${itemId}`)
        .send({ name: 'Patched Item' })
        .expect(200);
    });

    it('should return 204 No Content for DELETE /items/:id', async () => {
      // Create item first
      const createResponse = await request(server)
        .post('/items')
        .send({ name: 'To Delete' });
      
      const itemId = createResponse.body.item.id;
      
      await request(server)
        .delete(`/items/${itemId}`)
        .expect(204);
    });

    it('should return 204 No Content for OPTIONS /items', async () => {
      await request(server)
        .options('/items')
        .expect(204);
    });
  });

  describe('Client Error Responses (4xx)', () => {
    it('should return 400 Bad Request for POST with empty body', async () => {
      await request(server)
        .post('/items')
        .send({})
        .expect(400);
    });

    it('should return 400 Bad Request for POST without name', async () => {
      await request(server)
        .post('/items')
        .send({ description: 'No name provided' })
        .expect(400);
    });

    it('should return 400 Bad Request for PUT with empty body', async () => {
      // Create item first
      const createResponse = await request(server)
        .post('/items')
        .send({ name: 'Test Item' });
      
      const itemId = createResponse.body.item.id;
      
      await request(server)
        .put(`/items/${itemId}`)
        .send({})
        .expect(400);
    });

    it('should return 400 Bad Request for PATCH with empty body', async () => {
      // Create item first
      const createResponse = await request(server)
        .post('/items')
        .send({ name: 'Test Item' });
      
      const itemId = createResponse.body.item.id;
      
      await request(server)
        .patch(`/items/${itemId}`)
        .send({})
        .expect(400);
    });

    it('should return 404 Not Found for unknown route', async () => {
      await request(server)
        .get('/nonexistent')
        .expect(404);
    });

    it('should return 404 Not Found for GET /items/:id with invalid id', async () => {
      await request(server)
        .get('/items/9999')
        .expect(404);
    });

    it('should return 404 Not Found for PUT /items/:id with invalid id', async () => {
      await request(server)
        .put('/items/9999')
        .send({ name: 'Updated' })
        .expect(404);
    });

    it('should return 404 Not Found for PATCH /items/:id with invalid id', async () => {
      await request(server)
        .patch('/items/9999')
        .send({ name: 'Patched' })
        .expect(404);
    });

    it('should return 404 Not Found for DELETE /items/:id with invalid id', async () => {
      await request(server)
        .delete('/items/9999')
        .expect(404);
    });

    it('should return 405 Method Not Allowed for unsupported methods', async () => {
      await request(server)
        .post('/')  // POST to root is not allowed
        .expect(405);
    });

    it('should return 405 Method Not Allowed for PUT to /items', async () => {
      await request(server)
        .put('/items')
        .send({ name: 'test' })
        .expect(405);
    });
  });

  describe('Server Error Responses (5xx)', () => {
    it('should return 500 Internal Server Error for /error endpoint', async () => {
      await request(server)
        .get('/error')
        .expect(500);
    });

    it('should return 500 Internal Server Error for async error', async () => {
      await request(server)
        .get('/async-error')
        .expect(500);
    });
  });

  describe('Status Code with Error Messages', () => {
    it('should return NOT_FOUND code with 404', async () => {
      const response = await request(server)
        .get('/nonexistent')
        .expect(404);
      
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return BAD_REQUEST code with 400', async () => {
      const response = await request(server)
        .post('/items')
        .send({})
        .expect(400);
      
      expect(response.body.error.code).toBe('BAD_REQUEST');
    });

    it('should return INTERNAL_ERROR code with 500', async () => {
      const response = await request(server)
        .get('/error')
        .expect(500);
      
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });

    it('should return METHOD_NOT_ALLOWED code with 405', async () => {
      const response = await request(server)
        .post('/')
        .expect(405);
      
      expect(response.body.error.code).toBe('METHOD_NOT_ALLOWED');
    });
  });

  describe('Status Code Consistency', () => {
    it('should return same status code for same error type', async () => {
      const response1 = await request(server).get('/items/9999');
      const response2 = await request(server).delete('/items/9999');
      
      expect(response1.status).toBe(404);
      expect(response2.status).toBe(404);
    });

    it('should return different status codes for different operations', async () => {
      // Create returns 201
      const createResponse = await request(server)
        .post('/items')
        .send({ name: 'Test' });
      expect(createResponse.status).toBe(201);
      
      const itemId = createResponse.body.item.id;
      
      // Get returns 200
      const getResponse = await request(server)
        .get(`/items/${itemId}`);
      expect(getResponse.status).toBe(200);
      
      // Delete returns 204
      const deleteResponse = await request(server)
        .delete(`/items/${itemId}`);
      expect(deleteResponse.status).toBe(204);
    });
  });
});
