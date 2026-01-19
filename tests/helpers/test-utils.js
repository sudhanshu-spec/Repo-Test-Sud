/**
 * @fileoverview Test utility module providing common helper functions for test execution.
 * Provides centralized utilities for creating test Express applications, cleaning up
 * server resources, and retrieving expected response values for endpoint validation.
 * @module tests/helpers/test-utils
 */

'use strict';

const { ENDPOINTS, EXPECTED_RESPONSES } = require('../fixtures/constants');

/**
 * Returns the Express application instance for testing.
 * Imports the actual app.js module to enable Supertest to test the real application
 * without starting the server.
 * 
 * @returns {express.Application} Configured Express application instance ready for Supertest
 * @example
 * const request = require('supertest');
 * const { createTestApp } = require('../helpers/test-utils');
 * const app = createTestApp();
 * await request(app).get('/hello').expect(200);
 */
function createTestApp() {
  // Import the actual app.js module for testing
  // This ensures we're testing the real application code
  const app = require('../../app');
  return app;
}

/**
 * Ensures a server instance is properly closed after tests to prevent port conflicts.
 * Handles already-closed servers gracefully and returns a Promise for async/await compatibility.
 * 
 * @param {http.Server|null} server - The server instance to close, or null if no server exists
 * @returns {Promise<void>} Resolves when server is successfully closed or was already closed
 * @example
 * const server = app.listen(3000);
 * // ... run tests
 * await cleanupServer(server);
 */
function cleanupServer(server) {
  return new Promise((resolve, reject) => {
    // Handle null or undefined server gracefully
    if (!server) {
      resolve();
      return;
    }

    // Check if server is already closed by checking listening state
    if (!server.listening) {
      resolve();
      return;
    }

    // Attempt to close the server with error handling
    server.close((err) => {
      if (err) {
        // If error is ENOTCONN (socket not connected) or similar, treat as already closed
        if (err.code === 'ERR_SERVER_NOT_RUNNING' || err.code === 'ENOTCONN') {
          resolve();
          return;
        }
        reject(err);
        return;
      }
      resolve();
    });
  });
}

/**
 * Returns the expected response string for a given endpoint path.
 * Maps endpoint paths to their expected response bodies using centralized constants.
 * 
 * @param {string} endpoint - The endpoint path (e.g., '/hello', '/evening')
 * @returns {string|null} The expected response string for the endpoint, or null if unknown
 * @example
 * const expected = getExpectedResponse('/hello');
 * console.log(expected); // 'Hello world'
 */
function getExpectedResponse(endpoint) {
  // Normalize endpoint by ensuring it starts with '/'
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  // Create reverse mapping from endpoint paths to response keys
  const endpointToResponseMap = {
    [ENDPOINTS.HELLO]: EXPECTED_RESPONSES.HELLO,
    [ENDPOINTS.EVENING]: EXPECTED_RESPONSES.EVENING
  };

  // Return the expected response or null for unknown endpoints
  return endpointToResponseMap[normalizedEndpoint] || null;
}

module.exports = {
  createTestApp,
  cleanupServer,
  getExpectedResponse
};
