/**
 * @fileoverview Express.js Application Entry Point
 * 
 * This module implements a lightweight Node.js Express web server tutorial
 * demonstrating best practices for building testable, production-ready APIs.
 * 
 * @description
 * The server provides two GET endpoints:
 * - GET / : Returns "Hello world" greeting
 * - GET /evening : Returns "Good evening" greeting
 * 
 * Key architectural decisions:
 * 1. The app is exported separately from server startup to enable testing
 * 2. The require.main === module guard prevents auto-start on import
 * 3. Port configuration via environment variables for deployment flexibility
 * 
 * @example
 * // Start server directly
 * node server.js
 * 
 * @example
 * // Import for testing (server doesn't start automatically)
 * const app = require('./server');
 * const request = require('supertest');
 * const response = await request(app).get('/');
 * 
 * @module server
 * @author Blitzy Platform
 * @version 1.0.0
 * @license MIT
 */

'use strict';

// ============================================================================
// IMPORTS
// ============================================================================

/**
 * Express.js web framework
 * @description Express provides a minimal and flexible Node.js web application
 * framework that provides robust features for web and mobile applications.
 * Key features used: routing (app.get), response methods (res.send), and
 * server creation (app.listen).
 * @see {@link https://expressjs.com/}
 */
const express = require('express');

// ============================================================================
// APPLICATION SETUP
// ============================================================================

/**
 * Express application instance
 * @description The main Express application object that handles HTTP requests.
 * This instance is configured with route handlers and can be started as a 
 * server or exported for testing. Express apps are functions that can be
 * passed directly to Supertest for in-process HTTP testing.
 * @type {express.Application}
 */
const app = express();

/**
 * Server port configuration
 * @description The port number on which the HTTP server will listen.
 * Uses the PORT environment variable if defined, otherwise defaults to 3000.
 * This pattern allows easy configuration for different deployment environments
 * (development, staging, production) without code changes.
 * 
 * @example
 * // Set custom port via environment variable
 * PORT=8080 node server.js
 * 
 * @constant {number|string}
 * @default 3000
 */
const PORT = process.env.PORT || 3000;

// ============================================================================
// ROUTE HANDLERS
// ============================================================================

/**
 * Root endpoint handler - Homepage greeting
 * 
 * @name GET /
 * @function
 * @description Handles GET requests to the root URL path and returns a
 * "Hello world" greeting. This is the primary endpoint demonstrating
 * basic Express routing.
 * 
 * Technical details:
 * - res.send() automatically sets Content-Type to 'text/html; charset=utf-8'
 * - Response status defaults to 200 OK when using res.send()
 * - The response body is the literal string "Hello world"
 * 
 * @param {express.Request} req - Express request object containing:
 *   - req.query: URL query parameters (ignored for this endpoint)
 *   - req.headers: HTTP request headers
 *   - req.method: HTTP method (always 'GET' for this handler)
 *   - req.path: URL path (always '/' for this handler)
 * @param {express.Response} res - Express response object providing:
 *   - res.send(): Sends HTTP response with automatic Content-Type
 *   - res.status(): Sets HTTP status code
 *   - res.set(): Sets response headers
 * @returns {void} Response is sent directly, no return value
 * 
 * @example
 * // Request
 * GET / HTTP/1.1
 * Host: localhost:3000
 * 
 * // Response
 * HTTP/1.1 200 OK
 * Content-Type: text/html; charset=utf-8
 * 
 * Hello world
 */
app.get('/', (req, res) => {
  // Send plain text response - Express automatically sets Content-Type header
  res.send('Hello world');
});

/**
 * Evening endpoint handler - Evening greeting
 * 
 * @name GET /evening
 * @function
 * @description Handles GET requests to the /evening URL path and returns a
 * "Good evening" greeting. Demonstrates multiple route definitions in Express.
 * 
 * Technical details:
 * - Same behavior as root endpoint with different response text
 * - Express matches routes in order of definition
 * - More specific routes should be defined before catch-all routes
 * 
 * @param {express.Request} req - Express request object (see GET / for details)
 * @param {express.Response} res - Express response object (see GET / for details)
 * @returns {void} Response is sent directly, no return value
 * 
 * @example
 * // Request
 * GET /evening HTTP/1.1
 * Host: localhost:3000
 * 
 * // Response
 * HTTP/1.1 200 OK
 * Content-Type: text/html; charset=utf-8
 * 
 * Good evening
 */
app.get('/evening', (req, res) => {
  // Send evening greeting as plain text response
  res.send('Good evening');
});

// ============================================================================
// SERVER STARTUP
// ============================================================================

/**
 * Conditional server startup guard
 * 
 * @description This pattern enables the module to be imported for testing
 * without automatically starting the HTTP server. The condition checks if
 * this file is the main entry point (run directly with `node server.js`)
 * versus being imported/required by another module (like test files).
 * 
 * Why this pattern is important:
 * 1. Testing: Supertest can work with the app object directly without
 *    needing a running server, avoiding port conflicts in test suites
 * 2. Modularity: The app can be imported and extended by other modules
 * 3. Flexibility: Allows different startup configurations for different
 *    environments (tests, development, production)
 * 
 * How it works:
 * - require.main: The Module object of the entry script
 * - module: The Module object of the current file
 * - If they're equal, this file was run directly (node server.js)
 * - If they're different, this file was imported by another module
 * 
 * @example
 * // When run directly: require.main === module is TRUE
 * $ node server.js
 * Server running on port 3000
 * 
 * @example
 * // When imported: require.main === module is FALSE
 * const app = require('./server'); // Server does NOT start
 */
if (require.main === module) {
  /**
   * Start HTTP server and listen for connections
   * 
   * @description Creates an HTTP server and binds it to the specified port.
   * The callback function is executed once the server is successfully listening.
   * 
   * The app.listen() method is a convenience method that:
   * 1. Creates an HTTP server using Node's http.createServer()
   * 2. Passes the Express app as the request handler
   * 3. Calls server.listen() with the provided port
   * 4. Returns the server instance
   * 
   * @param {number|string} PORT - The port number to listen on
   * @param {Function} callback - Called when server starts successfully
   */
  app.listen(PORT, () => {
    // Log server startup confirmation with configured port
    console.log(`Server running on port ${PORT}`);
  });
}

// ============================================================================
// MODULE EXPORTS
// ============================================================================

/**
 * Export Express application instance
 * 
 * @description Exports the configured Express app for use in testing and
 * potential composition with other Express applications.
 * 
 * Usage in tests:
 * ```javascript
 * const app = require('./server');
 * const request = require('supertest');
 * 
 * // Make in-process HTTP requests without starting server
 * const response = await request(app).get('/');
 * expect(response.status).toBe(200);
 * ```
 * 
 * @type {express.Application}
 * @exports app
 */
module.exports = app;
