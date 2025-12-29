/**
 * Jest Test Suite for Express.js Server Endpoints
 * 
 * This test file verifies the correct behavior of the Express.js server
 * endpoints defined in app.js:
 * - GET / : Should return "Hello world" with status 200
 * - GET /evening : Should return "Good evening" with status 200
 * 
 * Uses supertest for HTTP assertions without starting a live server.
 */

'use strict';

// Import supertest for HTTP assertions
const request = require('supertest');

// Import the Express app from app.js (per modular architecture refactoring)
// The app module exports the configured Express application instance
const app = require('../app');

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
});
