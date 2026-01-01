/**
 * Jest Test Suite for Express.js Server Endpoints
 * 
 * This test file provides comprehensive testing for the Express.js server
 * endpoints defined in server.js:
 * - GET / : Should return "Hello world" with status 200
 * - GET /evening : Should return "Good evening" with status 200
 * 
 * Test Coverage Includes:
 * - HTTP response body verification
 * - HTTP status code assertions
 * - Content-Type header validation
 * - 404 error handling for undefined routes
 * - Edge cases (query parameters, trailing slashes)
 * 
 * Uses supertest for HTTP assertions without starting a live server.
 */

'use strict';

// Import supertest for HTTP assertions
const request = require('supertest');

// Import the Express app from server.js
const app = require('../server');

/**
 * Main test suite for Express Server Endpoints
 * Tests all defined routes for correct responses, status codes, and headers
 */
describe('Express Server Endpoints', () => {
  /**
   * Test suite for the root endpoint (/)
   * Verifies the endpoint returns correct status, response text, and headers
   */
  describe('GET /', () => {
    test('GET / returns Hello world', async () => {
      const response = await request(app).get('/');
      expect(response.status).toBe(200);
      expect(response.text).toBe('Hello world');
    });

    test('should return 200 status code for GET /', async () => {
      const response = await request(app).get('/');
      expect(response.status).toBe(200);
    });

    test('should return correct Content-Type header for GET /', async () => {
      const response = await request(app).get('/');
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/text\/html/);
    });
  });

  /**
   * Test suite for the evening endpoint (/evening)
   * Verifies the endpoint returns correct status, response text, and headers
   */
  describe('GET /evening', () => {
    test('GET /evening returns Good evening', async () => {
      const response = await request(app).get('/evening');
      expect(response.status).toBe(200);
      expect(response.text).toBe('Good evening');
    });

    test('should return 200 status code for GET /evening', async () => {
      const response = await request(app).get('/evening');
      expect(response.status).toBe(200);
    });

    test('should return correct Content-Type header for GET /evening', async () => {
      const response = await request(app).get('/evening');
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/text\/html/);
    });
  });
});

/**
 * Test suite for Error Handling - 404 Responses
 * Verifies that undefined routes return appropriate 404 status codes
 */
describe('Error Handling - 404 Responses', () => {
  test('should return 404 for unknown routes', async () => {
    const response = await request(app).get('/unknown');
    expect(response.status).toBe(404);
  });

  test('should return 404 for GET /api', async () => {
    const response = await request(app).get('/api');
    expect(response.status).toBe(404);
  });

  test('should return 404 for GET /evening/extra', async () => {
    const response = await request(app).get('/evening/extra');
    expect(response.status).toBe(404);
  });

  test('should return 404 for GET /nonexistent/path', async () => {
    const response = await request(app).get('/nonexistent/path');
    expect(response.status).toBe(404);
  });

  test('should return 404 for GET /hello', async () => {
    // Test a route that might be confused with root but doesn't exist
    const response = await request(app).get('/hello');
    expect(response.status).toBe(404);
  });
});

/**
 * Test suite for Edge Cases
 * Verifies correct behavior for query parameters, trailing slashes, and other edge cases
 */
describe('Edge Cases', () => {
  test('should handle query parameters on GET /', async () => {
    const response = await request(app).get('/?param=value');
    expect(response.status).toBe(200);
    expect(response.text).toBe('Hello world');
  });

  test('should handle multiple query parameters on GET /', async () => {
    const response = await request(app).get('/?foo=bar&baz=qux');
    expect(response.status).toBe(200);
    expect(response.text).toBe('Hello world');
  });

  test('should handle query parameters on GET /evening', async () => {
    const response = await request(app).get('/evening?time=late');
    expect(response.status).toBe(200);
    expect(response.text).toBe('Good evening');
  });

  test('should handle trailing slash variations for root path', async () => {
    // Root path with explicit trailing slash
    const responseWithSlash = await request(app).get('/');
    expect(responseWithSlash.status).toBe(200);
    expect(responseWithSlash.text).toBe('Hello world');
  });

  test('should handle empty query string on GET /', async () => {
    const response = await request(app).get('/?');
    expect(response.status).toBe(200);
    expect(response.text).toBe('Hello world');
  });

  test('should handle special characters in query parameters', async () => {
    const response = await request(app).get('/?name=John%20Doe&value=%24100');
    expect(response.status).toBe(200);
    expect(response.text).toBe('Hello world');
  });

  test('should handle numeric query parameters', async () => {
    const response = await request(app).get('/evening?count=123&id=456');
    expect(response.status).toBe(200);
    expect(response.text).toBe('Good evening');
  });
});
