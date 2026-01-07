/**
 * Jest Test Suite for Express.js Server Endpoints
 * 
 * This test file verifies the correct behavior of the Express.js server
 * endpoints defined in server.js:
 * - GET / : Should return "Hello world" with status 200
 * - GET /evening : Should return "Good evening" with status 200
 * - GET /health : Should return JSON with healthy status
 * - 404 handler : Should return proper JSON error for undefined routes
 * - Error handling : Should handle various edge cases properly
 * 
 * Uses supertest for HTTP assertions without starting a live server.
 * 
 * Test Coverage:
 * - 27 total tests organized in 8 describe blocks
 * - Original endpoints, health check, 404 handler, HTTP methods, edge cases, headers
 */

'use strict';

// Import supertest for HTTP assertions
const request = require('supertest');

// Import the Express app from server.js
const app = require('../server');

describe('Express Server Endpoints', () => {
  /**
   * Test suite for the root endpoint (/)
   * Verifies the endpoint returns correct status, response text, and content type
   */
  describe('GET /', () => {
    test('GET / returns Hello world', async () => {
      const response = await request(app).get('/');
      expect(response.status).toBe(200);
      expect(response.text).toBe('Hello world');
    });

    test('GET / has correct content type', async () => {
      const response = await request(app).get('/');
      expect(response.headers['content-type']).toContain('text/html');
    });
  });

  /**
   * Test suite for the evening endpoint (/evening)
   * Verifies the endpoint returns correct status, response text, and content type
   */
  describe('GET /evening', () => {
    test('GET /evening returns Good evening', async () => {
      const response = await request(app).get('/evening');
      expect(response.status).toBe(200);
      expect(response.text).toBe('Good evening');
    });

    test('GET /evening has correct content type', async () => {
      const response = await request(app).get('/evening');
      expect(response.headers['content-type']).toContain('text/html');
    });
  });

  /**
   * Test suite for the health check endpoint (/health)
   * Verifies the endpoint returns proper JSON health status for container orchestration
   */
  describe('GET /health', () => {
    test('GET /health returns 200 status', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
    });

    test('GET /health returns JSON with healthy status', async () => {
      const response = await request(app).get('/health');
      expect(response.body.status).toBe('healthy');
    });

    test('GET /health timestamp is a valid ISO date string', async () => {
      const response = await request(app).get('/health');
      const timestamp = response.body.timestamp;
      // Verify timestamp exists and is a valid ISO date string
      expect(timestamp).toBeDefined();
      const parsedDate = new Date(timestamp);
      expect(parsedDate.toISOString()).toBe(timestamp);
    });
  });

  /**
   * Test suite for 404 Not Found handler
   * Verifies undefined routes return proper 404 JSON error responses
   */
  describe('404 Not Found Handler', () => {
    test('Returns 404 for undefined route', async () => {
      const response = await request(app).get('/nonexistent');
      expect(response.status).toBe(404);
    });

    test('Returns JSON error response for undefined route', async () => {
      const response = await request(app).get('/nonexistent');
      expect(response.body.error).toBe('Not Found');
      expect(response.body.message).toBeDefined();
    });

    test('Returns 404 with request method and path in message', async () => {
      const response = await request(app).get('/nonexistent');
      expect(response.body.message).toContain('Cannot GET /nonexistent');
    });

    test('Returns 404 for POST to undefined route', async () => {
      const response = await request(app).post('/nonexistent');
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Not Found');
    });

    test('Returns 404 for PUT to undefined route', async () => {
      const response = await request(app).put('/nonexistent');
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Not Found');
    });

    test('Returns 404 for DELETE to undefined route', async () => {
      const response = await request(app).delete('/nonexistent');
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Not Found');
    });

    test('Returns 404 for deeply nested undefined routes', async () => {
      const response = await request(app).get('/a/b/c/d/e');
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Not Found');
    });
  });

  /**
   * Test suite for HTTP method validation
   * Verifies that non-GET methods to GET-only routes return 404
   */
  describe('HTTP Method Validation', () => {
    test('POST to GET-only route / returns 404', async () => {
      const response = await request(app).post('/');
      expect(response.status).toBe(404);
    });

    test('PUT to GET-only route /evening returns 404', async () => {
      const response = await request(app).put('/evening');
      expect(response.status).toBe(404);
    });

    test('DELETE to GET-only route / returns 404', async () => {
      const response = await request(app).delete('/');
      expect(response.status).toBe(404);
    });

    test('PATCH to GET-only route /evening returns 404', async () => {
      const response = await request(app).patch('/evening');
      expect(response.status).toBe(404);
    });
  });

  /**
   * Test suite for edge cases and boundary conditions
   * Verifies server handles unusual inputs correctly
   */
  describe('Edge Cases and Boundary Conditions', () => {
    test('GET / with query parameters still works', async () => {
      const response = await request(app).get('/?foo=bar');
      expect(response.status).toBe(200);
      expect(response.text).toBe('Hello world');
    });

    test('GET /evening with query parameters still works', async () => {
      const response = await request(app).get('/evening?test=123');
      expect(response.status).toBe(200);
      expect(response.text).toBe('Good evening');
    });

    test('GET /health with query parameters still works', async () => {
      const response = await request(app).get('/health?check=true');
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('healthy');
    });

    test('Returns 404 for route with trailing slash that does not exist', async () => {
      const response = await request(app).get('/nonexistent/');
      expect(response.status).toBe(404);
    });

    test('Returns 404 for URL-encoded special characters in path', async () => {
      const response = await request(app).get('/%2F%2Ftest');
      expect(response.status).toBe(404);
    });

    test('Returns 404 for route with Unicode characters', async () => {
      const response = await request(app).get('/テスト');
      expect(response.status).toBe(404);
    });
  });

  /**
   * Test suite for response headers
   * Verifies proper headers are set for different response types
   */
  describe('Response Headers', () => {
    test('Successful responses include proper headers', async () => {
      const response = await request(app).get('/');
      expect(response.headers).toBeDefined();
      expect(response.headers['content-type']).toBeDefined();
    });

    test('404 responses include proper JSON content-type', async () => {
      const response = await request(app).get('/nonexistent');
      expect(response.headers['content-type']).toContain('application/json');
    });

    test('Health check includes proper JSON content-type', async () => {
      const response = await request(app).get('/health');
      expect(response.headers['content-type']).toContain('application/json');
    });
  });
});
