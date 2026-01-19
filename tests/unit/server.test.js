/**
 * @fileoverview Comprehensive unit test suite for HTTP server endpoint handlers.
 * Tests the /hello and /evening endpoints for correct responses, status codes,
 * headers, error handling, and HTTP method validation using Jest and Supertest.
 * 
 * Test Coverage Areas:
 * - GET /hello endpoint (happy path, response validation, headers)
 * - GET /evening endpoint (happy path, response validation, headers)
 * - 404 error handling for undefined routes
 * - HTTP method validation (POST/PUT/DELETE to defined routes)
 * 
 * @module tests/unit/server.test
 * @requires supertest
 * @requires tests/fixtures/constants
 * @requires tests/helpers/test-utils
 */

'use strict';

const request = require('supertest');
const {
  ENDPOINTS,
  EXPECTED_RESPONSES,
  STATUS_CODES,
  CONTENT_TYPES,
  INVALID_ROUTES
} = require('../fixtures/constants');
const { createTestApp, getExpectedResponse } = require('../helpers/test-utils');

/**
 * Express application instance for testing.
 * Uses createTestApp() to create a configured Express app without starting a server,
 * enabling Supertest to test endpoints without port binding issues.
 */
let app;

/**
 * Test suite setup - creates the test application before all tests run.
 * This approach ensures test isolation and prevents EADDRINUSE port conflicts.
 */
beforeAll(() => {
  app = createTestApp();
});

/**
 * Test suite teardown - cleanup after all tests complete.
 * Ensures any resources are properly released.
 */
afterAll(() => {
  app = null;
});

/**
 * Test suite for GET /hello endpoint.
 * Validates correct response body, status code, headers, and edge cases.
 * Section 0.4.2 F-002 requirements: Returns "Hello world" with 200 status.
 */
describe('GET /hello', () => {
  /**
   * Happy path test: Verifies the /hello endpoint returns the expected response
   * body with HTTP 200 status code.
   */
  it('should return "Hello world" with 200 status', async () => {
    const response = await request(app)
      .get(ENDPOINTS.HELLO)
      .expect(STATUS_CODES.OK);

    expect(response.text).toBe(EXPECTED_RESPONSES.HELLO);
  });

  /**
   * Header validation test: Verifies the Content-Type header is correctly set
   * to text/html or text/plain for the /hello endpoint response.
   */
  it('should have correct Content-Type header (text/html or text/plain)', async () => {
    const response = await request(app)
      .get(ENDPOINTS.HELLO)
      .expect(STATUS_CODES.OK);

    const contentType = response.headers['content-type'];
    expect(contentType).toBeDefined();
    // Accept either text/html or text/plain content types
    expect(
      contentType.includes(CONTENT_TYPES.TEXT) || 
      contentType.includes(CONTENT_TYPES.PLAIN)
    ).toBe(true);
  });

  /**
   * Response body validation test: Verifies the response body exactly matches
   * the expected "Hello world" string without extra whitespace or modifications.
   */
  it('should return exact response body matching expected string', async () => {
    const response = await request(app)
      .get(ENDPOINTS.HELLO)
      .expect(STATUS_CODES.OK);

    // Strict equality check - no trimming or normalization
    expect(response.text).toStrictEqual(EXPECTED_RESPONSES.HELLO);
    // Verify using helper function for consistency
    expect(response.text).toBe(getExpectedResponse(ENDPOINTS.HELLO));
  });

  /**
   * Edge case test: Verifies the endpoint correctly handles requests with
   * query parameters, returning the same expected response.
   */
  it('should handle requests with query parameters', async () => {
    const response = await request(app)
      .get(`${ENDPOINTS.HELLO}?name=test&value=123`)
      .expect(STATUS_CODES.OK);

    expect(response.text).toBe(EXPECTED_RESPONSES.HELLO);
  });

  /**
   * Header presence test: Verifies essential response headers are present
   * and contain valid values.
   */
  it('should include Content-Length header in response', async () => {
    const response = await request(app)
      .get(ENDPOINTS.HELLO)
      .expect(STATUS_CODES.OK);

    // Content-Length should be present and match response body length
    const contentLength = response.headers['content-length'];
    expect(contentLength).toBeDefined();
    expect(parseInt(contentLength, 10)).toBe(EXPECTED_RESPONSES.HELLO.length);
  });

  /**
   * Response format test: Verifies the response is properly encoded and
   * can be read as a string.
   */
  it('should return response as plain text string', async () => {
    const response = await request(app)
      .get(ENDPOINTS.HELLO)
      .expect(STATUS_CODES.OK);

    expect(typeof response.text).toBe('string');
    expect(response.text.length).toBeGreaterThan(0);
  });
});

