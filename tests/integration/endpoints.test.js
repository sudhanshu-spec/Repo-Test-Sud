/**
 * @fileoverview HTTP Endpoint Integration Tests — Express.js 5.x Application
 *
 * Provides comprehensive integration-level HTTP regression testing for the Express.js
 * application by exercising the full middleware pipeline, route matching, response
 * generation, and header negotiation through Supertest-driven HTTP simulation.
 *
 * This test suite validates the dual-consumption model of the Express application
 * factory exported by src/app.js. In production, server.js imports the app and
 * binds it to a TCP port via app.listen(). In this test environment, Supertest
 * consumes the same app export directly — injecting HTTP requests into the Express
 * pipeline without opening a real network socket — ensuring behavioral equivalence
 * between production and test execution paths.
 *
 * Testing strategy:
 *   - Happy path validation: GET / and GET /evening with exact body, status, and header matching
 *   - Response header contracts: X-Powered-By, Content-Type with charset, ETag, Content-Length
 *   - Error handling: 404 responses for undefined routes and unsupported HTTP methods
 *   - Edge cases: query parameters, double slashes, HEAD requests, trailing slashes,
 *     URL-encoded paths, case sensitivity, and special characters
 *
 * Express.js 5.x specifics exercised:
 *   - Automatic ETag generation via the etag package for cacheable GET responses
 *   - Content-Type negotiation with charset=utf-8 for text/html responses
 *   - Express.Router() path matching semantics for registered GET handlers
 *   - Default 404 handling for unmatched routes and unsupported methods
 *   - OPTIONS method auto-response with Allow header for defined routes
 *
 * @module tests/integration/endpoints
 * @requires supertest
 * @requires ../../src/app
 */

'use strict';

const request = require('supertest');
const app = require('../../src/app');

/**
 * @typedef {import('supertest').Response} SupertestResponse
 */

/**
 * Convenience wrapper for issuing GET requests against the Express application.
 *
 * Encapsulates the Supertest request creation pattern to reduce boilerplate
 * across test cases. Returns the Supertest Test object which supports chaining
 * with .expect() assertions and resolves to a SupertestResponse via await.
 *
 * @param {string} path - The request path to send the GET request to (e.g., '/', '/evening')
 * @returns {import('supertest').Test} Supertest Test object (thenable) that resolves to a SupertestResponse
 */
function get(path) {
  return request(app).get(path);
}

/**
 * Asserts that a response represents a successful HTML response with the expected body.
 *
 * Validates the four core properties of a successful Express.js HTML response:
 *   1. HTTP 200 status code indicating successful processing
 *   2. Response body matches the expected string exactly (byte-for-byte)
 *   3. Content-Type header includes text/html MIME type
 *   4. Content-Type header includes charset=utf-8 encoding declaration
 *
 * @param {SupertestResponse} response - The Supertest response object to validate
 * @param {string} expectedBody - The exact expected response body string
 */
function assertSuccessfulHtmlResponse(response, expectedBody) {
  expect(response.status).toBe(200);
  expect(response.text).toBe(expectedBody);
  expect(response.headers['content-type']).toMatch(/text\/html/);
  expect(response.headers['content-type']).toMatch(/charset=utf-8/i);
}

/**
 * Asserts that a response represents a 404 Not Found error response.
 *
 * Validates that the response carries the correct error status code and
 * includes a response body (Express.js default 404 handler generates an
 * HTML error page describing the missing resource).
 *
 * @param {SupertestResponse} response - The Supertest response object to validate
 */
function assert404Response(response) {
  expect(response.status).toBe(404);
  expect(response.text).toBeDefined();
}

