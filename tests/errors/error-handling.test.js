/**
 * Error Handling Tests
 * Tests exception handling, error responses, and recovery
 * 
 * @file tests/errors/error-handling.test.js
 */

const request = require('supertest');
const { server, start, stop, resetDataStore } = require('../../server');
const errorFixture = require('../fixtures/responses/error.json');

describe('Error Handling', () => {
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

  describe('Error Response Format', () => {
    it('should return consistent error response structure', async () => {
      const response = await request(server)
        .get('/nonexistent');
      
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('code');
      expect(response.body.error).toHaveProperty('message');
    });

    it('should match error fixture format', async () => {
      const response = await request(server)
        .post('/items')
        .send({});
      
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('code');
      expect(response.body.error).toHaveProperty('message');
      // Structure matches fixture format
      expect(Object.keys(response.body.error).sort()).toEqual(Object.keys(errorFixture.error).sort());
    });

    it('should return descriptive error messages', async () => {
      const response = await request(server)
        .get('/nonexistent');
      
      expect(response.body.error.message).toContain('/nonexistent');
    });

    it('should return appropriate error codes', async () => {
      const notFoundResponse = await request(server)
        .get('/nonexistent');
      expect(notFoundResponse.body.error.code).toBe('NOT_FOUND');
      
      const badRequestResponse = await request(server)
        .post('/items')
        .send({});
      expect(badRequestResponse.body.error.code).toBe('BAD_REQUEST');
    });
  });

  describe('Synchronous Error Handling', () => {
    it('should handle synchronous errors gracefully', async () => {
      const response = await request(server)
        .get('/error');
      
      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });

    it('should return 500 for simulated server errors', async () => {
      const response = await request(server)
        .get('/error');
      
      expect(response.status).toBe(500);
      expect(response.body.error.message).toBeDefined();
    });
  });

  describe('Async/Promise Error Handling', () => {
    it('should handle async errors gracefully', async () => {
      const response = await request(server)
        .get('/async-error');
      
      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });

    it('should not crash server on async error', async () => {
      // Trigger async error
      await request(server).get('/async-error');
      
      // Server should still respond to subsequent requests
      const response = await request(server)
        .get('/health');
      
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
    });
  });

  describe('Request Parsing Errors', () => {
    it('should handle malformed JSON gracefully', async () => {
      const response = await request(server)
        .post('/items')
        .set('Content-Type', 'application/json')
        .send('{ invalid }');
      
      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('BAD_REQUEST');
      expect(response.body.error.message).toContain('Invalid JSON');
    });

    it('should include error details in message', async () => {
      const response = await request(server)
        .post('/items')
        .set('Content-Type', 'application/json')
        .send('not json');
      
      expect(response.status).toBe(400);
      expect(response.body.error.message).toBeDefined();
    });
  });

  describe('Route Not Found Handling', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(server)
        .get('/unknown/route');
      
      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should include route in error message', async () => {
      const unknownRoute = '/very/specific/unknown/route';
      
      const response = await request(server)
        .get(unknownRoute);
      
      expect(response.body.error.message).toContain('/very/specific/unknown/route');
    });

    it('should handle nested unknown routes', async () => {
      const response = await request(server)
        .get('/a/b/c/d/e');
      
      expect(response.status).toBe(404);
    });
  });

  describe('Method Not Allowed Handling', () => {
    it('should return 405 for unsupported methods on valid routes', async () => {
      const response = await request(server)
        .post('/');  // Root only supports GET
      
      expect(response.status).toBe(405);
      expect(response.body.error.code).toBe('METHOD_NOT_ALLOWED');
    });

    it('should include Allow header with 405', async () => {
      const response = await request(server)
        .post('/');
      
      expect(response.headers['allow']).toBeDefined();
    });

    it('should list allowed methods in error message', async () => {
      const response = await request(server)
        .post('/');
      
      expect(response.body.error.message).toContain('POST');
      expect(response.body.error.message).toContain('not allowed');
    });
  });

  describe('Missing Required Fields', () => {
    it('should return 400 for missing name field', async () => {
      const response = await request(server)
        .post('/items')
        .send({ description: 'No name' });
      
      expect(response.status).toBe(400);
      expect(response.body.error.message).toContain('Name');
    });

    it('should return 400 for empty object body', async () => {
      const response = await request(server)
        .post('/items')
        .send({});
      
      expect(response.status).toBe(400);
    });
  });

  describe('Resource Not Found Errors', () => {
    it('should return 404 for non-existent item GET', async () => {
      const response = await request(server)
        .get('/items/999');
      
      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
      expect(response.body.error.message).toContain('999');
    });

    it('should return 404 for non-existent item PUT', async () => {
      const response = await request(server)
        .put('/items/999')
        .send({ name: 'Updated' });
      
      expect(response.status).toBe(404);
    });

    it('should return 404 for non-existent item PATCH', async () => {
      const response = await request(server)
        .patch('/items/999')
        .send({ name: 'Patched' });
      
      expect(response.status).toBe(404);
    });

    it('should return 404 for non-existent item DELETE', async () => {
      const response = await request(server)
        .delete('/items/999');
      
      expect(response.status).toBe(404);
    });
  });

  describe('Server Recovery After Errors', () => {
    it('should remain operational after 400 error', async () => {
      // Trigger 400 error
      await request(server)
        .post('/items')
        .send({});
      
      // Server should still work
      const response = await request(server)
        .post('/items')
        .send({ name: 'After Error' });
      
      expect(response.status).toBe(201);
    });

    it('should remain operational after 404 error', async () => {
      // Trigger 404 error
      await request(server)
        .get('/nonexistent');
      
      // Server should still work
      const response = await request(server)
        .get('/');
      
      expect(response.status).toBe(200);
    });

    it('should remain operational after 500 error', async () => {
      // Trigger 500 error
      await request(server)
        .get('/error');
      
      // Server should still work
      const response = await request(server)
        .get('/health');
      
      expect(response.status).toBe(200);
    });

    it('should handle multiple consecutive errors', async () => {
      // Trigger multiple errors
      await request(server).get('/error');
      await request(server).get('/async-error');
      await request(server).post('/items').send({});
      await request(server).get('/nonexistent');
      
      // Server should still work
      const response = await request(server)
        .post('/items')
        .send({ name: 'Still Working' });
      
      expect(response.status).toBe(201);
    });
  });

  describe('Error Response Headers', () => {
    it('should set Content-Type for error responses', async () => {
      const response = await request(server)
        .get('/error');
      
      expect(response.headers['content-type']).toMatch(/json/);
    });

    it('should set X-Powered-By for error responses', async () => {
      const response = await request(server)
        .get('/error');
      
      expect(response.headers['x-powered-by']).toBeDefined();
    });

    it('should echo X-Request-Id on error responses', async () => {
      const requestId = 'error-request-123';
      
      const response = await request(server)
        .get('/error')
        .set('X-Request-Id', requestId);
      
      expect(response.headers['x-request-id']).toBe(requestId);
    });
  });

  describe('Error Code Categories', () => {
    it('should use NOT_FOUND for 404 errors', async () => {
      const response = await request(server)
        .get('/unknown');
      
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should use BAD_REQUEST for 400 errors', async () => {
      const response = await request(server)
        .post('/items')
        .send({});
      
      expect(response.body.error.code).toBe('BAD_REQUEST');
    });

    it('should use METHOD_NOT_ALLOWED for 405 errors', async () => {
      const response = await request(server)
        .post('/');
      
      expect(response.body.error.code).toBe('METHOD_NOT_ALLOWED');
    });

    it('should use INTERNAL_ERROR for 500 errors', async () => {
      const response = await request(server)
        .get('/error');
      
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });
});
