/**
 * @fileoverview HTTP endpoint integration tests using Supertest.
 * Validates complete request/response cycles for the server application
 * including response bodies, status codes, headers, and edge cases.
 * @module tests/integration/endpoints.test
 */

'use strict';

const request = require('supertest');
const { createTestApp, getExpectedResponse } = require('../helpers/test-utils');
const {
  ENDPOINTS,
  EXPECTED_RESPONSES,
  STATUS_CODES,
  CONTENT_TYPES,
  INVALID_ROUTES
} = require('../fixtures/constants');

/**
 * Test app instance created before each test suite for isolation.
 * @type {express.Application}
 */
let app;

/**
 * Set up test app before all tests.
 * Creates a fresh Express app instance for Supertest to use.
 */
beforeAll(() => {
  app = createTestApp();
});

/**
 * Integration tests for HTTP endpoint request/response cycles.
 * Tests complete HTTP flow including status codes and response bodies.
 */
describe('Endpoint Integration', () => {
  it('should return Hello world with 200 status when GET /hello', async () => {
    const response = await request(app)
      .get(ENDPOINTS.HELLO)
      .expect(STATUS_CODES.OK);

    expect(response.text).toBe(EXPECTED_RESPONSES.HELLO);
  });

  it('should return Good evening with 200 status when GET /evening', async () => {
    const response = await request(app)
      .get(ENDPOINTS.EVENING)
      .expect(STATUS_CODES.OK);

    expect(response.text).toBe(EXPECTED_RESPONSES.EVENING);
  });

  it('should respond with correct body content for /hello using helper function', async () => {
    const response = await request(app).get(ENDPOINTS.HELLO);
    const expectedResponse = getExpectedResponse(ENDPOINTS.HELLO);

    expect(response.text).toBe(expectedResponse);
  });

  it('should respond with correct body content for /evening using helper function', async () => {
    const response = await request(app).get(ENDPOINTS.EVENING);
    const expectedResponse = getExpectedResponse(ENDPOINTS.EVENING);

    expect(response.text).toBe(expectedResponse);
  });

  it('should return 404 status when requesting undefined route', async () => {
    await request(app)
      .get('/undefined-route')
      .expect(STATUS_CODES.NOT_FOUND);
  });

  it('should return appropriate response for root path (/)', async () => {
    const response = await request(app).get(ENDPOINTS.ROOT);
    
    // Root path should return 404 as it's not defined
    expect(response.status).toBe(STATUS_CODES.NOT_FOUND);
  });

  it('should return consistent responses across multiple sequential requests', async () => {
    const firstResponse = await request(app).get(ENDPOINTS.HELLO);
    const secondResponse = await request(app).get(ENDPOINTS.HELLO);
    const thirdResponse = await request(app).get(ENDPOINTS.HELLO);

    expect(firstResponse.text).toBe(EXPECTED_RESPONSES.HELLO);
    expect(secondResponse.text).toBe(EXPECTED_RESPONSES.HELLO);
    expect(thirdResponse.text).toBe(EXPECTED_RESPONSES.HELLO);
    expect(firstResponse.status).toBe(STATUS_CODES.OK);
    expect(secondResponse.status).toBe(STATUS_CODES.OK);
    expect(thirdResponse.status).toBe(STATUS_CODES.OK);
  });
});

/**
 * Integration tests for HTTP response header validation.
 * Verifies Content-Type and Content-Length headers are correct.
 */
describe('Headers Validation', () => {
  it('should include correct Content-Type header for GET /hello', async () => {
    const response = await request(app).get(ENDPOINTS.HELLO);
    
    // Verify Content-Type contains 'text' (matches text/html or text/plain)
    expect(response.headers['content-type']).toContain('text');
    // Can also verify against specific content type constant
    expect(response.headers['content-type']).toMatch(new RegExp(CONTENT_TYPES.TEXT.split('/')[0]));
  });

  it('should include correct Content-Type header for GET /evening', async () => {
    const response = await request(app).get(ENDPOINTS.EVENING);
    
    // Verify Content-Type contains 'text' (matches text/html or text/plain)
    expect(response.headers['content-type']).toContain('text');
    // Verify it starts with 'text/' pattern matching CONTENT_TYPES.TEXT
    expect(response.headers['content-type']).toMatch(/^text\//);
  });

  it('should include Content-Length header in responses', async () => {
    const response = await request(app).get(ENDPOINTS.HELLO);

    expect(response.headers).toHaveProperty('content-length');
    expect(response.headers['content-length']).toBeDefined();
  });

  it('should have Content-Length matching response body length for /hello', async () => {
    const response = await request(app).get(ENDPOINTS.HELLO);
    const contentLength = parseInt(response.headers['content-length'], 10);

    expect(contentLength).toBe(response.text.length);
  });

  it('should have Content-Length matching response body length for /evening', async () => {
    const response = await request(app).get(ENDPOINTS.EVENING);
    const contentLength = parseInt(response.headers['content-length'], 10);

    expect(contentLength).toBe(response.text.length);
  });
});

/**
 * Integration tests for edge cases and boundary conditions.
 * Tests query parameters, trailing slashes, and invalid routes.
 */
describe('Edge Cases', () => {
  it('should return expected response when /hello has query parameters', async () => {
    const response = await request(app)
      .get(`${ENDPOINTS.HELLO}?param=value&another=test`)
      .expect(STATUS_CODES.OK);

    expect(response.text).toBe(EXPECTED_RESPONSES.HELLO);
  });

  it('should return expected response when /evening has query parameters', async () => {
    const response = await request(app)
      .get(`${ENDPOINTS.EVENING}?param=value`)
      .expect(STATUS_CODES.OK);

    expect(response.text).toBe(EXPECTED_RESPONSES.EVENING);
  });

  it('should handle trailing slash /hello/ appropriately', async () => {
    // Express typically treats /hello and /hello/ as equivalent by default
    const response = await request(app).get(`${ENDPOINTS.HELLO}/`);
    
    // Response should either be 200 (if Express normalizes) or 404 (if strict routing)
    expect([STATUS_CODES.OK, STATUS_CODES.NOT_FOUND]).toContain(response.status);
  });

  it('should handle trailing slash /evening/ appropriately', async () => {
    // Express typically treats /evening and /evening/ as equivalent by default
    const response = await request(app).get(`${ENDPOINTS.EVENING}/`);
    
    // Response should either be 200 (if Express normalizes) or 404 (if strict routing)
    expect([STATUS_CODES.OK, STATUS_CODES.NOT_FOUND]).toContain(response.status);
  });

  it('should return 404 for deeply nested undefined path', async () => {
    const deepPath = INVALID_ROUTES.find(route => route === '/a/b/c/d');
    
    await request(app)
      .get(deepPath)
      .expect(STATUS_CODES.NOT_FOUND);
  });

  it('should return 404 for all invalid routes in INVALID_ROUTES', async () => {
    for (const invalidRoute of INVALID_ROUTES) {
      const response = await request(app).get(invalidRoute);
      expect(response.status).toBe(STATUS_CODES.NOT_FOUND);
    }
  });

  it('should handle empty path segments correctly', async () => {
    // Test path with empty segments like //hello or /hello//
    const response = await request(app).get('//hello');
    
    // Express may normalize or reject - either 200 or 404 is acceptable
    expect([STATUS_CODES.OK, STATUS_CODES.NOT_FOUND]).toContain(response.status);
  });
});