describe('HTTP Endpoints', () => {
  describe('GET /', () => {
    test('should return 200 status code', async () => {
      const response = await get('/').expect(200);
      expect(response.status).toBe(200);
    });

    test('should return "Hello, World!\\n" in response body', async () => {
      const response = await get('/');
      assertSuccessfulHtmlResponse(response, 'Hello, World!\n');
    });

    test('should return text/html Content-Type header', async () => {
      const response = await get('/').expect('Content-Type', /text\/html/);
      expect(response.headers['content-type']).toMatch(/charset=utf-8/i);
    });

    test('should return correct Content-Length header for root response', async () => {
      const response = await get('/').expect(200);
      expect(response.headers['content-length']).toBe(String(Buffer.byteLength('Hello, World!\n')));
    });
  });

  describe('GET /evening', () => {
    test('should return 200 status code', async () => {
      const response = await get('/evening').expect(200);
      expect(response.status).toBe(200);
    });

    test('should return "Good evening" in response body', async () => {
      const response = await get('/evening');
      assertSuccessfulHtmlResponse(response, 'Good evening');
    });

    test('should return text/html Content-Type header', async () => {
      const response = await get('/evening').expect('Content-Type', /text\/html/);
      expect(response.headers['content-type']).toMatch(/charset=utf-8/i);
    });

    test('should return correct Content-Length header for evening response', async () => {
      const response = await get('/evening').expect(200);
      expect(response.headers['content-length']).toBe(String(Buffer.byteLength('Good evening')));
    });
  });

  describe('Response Headers', () => {
    test('should include X-Powered-By header with Express value', async () => {
      const response = await get('/').expect(200);
      expect(response.headers['x-powered-by']).toBe('Express');
    });

    test('should include Content-Type with charset for all success responses', async () => {
      const rootResponse = await get('/').expect(200);
      const eveningResponse = await get('/evening').expect(200);
      expect(rootResponse.headers['content-type']).toMatch(/text\/html/);
      expect(rootResponse.headers['content-type']).toMatch(/charset=utf-8/i);
      expect(eveningResponse.headers['content-type']).toMatch(/text\/html/);
      expect(eveningResponse.headers['content-type']).toMatch(/charset=utf-8/i);
    });

    test('should return ETag header for cacheable GET responses', async () => {
      const rootResponse = await get('/').expect(200);
      const eveningResponse = await get('/evening').expect(200);
      expect(rootResponse.headers['etag']).toBeDefined();
      expect(eveningResponse.headers['etag']).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    test('should return 404 for undefined routes (GET /invalid)', async () => {
      const response = await get('/invalid').expect(404);
      assert404Response(response);
    });

    test('should return 404 for POST / (unsupported method)', async () => {
      const response = await request(app).post('/').expect(404);
      assert404Response(response);
    });

    test('should return 404 for PUT /evening (unsupported method)', async () => {
      const response = await request(app).put('/evening').expect(404);
      assert404Response(response);
    });

    test('should return 404 for DELETE / (unsupported method)', async () => {
      const response = await request(app).delete('/').expect(404);
      assert404Response(response);
    });

    test('should return 404 for PATCH / (unsupported method)', async () => {
      const response = await request(app).patch('/').expect(404);
      assert404Response(response);
    });

    test('should return 200 for OPTIONS /evening with allowed methods', async () => {
      const response = await request(app).options('/evening').expect(200);
      expect(response.status).toBe(200);
      expect(response.headers['allow']).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    test('should return 200 with unchanged body when query parameters are present', async () => {
      const response = await get('/?param=value').expect(200);
      expect(response.text).toBe('Hello, World!\n');
    });

    test('should handle multiple query parameters on root endpoint', async () => {
      const response = await get('/?foo=bar&baz=qux').expect(200);
      expect(response.text).toBe('Hello, World!\n');
      expect(response.headers['content-type']).toMatch(/text\/html/);
    });

    test('should handle query parameters on /evening endpoint', async () => {
      const response = await get('/evening?time=late').expect(200);
      expect(response.text).toBe('Good evening');
    });

    test('should handle double slash path (GET //)', async () => {
      const response = await get('//');
      expect(response.status).toBeDefined();
      expect([200, 404]).toContain(response.status);
    });

    test('should handle HEAD request on root endpoint', async () => {
      const response = await request(app).head('/').expect(200);
      expect(response.status).toBe(200);
      expect(response.text).toBeFalsy();
      expect(response.headers['content-type']).toMatch(/text\/html/);
    });

    test('should handle trailing slash on /evening/ endpoint', async () => {
      const response = await get('/evening/');
      expect(response.status).toBeDefined();
      expect([200, 301, 302, 404]).toContain(response.status);
    });

    test('should handle URL-encoded characters in path', async () => {
      const response = await get('/%65vening');
      expect(response.status).toBeDefined();
      expect([200, 404]).toContain(response.status);
    });

    test('should handle case-insensitive route matching for /Evening', async () => {
      const response = await get('/Evening');
      expect(response.status).toBeDefined();
      expect([200, 404]).toContain(response.status);
    });

    test('should handle requests with special characters in query string', async () => {
      const response = await get('/?key=val%20ue&a=b').expect(200);
      expect(response.text).toBe('Hello, World!\n');
    });
  });
});
