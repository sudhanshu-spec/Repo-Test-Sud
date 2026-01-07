/**
 * Jest Test Suite for Express.js Server HTTP Method Constraints
 * 
 * This test file verifies that non-GET HTTP methods (POST, PUT, DELETE) 
 * return appropriate 404 responses when made to GET-only routes.
 * 
 * The Express.js server defines only GET handlers for:
 * - GET / : Returns "Hello world"
 * - GET /evening : Returns "Good evening"
 * 
 * Per Express.js default behavior, HTTP methods without explicit route
 * handlers will return 404 Not Found status.
 * 
 * Uses supertest for HTTP assertions without starting a live server.
 */

'use strict';

// Import supertest for HTTP assertions
const request = require('supertest');

// Import the Express app from server.js
const app = require('../server');

describe('HTTP Method Constraints', () => {
  /**
   * Test suite for POST method to GET-only routes
   * Verifies POST requests return 404 since only GET handlers are defined
   */
  describe('POST method to GET-only routes', () => {
    it('should return 404 for POST to /', async () => {
      const response = await request(app).post('/');
      expect(response.status).toBe(404);
    });

    it('should return 404 for POST to /evening', async () => {
      const response = await request(app).post('/evening');
      expect(response.status).toBe(404);
    });
  });

  /**
   * Test suite for PUT method to GET-only routes
   * Verifies PUT requests return 404 since only GET handlers are defined
   */
  describe('PUT method to GET-only routes', () => {
    it('should return 404 for PUT to /', async () => {
      const response = await request(app).put('/');
      expect(response.status).toBe(404);
    });

    it('should return 404 for PUT to /evening', async () => {
      const response = await request(app).put('/evening');
      expect(response.status).toBe(404);
    });
  });

  /**
   * Test suite for DELETE method to GET-only routes
   * Verifies DELETE requests return 404 since only GET handlers are defined
   */
  describe('DELETE method to GET-only routes', () => {
    it('should return 404 for DELETE to /', async () => {
      const response = await request(app).delete('/');
      expect(response.status).toBe(404);
    });

    it('should return 404 for DELETE to /evening', async () => {
      const response = await request(app).delete('/evening');
      expect(response.status).toBe(404);
    });
  });

  /**
   * Test suite for PATCH method to GET-only routes
   * Additional coverage for another common HTTP method
   */
  describe('PATCH method to GET-only routes', () => {
    it('should return 404 for PATCH to /', async () => {
      const response = await request(app).patch('/');
      expect(response.status).toBe(404);
    });

    it('should return 404 for PATCH to /evening', async () => {
      const response = await request(app).patch('/evening');
      expect(response.status).toBe(404);
    });
  });

  /**
   * Test suite for HEAD method behavior
   * HEAD requests to GET routes should succeed as Express handles them automatically
   */
  describe('HEAD method to GET routes', () => {
    it('should return 200 for HEAD to / (Express auto-handles HEAD for GET routes)', async () => {
      const response = await request(app).head('/');
      expect(response.status).toBe(200);
    });

    it('should return 200 for HEAD to /evening (Express auto-handles HEAD for GET routes)', async () => {
      const response = await request(app).head('/evening');
      expect(response.status).toBe(200);
    });
  });

  /**
   * Test suite for OPTIONS method behavior
   * Verifies OPTIONS requests return appropriate response
   */
  describe('OPTIONS method behavior', () => {
    it('should return 200 for OPTIONS to /', async () => {
      const response = await request(app).options('/');
      expect(response.status).toBe(200);
    });

    it('should return 200 for OPTIONS to /evening', async () => {
      const response = await request(app).options('/evening');
      expect(response.status).toBe(200);
    });
  });
});
