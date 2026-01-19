/**
 * @fileoverview HTTP Server Entry Point
 *
 * Production entry point for the Express application. This file imports
 * the configured Express app from app.js and starts the HTTP server.
 *
 * @example
 * // Start the server in production:
 * node server.js
 *
 * // Start with custom port:
 * PORT=8080 node server.js
 *
 * @module server
 * @requires ./app
 * @author Blitzy Platform
 * @version 1.0.0
 */

'use strict';

// =============================================================================
// Dependencies
// =============================================================================

// Import the configured Express application instance
// Note: App configuration is separated for testability with Supertest
const app = require('./app');

// =============================================================================
// Configuration
// =============================================================================

/**
 * Server port number.
 * Uses PORT environment variable if set, otherwise defaults to 3000.
 * This allows flexible deployment across different environments.
 *
 * @constant {number}
 * @default 3000
 */
const PORT = process.env.PORT || 3000;

// =============================================================================
// Server Initialization
// =============================================================================

/**
 * HTTP server instance.
 * Created by calling app.listen() which starts accepting connections.
 * The callback fires once the server is ready to accept requests.
 *
 * @type {http.Server}
 */
const server = app.listen(PORT, () => {
  // Log startup confirmation with the active port number
  console.log(`Server listening on port ${PORT}`);
});

// =============================================================================
// Module Exports
// =============================================================================

/**
 * Export the server instance for programmatic control and testing.
 * This allows external code to call server.close() for graceful shutdown.
 *
 * @exports {http.Server} server - The HTTP server instance
 */
module.exports = server;