/**
 * Test suite for GET /evening endpoint.
 * Validates correct response body, status code, headers, and edge cases.
 * Section 0.4.2 F-004 requirements: Returns "Good evening" with 200 status.
 */
describe('GET /evening', () => {
  /**
   * Happy path test: Verifies the /evening endpoint returns the expected response
   * body with HTTP 200 status code.
   */
  it('should return "Good evening" with 200 status', async () => {
    const response = await request(app)
      .get(ENDPOINTS.EVENING)
      .expect(STATUS_CODES.OK);

    expect(response.text).toBe(EXPECTED_RESPONSES.EVENING);
  });

  /**
   * Header validation test: Verifies the Content-Type header is correctly set
   * for the /evening endpoint response.
   */
  it('should have correct Content-Type header', async () => {
    const response = await request(app)
      .get(ENDPOINTS.EVENING)
      .expect(STATUS_CODES.OK);

    const contentType = response.headers['content-type'];
    expect(contentType).toBeDefined();
    expect(
      contentType.includes(CONTENT_TYPES.TEXT) || 
      contentType.includes(CONTENT_TYPES.PLAIN)
    ).toBe(true);
  });

  /**
   * Response body validation test: Verifies the response body exactly matches
   * the expected "Good evening" string.
   */
  it('should return exact response body', async () => {
    const response = await request(app)
      .get(ENDPOINTS.EVENING)
      .expect(STATUS_CODES.OK);

    expect(response.text).toStrictEqual(EXPECTED_RESPONSES.EVENING);
    expect(response.text).toBe(getExpectedResponse(ENDPOINTS.EVENING));
  });

  /**
   * Edge case test: Verifies the endpoint behavior with trailing slash.
   * Depending on Express configuration, /evening/ may return 404 or redirect.
   */
  it('should handle trailing slash behavior appropriately', async () => {
    const response = await request(app)
      .get(`${ENDPOINTS.EVENING}/`);

    // Trailing slash typically results in 404 unless explicitly handled
    // Express strict routing may differentiate between /evening and /evening/
    expect([STATUS_CODES.OK, STATUS_CODES.NOT_FOUND]).toContain(response.status);
  });

  /**
   * Header presence test: Verifies Content-Length header is present.
   */
  it('should include Content-Length header in response', async () => {
    const response = await request(app)
      .get(ENDPOINTS.EVENING)
      .expect(STATUS_CODES.OK);

    const contentLength = response.headers['content-length'];
    expect(contentLength).toBeDefined();
    expect(parseInt(contentLength, 10)).toBe(EXPECTED_RESPONSES.EVENING.length);
  });

  /**
   * Response consistency test: Verifies multiple requests return consistent results.
   */
  it('should return consistent response across multiple requests', async () => {
    const response1 = await request(app).get(ENDPOINTS.EVENING);
    const response2 = await request(app).get(ENDPOINTS.EVENING);

    expect(response1.status).toBe(response2.status);
    expect(response1.text).toBe(response2.text);
    expect(response1.text).toBe(EXPECTED_RESPONSES.EVENING);
  });
});

/**
 * Test suite for 404 error handling.
 * Validates proper 404 responses for undefined routes and edge cases.
 * Section 0.4.2 Error Handling requirements.
 */
