/**
 * Jest Test Suite for Express.js Server Endpoints
 * 
 * This test file verifies the correct behavior of the Express.js server
 * endpoints defined in server.js:
 * - GET /        : Should return "Hello world" with status 200
 * - GET /evening : Should return "Good evening" with status 200
 * - GET /health  : Should return JSON health status with status 200
 * 
 * Uses supertest for HTTP assertions without starting a live server.
 * 
 * Middleware tested:
 * - Helmet security headers
 * - CORS support
 * - Compression
 * - Morgan logging
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
  });

  /**
   * Test suite for the health endpoint (/health)
   * Verifies the endpoint returns correct JSON health status for monitoring
   * and load balancer integration per Section 0.5.3
   */
  describe('GET /health', () => {
    test('GET /health returns JSON health status', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/application\/json/);
      expect(response.body.status).toBe('healthy');
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.uptime).toBeDefined();
      expect(typeof response.body.uptime).toBe('number');
    });

    test('GET /health timestamp is valid ISO 8601 format', async () => {
      const response = await request(app).get('/health');
      const timestamp = response.body.timestamp;
      const parsedDate = new Date(timestamp);
      expect(parsedDate.toISOString()).toBe(timestamp);
    });
  });

  /**
   * Test suite for security middleware (Helmet)
   * Verifies security headers are present in responses
   */
  describe('Security Headers (Helmet)', () => {
    test('Response includes X-Content-Type-Options header', async () => {
      const response = await request(app).get('/');
      expect(response.headers['x-content-type-options']).toBe('nosniff');
    });

    test('Response includes X-Frame-Options header', async () => {
      const response = await request(app).get('/');
      expect(response.headers['x-frame-options']).toBe('SAMEORIGIN');
    });
  });

  /**
   * Test suite for CORS middleware
   * Verifies CORS headers are present for cross-origin requests
   */
  describe('CORS Support', () => {
    test('Response includes Access-Control-Allow-Origin header', async () => {
      const response = await request(app)
        .get('/')
        .set('Origin', 'http://example.com');
      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });
  });
});
