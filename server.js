/**
 * @file Express.js Application Entry Point
 * @module server
 * @description Node.js Express server tutorial implementing greeting endpoints.
 * This server provides two GET endpoints for demonstrating basic Express.js functionality:
 * - GET / : Returns "Hello world"
 * - GET /evening : Returns "Good evening"
 * 
 * The server listens on the PORT environment variable or defaults to port 3000.
 * The app instance is exported for testing purposes with Jest and Supertest.
 * 
 * @version 1.0.0
 * @see {@link README.md} for setup and usage instructions
 */

// Enable strict mode for enhanced error detection and secure JavaScript practices
'use strict';

// Import Express web framework for building RESTful APIs
const express = require('express');

// Create Express application instance for routing and middleware configuration
const app = express();

/**
 * @constant {number} PORT
 * @description Server listening port from environment variable or default.
 * The port can be configured via the PORT environment variable.
 * @default 3000
 */
const PORT = process.env.PORT || 3000;

/**
 * Root endpoint handler
 * GET / - Returns a greeting message as plain text response.
 * 
 * @param {import('express').Request} req - Express request object containing HTTP request data
 * @param {import('express').Response} res - Express response object for sending HTTP responses
 * @returns {void} Sends 'Hello world' as plain text response
 * @example
 * // curl http://localhost:3000/
 * // Response: "Hello world"
 * @see README.md#api-reference
 */
app.get('/', (req, res) => {
  res.send('Hello world');
});

/**
 * Evening endpoint handler
 * GET /evening - Returns an evening greeting as plain text response.
 * 
 * @param {import('express').Request} req - Express request object containing HTTP request data
 * @param {import('express').Response} res - Express response object for sending HTTP responses
 * @returns {void} Sends 'Good evening' as plain text response
 * @example
 * // curl http://localhost:3000/evening
 * // Response: "Good evening"
 * @see README.md#api-reference
 */
app.get('/evening', (req, res) => {
  res.send('Good evening');
});

/**
 * Conditional server startup block.
 * This pattern enables testability with Jest/Supertest by preventing port binding
 * during test imports. The server only starts when this file is executed directly
 * (e.g., node server.js), not when imported as a module for in-process HTTP testing.
 * This allows test files to import the app and make requests without starting an
 * actual HTTP server on a port.
 */
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

/**
 * @exports app - Express application instance for external testing
 * @description Exports the configured Express app for use in test suites.
 * Test frameworks like Supertest can import this to make HTTP requests
 * without starting the server on an actual port.
 */
module.exports = app;