describe('404 Handling', () => {
  /**
   * Basic 404 test: Verifies undefined routes return 404 status code.
   */
  it('should return 404 for undefined routes like /unknown', async () => {
    const response = await request(app)
      .get('/unknown')
      .expect(STATUS_CODES.NOT_FOUND);

    expect(response.status).toBe(STATUS_CODES.NOT_FOUND);
  });

  /**
   * Deep nesting test: Verifies deeply nested undefined paths return 404.
   */
  it('should return 404 for deeply nested undefined paths /a/b/c/d', async () => {
    const response = await request(app)
      .get('/a/b/c/d')
      .expect(STATUS_CODES.NOT_FOUND);

    expect(response.status).toBe(STATUS_CODES.NOT_FOUND);
  });

  /**
   * Root path test: Verifies the root path (/) handling.
   * The root path may return 404 if not explicitly defined as a route.
   */
  it('should handle root path (/) appropriately', async () => {
    const response = await request(app)
      .get(ENDPOINTS.ROOT);

    // Root path is not defined in our routes, so should return 404
    // If root is later defined, update this test accordingly
    expect(response.status).toBe(STATUS_CODES.NOT_FOUND);
  });

  /**
   * Multiple invalid routes test: Iterates through INVALID_ROUTES constant
   * to verify all invalid routes return 404.
   */
  it('should return 404 for all routes in INVALID_ROUTES constant', async () => {
    // Test each invalid route from the constants
    for (const invalidRoute of INVALID_ROUTES) {
      const response = await request(app).get(invalidRoute);
      expect(response.status).toBe(STATUS_CODES.NOT_FOUND);
    }
  });

  /**
   * 404 response body test: Verifies 404 responses include an appropriate
   * error message or body.
   */
  it('should return appropriate error message body for 404 responses', async () => {
    const response = await request(app)
      .get('/nonexistent-route')
      .expect(STATUS_CODES.NOT_FOUND);

    // Response body should exist and indicate not found
    expect(response.text).toBeDefined();
    expect(response.text.length).toBeGreaterThan(0);
  });

  /**
   * Special characters test: Verifies routes with special characters return 404.
   */
  it('should return 404 for routes with special characters', async () => {
    const specialRoutes = [
      '/hello%20world',
      '/test/path?invalid',
      '/route#anchor'
    ];

    for (const route of specialRoutes) {
      const response = await request(app).get(route);
      expect(response.status).toBe(STATUS_CODES.NOT_FOUND);
    }
  });
});

/**
 * Test suite for HTTP method validation.
 * Validates proper error responses for non-GET methods to defined routes.
 * Section 0.4.2 requirements: POST/PUT/DELETE to defined routes return 404 or 405.
 */
describe('HTTP Methods', () => {
  /**
   * POST method test: Verifies POST requests to /hello return 404 or 405.
   * Express does not define POST handler for /hello, so should reject.
   */
  it('should return 404 or 405 for POST to /hello', async () => {
    const response = await request(app)
      .post(ENDPOINTS.HELLO)
      .send({ data: 'test' });

    // Either 404 (route not found) or 405 (method not allowed) is acceptable
    expect([STATUS_CODES.NOT_FOUND, STATUS_CODES.METHOD_NOT_ALLOWED])
      .toContain(response.status);
  });

  /**
   * PUT method test: Verifies PUT requests to /hello return 404 or 405.
   */
  it('should return 404 or 405 for PUT to /hello', async () => {
    const response = await request(app)
      .put(ENDPOINTS.HELLO)
      .send({ data: 'test' });

    expect([STATUS_CODES.NOT_FOUND, STATUS_CODES.METHOD_NOT_ALLOWED])
      .toContain(response.status);
  });

  /**
   * DELETE method test: Verifies DELETE requests to /evening return 404 or 405.
   */
  it('should return 404 or 405 for DELETE to /evening', async () => {
    const response = await request(app)
      .delete(ENDPOINTS.EVENING);

    expect([STATUS_CODES.NOT_FOUND, STATUS_CODES.METHOD_NOT_ALLOWED])
      .toContain(response.status);
  });

  /**
   * PATCH method test: Verifies PATCH requests to endpoints return 404 or 405.
   */
  it('should return 404 or 405 for PATCH to /hello', async () => {
    const response = await request(app)
      .patch(ENDPOINTS.HELLO)
      .send({ data: 'test' });

    expect([STATUS_CODES.NOT_FOUND, STATUS_CODES.METHOD_NOT_ALLOWED])
      .toContain(response.status);
  });

  /**
   * OPTIONS method test: Verifies OPTIONS requests are handled appropriately.
   * Express may return 200 with allowed methods or 404/405.
   */
  it('should handle OPTIONS requests appropriately', async () => {
    const response = await request(app)
      .options(ENDPOINTS.HELLO);

    // OPTIONS may return 200 with allowed methods or 404
    expect([STATUS_CODES.OK, STATUS_CODES.NOT_FOUND, STATUS_CODES.METHOD_NOT_ALLOWED])
      .toContain(response.status);
  });

  /**
   * HEAD method test: Verifies HEAD requests to GET endpoints work correctly.
   * HEAD should behave like GET but without response body.
   */
  it('should handle HEAD requests to GET endpoints', async () => {
    const response = await request(app)
      .head(ENDPOINTS.HELLO);

    // HEAD requests to GET endpoints should return 200
    expect(response.status).toBe(STATUS_CODES.OK);
    // HEAD response should have no body
    expect(response.text).toBeFalsy();
  });
});
