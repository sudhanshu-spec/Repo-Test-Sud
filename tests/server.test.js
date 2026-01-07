/**
 * Jest Test Suite for Express.js Server Endpoints
 * 
 * This test file provides comprehensive testing for the Express.js server
 * endpoints defined in server.js:
 * - GET / : Should return "Hello world" with status 200
 * - GET /evening : Should return "Good evening" with status 200
 * 
 * Test categories include:
 * - Response body verification
 * - HTTP status code assertions
 * - Content-Type header validation
 * - 404 error handling
 * - Edge cases (query parameters, trailing slashes)
 * 
 * Uses supertest for HTTP assertions without starting a live server.
 */

'use strict';

// Import supertest for HTTP assertions
const request = require('supertest');

// Import the Express app from server.js
const app = require('../server');

describe('Express Server Endpoints', () => {
  /**
   * Test suite for the root endpoint (/)
   * Verifies the endpoint returns correct status and response text
   */
  describe('GET /', () => {
    test('GET / returns Hello world', async () => {
      const response = await request(app).get('/');
      expect(response.status).toBe(200);
      expect(response.text).toBe('Hello world');
    });

    test('should return 200 status code for GET /', async () => {
      // Explicit status code verification using Supertest assertion pattern
      await request(app)
        .get('/')
        .expect(200);
    });

    test('should return correct Content-Type header for GET /', async () => {
      // Verify Content-Type is text/html with charset using Supertest pattern
      await request(app)
        .get('/')
        .expect('Content-Type', /text\/html/);
    });
  });

  /**
   * Test suite for the evening endpoint (/evening)
   * Verifies the endpoint returns correct status and response text
   */
  describe('GET /evening', () => {
    test('GET /evening returns Good evening', async () => {
      const response = await request(app).get('/evening');
      expect(response.status).toBe(200);
      expect(response.text).toBe('Good evening');
    });

    test('should return 200 status code for GET /evening', async () => {
      // Explicit status code verification using Supertest assertion pattern
      await request(app)
        .get('/evening')
        .expect(200);
    });

    test('should return correct Content-Type header for GET /evening', async () => {
      // Verify Content-Type is text/html with charset using Supertest pattern
      await request(app)
        .get('/evening')
        .expect('Content-Type', /text\/html/);
    });
  });

  /**
   * Test suite for 404 error handling
   * Verifies that unregistered routes return 404 status codes
   */
  describe('404 Error Handling', () => {
    test('should return 404 for unknown routes', async () => {
      // Test that a nonexistent route returns 404 status
      await request(app)
        .get('/nonexistent')
        .expect(404);
    });

    test('should return 404 for GET /unknown', async () => {
      // Test specific /unknown path returns 404
      await request(app)
        .get('/unknown')
        .expect(404);
    });

    test('should return 404 for GET /api (unregistered route)', async () => {
      // Test another unregistered route for comprehensive coverage
      await request(app)
        .get('/api')
        .expect(404);
    });

    test('should return 404 for nested unregistered routes', async () => {
      // Test deeply nested unregistered path
      await request(app)
        .get('/evening/extra/path')
        .expect(404);
    });
  });

  /**
   * Test suite for edge cases
   * Verifies proper handling of query parameters, trailing slashes, and path variations
   */
  describe('Edge Cases', () => {
    test('should handle query parameters on GET /', async () => {
      // Test that query parameters do not affect the response
      const response = await request(app).get('/?foo=bar');
      expect(response.status).toBe(200);
      expect(response.text).toBe('Hello world');
    });

    test('should handle multiple query parameters on GET /', async () => {
      // Test multiple query parameters
      const response = await request(app).get('/?foo=bar&baz=qux');
      expect(response.status).toBe(200);
      expect(response.text).toBe('Hello world');
    });

    test('should handle query parameters on GET /evening', async () => {
      // Test query parameters on /evening endpoint
      const response = await request(app).get('/evening?time=now');
      expect(response.status).toBe(200);
      expect(response.text).toBe('Good evening');
    });

    test('should handle trailing slash on routes', async () => {
      // Test /evening/ with trailing slash behavior
      // Express handles trailing slashes by default and routes /evening/ to /evening handler
      // This test documents the expected behavior
      const response = await request(app).get('/evening/');
      // Express matches /evening/ to /evening route and returns the same response
      expect(response.status).toBe(200);
      expect(response.text).toBe('Good evening');
    });

    test('should handle empty query string on GET /', async () => {
      // Test empty query string
      const response = await request(app).get('/?');
      expect(response.status).toBe(200);
      expect(response.text).toBe('Hello world');
    });

    test('should handle special characters in query parameters', async () => {
      // Test special characters in query parameters are properly handled
      const response = await request(app).get('/?key=value%20with%20spaces');
      expect(response.status).toBe(200);
      expect(response.text).toBe('Hello world');
    });
  });

  /**
   * Test suite for combined assertions
   * Verifies complete HTTP response including status, headers, and body in single tests
   */
  describe('Combined Response Validation', () => {
    test('should return complete valid response for GET /', async () => {
      // Comprehensive test using chained Supertest assertions
      await request(app)
        .get('/')
        .expect(200)
        .expect('Content-Type', /text\/html/)
        .expect('Hello world');
    });

    test('should return complete valid response for GET /evening', async () => {
      // Comprehensive test using chained Supertest assertions
      await request(app)
        .get('/evening')
        .expect(200)
        .expect('Content-Type', /text\/html/)
        .expect('Good evening');
    });
  });
});
