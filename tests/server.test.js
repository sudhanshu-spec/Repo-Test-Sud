/**
 * Jest Test Suite for Express.js Server Endpoints
 * 
 * This test file verifies the correct behavior of the Express.js server
 * endpoints defined in server.js:
 * - GET / : Should return "Hello world" with status 200
 * - GET /evening : Should return "Good evening" with status 200
 * 
 * Security Header Verification:
 * This test suite also verifies that security headers are properly set by
 * the helmet.js middleware as part of the security hardening implementation:
 * - X-Powered-By header should be removed (prevents server fingerprinting)
 * - Content-Security-Policy header should be present (mitigates XSS attacks)
 * - X-Content-Type-Options header should be 'nosniff' (prevents MIME sniffing)
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
   * Verifies the endpoint returns correct status, response text, and security headers
   */
  describe('GET /', () => {
    test('GET / returns Hello world', async () => {
      const response = await request(app).get('/');
      
      // Verify response status and body
      expect(response.status).toBe(200);
      expect(response.text).toBe('Hello world');
      
      /**
       * Security Header Assertions
       * These assertions verify that helmet.js security middleware is active
       * and properly configured to protect against common web vulnerabilities.
       */
      
      // Verify X-Powered-By header is removed (prevents server fingerprinting)
      // Helmet removes this header by default to hide that Express is being used
      expect(response.headers['x-powered-by']).toBeUndefined();
      
      // Verify Content-Security-Policy header is present (mitigates XSS and injection attacks)
      // Helmet sets a restrictive default CSP that limits resource loading
      expect(response.headers['content-security-policy']).toBeDefined();
      
      // Verify X-Content-Type-Options header is set to 'nosniff' (prevents MIME sniffing)
      // This header stops browsers from trying to guess the content type
      expect(response.headers['x-content-type-options']).toBe('nosniff');
    });
  });

  /**
   * Test suite for the evening endpoint (/evening)
   * Verifies the endpoint returns correct status, response text, and security headers
   */
  describe('GET /evening', () => {
    test('GET /evening returns Good evening', async () => {
      const response = await request(app).get('/evening');
      
      // Verify response status and body
      expect(response.status).toBe(200);
      expect(response.text).toBe('Good evening');
      
      /**
       * Security Header Assertions
       * These assertions verify that helmet.js security middleware is active
       * and properly configured to protect against common web vulnerabilities.
       */
      
      // Verify X-Powered-By header is removed (prevents server fingerprinting)
      // Helmet removes this header by default to hide that Express is being used
      expect(response.headers['x-powered-by']).toBeUndefined();
      
      // Verify Content-Security-Policy header is present (mitigates XSS and injection attacks)
      // Helmet sets a restrictive default CSP that limits resource loading
      expect(response.headers['content-security-policy']).toBeDefined();
      
      // Verify X-Content-Type-Options header is set to 'nosniff' (prevents MIME sniffing)
      // This header stops browsers from trying to guess the content type
      expect(response.headers['x-content-type-options']).toBe('nosniff');
    });
  });
});
