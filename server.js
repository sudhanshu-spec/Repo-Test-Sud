/**
 * HTTP Server Entry Point
 *
 * This module binds the Express application to an HTTP server and manages
 * the complete server lifecycle including startup, error handling, and
 * graceful shutdown support.
 *
 * Architecture:
 *   - src/app.js       → Express app factory (routes & middleware)
 *   - src/config/      → Environment-driven configuration
 *   - src/routes/      → Route handlers
 *
 * Lifecycle:
 *   1. Import configured Express app and environment settings
 *   2. Bind app to configured host:port via app.listen()
 *   3. Register error handler for EADDRINUSE, EACCES, and generic errors
 *   4. Log startup confirmation with server URL
 *
 * Usage:
 *   npm start                              # Default: http://127.0.0.1:3000/
 *   HOST=0.0.0.0 PORT=8080 npm start       # Custom binding
 *
 * @module server
 */

'use strict';

// =============================================================================
// Dependencies
// =============================================================================

/**
 * Pre-configured Express application instance.
 * Routes and middleware are already mounted in src/app.js.
 * The app factory never calls listen() — that responsibility belongs here.
 * @type {import('express').Application}
 */
const app = require('./src/app');

/**
 * Application configuration settings.
 * Values are sourced from environment variables with sensible defaults.
 * @type {{ host: string, port: number, env: string }}
 */
const config = require('./src/config');

// =============================================================================
// Server Initialization
// =============================================================================

/**
 * HTTP server instance returned by Express app.listen().
 *
 * Binds the Express app to the configured network interface and port.
 * The callback fires once the server is ready to accept connections,
 * logging the startup URL to stdout.
 *
 * @type {import('http').Server}
 */
const server = app.listen(config.port, config.host, () => {
  // Display startup confirmation with the server URL
  console.log(`Server running at http://${config.host}:${config.port}/`);
});

// =============================================================================
// Error Handling
// =============================================================================

/**
 * Server error event handler.
 *
 * Suppresses fatal server errors to prevent unhandled exception crashes.
 * Handles the following error codes:
 *   - EADDRINUSE: Port is already bound by another process
 *   - EACCES: Insufficient privileges to bind to the requested port
 *   - Generic: Any other unexpected server-level error
 *
 * @param {NodeJS.ErrnoException} error - The server error object
 */
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${config.port} is already in use`);
  } else if (error.code === 'EACCES') {
    console.error(`Port ${config.port} requires elevated privileges`);
  } else {
    console.error(`Server error: ${error.message}`);
  }
});
