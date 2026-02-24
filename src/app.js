/**
 * Express Application Factory Module
 *
 * Implements the Factory Pattern to create and configure an Express.js 5.x
 * application instance without binding it to an HTTP server. This deliberate
 * separation of concerns decouples application configuration (route mounting,
 * middleware registration) from server lifecycle management (port binding,
 * error handling, graceful shutdown), which remains exclusively in server.js.
 *
 * Dual-consumption model:
 *   - Production: server.js imports this module via require('./src/app')
 *     and calls app.listen() to bind the HTTP server
 *   - Testing: tests/integration/endpoints.test.js imports this module via
 *     require('../../src/app') and passes the app directly to Supertest
 *     for HTTP assertion testing without actual TCP port binding
 *
 * Architecture:
 *   - This module creates the Express instance and mounts route handlers
 *   - src/routes/index.js provides the centralized route barrel export
 *   - src/config/index.js provides environment-driven configuration
 *   - server.js owns the HTTP lifecycle (listen, errors, shutdown)
 *
 * CRITICAL: This module must NEVER call app.listen() — that responsibility
 * belongs exclusively to server.js to preserve the testability contract.
 *
 * @module src/app
 */

const express = require('express');
const { mainRoutes } = require('./routes');

// =============================================================================
// Application Factory
// =============================================================================

/**
 * Configured Express application instance.
 *
 * Created via the Express factory function without any server binding.
 * Express 5.x automatically includes default middleware for response
 * handling, ETag generation, and content-type negotiation.
 *
 * @type {import('express').Application}
 */
const app = express();

// =============================================================================
// Route Mounting
// =============================================================================

/**
 * Mount the main route handler at the application root path.
 *
 * The mainRoutes router (imported from the barrel at ./routes) registers:
 *   - GET '/'        → responds with 'Hello, World!\n'
 *   - GET '/evening' → responds with 'Good evening'
 *
 * Mounting at '/' preserves the original route paths so that requests
 * are matched directly against the router's path definitions.
 */
app.use('/', mainRoutes);

// =============================================================================
// Module Export
// =============================================================================

module.exports = app;
