/**
 * Jest Test Suite for HTTP Method Constraints
 * 
 * This test file verifies HTTP method constraints for Express server routes.
 * Tests that non-GET HTTP methods (POST, PUT, DELETE, PATCH) to GET-only routes
 * (/ and /evening) return appropriate 404 responses.
 * 
 * The Express application only defines GET handlers for / and /evening routes.
 * Any other HTTP method to these routes should return 404 (Not Found) as per
 * Express default behavior for unmatched method/route combinations.
 */

'use strict';

// Import supertest for HTTP assertions
const request = require('supertest');

// Import the Express app from server.js
const app = require('../server');

/**
 * Main test suite for HTTP Method Constraints
 * Tests that GET-only routes properly reject other HTTP methods
 */
describe('HTTP Method Constraints', () => {
  /**
   * Test suite for POST requests to GET-only routes
   * POST method should return 404 for routes that only accept GET
   */
  describe('POST requests to GET-only routes', () => {
    test('POST / should return 404', async () => {
      const response = await request(app).post('/');
      expect(response.status).toBe(404);
    });

    test('POST /evening should return 404', async () => {
      const response = await request(app).post('/evening');
      expect(response.status).toBe(404);
    });

    test('POST / should have response body', async () => {
      const response = await request(app).post('/');
      expect(response.status).toBe(404);
      // Express returns HTML error page by default for 404
      expect(response.text).toBeTruthy();
    });

    test('POST /evening should have response body', async () => {
      const response = await request(app).post('/evening');
      expect(response.status).toBe(404);
      expect(response.text).toBeTruthy();
    });
  });

  /**
   * Test suite for PUT requests to GET-only routes
   * PUT method should return 404 for routes that only accept GET
   */
  describe('PUT requests to GET-only routes', () => {
    test('PUT / should return 404', async () => {
      const response = await request(app).put('/');
      expect(response.status).toBe(404);
    });

    test('PUT /evening should return 404', async () => {
      const response = await request(app).put('/evening');
      expect(response.status).toBe(404);
    });

    test('PUT / with body should return 404', async () => {
      const response = await request(app)
        .put('/')
        .send({ data: 'test' });
      expect(response.status).toBe(404);
    });

    test('PUT /evening with body should return 404', async () => {
      const response = await request(app)
        .put('/evening')
        .send({ data: 'test' });
      expect(response.status).toBe(404);
    });
  });

  /**
   * Test suite for DELETE requests to GET-only routes
   * DELETE method should return 404 for routes that only accept GET
   */
  describe('DELETE requests to GET-only routes', () => {
    test('DELETE / should return 404', async () => {
      const response = await request(app).delete('/');
      expect(response.status).toBe(404);
    });

    test('DELETE /evening should return 404', async () => {
      const response = await request(app).delete('/evening');
      expect(response.status).toBe(404);
    });
  });

  /**
   * Test suite for PATCH requests to GET-only routes
   * PATCH method should return 404 for routes that only accept GET
   */
  describe('PATCH requests to GET-only routes', () => {
    test('PATCH / should return 404', async () => {
      const response = await request(app).patch('/');
      expect(response.status).toBe(404);
    });

    test('PATCH /evening should return 404', async () => {
      const response = await request(app).patch('/evening');
      expect(response.status).toBe(404);
    });
  });

  /**
   * Test suite for HEAD requests
   * HEAD requests should return 200 for GET routes (Express default behavior)
   * as HEAD is implicitly handled by GET handlers
   */
  describe('HEAD requests to GET routes', () => {
    test('HEAD / should return 200', async () => {
      const response = await request(app).head('/');
      expect(response.status).toBe(200);
    });

    test('HEAD /evening should return 200', async () => {
      const response = await request(app).head('/evening');
      expect(response.status).toBe(200);
    });

    test('HEAD / should return empty body', async () => {
      const response = await request(app).head('/');
      expect(response.status).toBe(200);
      // HEAD requests should not return body content
      expect(response.text).toBeFalsy();
    });

    test('HEAD /evening should return empty body', async () => {
      const response = await request(app).head('/evening');
      expect(response.status).toBe(200);
      expect(response.text).toBeFalsy();
    });
  });

  /**
   * Test suite for OPTIONS requests
   * OPTIONS requests behavior verification
   */
  describe('OPTIONS requests', () => {
    test('OPTIONS / should return response', async () => {
      const response = await request(app).options('/');
      // Express may return 200 or 204 for OPTIONS depending on configuration
      expect([200, 204]).toContain(response.status);
    });

    test('OPTIONS /evening should return response', async () => {
      const response = await request(app).options('/evening');
      expect([200, 204]).toContain(response.status);
    });
  });

  /**
   * Test suite for verifying GET still works correctly
   * Sanity check that GET requests continue to function properly
   */
  describe('GET requests verification (sanity check)', () => {
    test('GET / should still return 200', async () => {
      const response = await request(app).get('/');
      expect(response.status).toBe(200);
      expect(response.text).toBe('Hello world');
    });

    test('GET /evening should still return 200', async () => {
      const response = await request(app).get('/evening');
      expect(response.status).toBe(200);
      expect(response.text).toBe('Good evening');
    });
  });
});

/**
 * Test suite for HTTP methods on undefined routes
 * All HTTP methods to undefined routes should return 404
 */
describe('HTTP Methods on Undefined Routes', () => {
  const undefinedRoutes = ['/undefined', '/api', '/test', '/nonexistent'];
  const httpMethods = ['get', 'post', 'put', 'delete', 'patch'];

  test.each(undefinedRoutes)('GET %s should return 404', async (route) => {
    const response = await request(app).get(route);
    expect(response.status).toBe(404);
  });

  test.each(undefinedRoutes)('POST %s should return 404', async (route) => {
    const response = await request(app).post(route);
    expect(response.status).toBe(404);
  });

  test.each(undefinedRoutes)('PUT %s should return 404', async (route) => {
    const response = await request(app).put(route);
    expect(response.status).toBe(404);
  });

  test.each(undefinedRoutes)('DELETE %s should return 404', async (route) => {
    const response = await request(app).delete(route);
    expect(response.status).toBe(404);
  });
});
