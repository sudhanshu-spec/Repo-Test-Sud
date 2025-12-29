'use strict';

/**
 * Express Application Configuration Module
 * 
 * This module creates and configures the Express application instance,
 * registers route middleware, and exports the app for use by server.js
 * and test files.
 * 
 * This file implements the App-Server Separation pattern as defined in
 * Agent Action Plan Section 0.3.3, decoupling Express application
 * configuration from HTTP listener concerns in server.js.
 * 
 * Architecture:
 * - server.js: HTTP listener bootstrap (imports this module)
 * - app.js: Express configuration (this file)
 * - src/routes/: Route definitions (imported here)
 * 
 * The app instance exposes standard Express methods:
 * - use() - Mount middleware and routers
 * - get() - Define GET route handlers
 * - post() - Define POST route handlers
 * - listen() - Start HTTP server (used by server.js)
 * 
 * @module app
 */

// Import Express web framework
// Provides express() factory function and app.use() for middleware mounting
const express = require('express');

// Import route aggregator module that combines all route definitions
// Contains greeting endpoints: GET / and GET /evening
const routes = require('./src/routes');

/**
 * Express application instance
 * 
 * Created using the express() factory function. This instance is configured
 * with all route middleware and exported for use by:
 * - server.js: For starting the HTTP listener
 * - tests: For HTTP assertion testing via supertest
 * 
 * @type {express.Application}
 */
const app = express();

/**
 * Register route middleware
 * 
 * Mounts all routes from src/routes/index.js at the root path '/'.
 * The route aggregator provides:
 * - GET / : Returns "Hello world" (HTTP 200)
 * - GET /evening : Returns "Good evening" (HTTP 200)
 * 
 * This maintains exact behavioral compatibility with the original
 * server.js implementation per Agent Action Plan Section 0.7.2.
 */
app.use('/', routes);

/**
 * Export Express application instance
 * 
 * The app is exported for use by:
 * - server.js: Imports app and calls app.listen() for HTTP server
 * - tests/server.test.js: Imports app for supertest HTTP assertions
 * 
 * This export pattern enables:
 * - Test compatibility without starting HTTP listener
 * - Separation of app configuration from server bootstrap
 * 
 * @exports app
 */
module.exports = app;
