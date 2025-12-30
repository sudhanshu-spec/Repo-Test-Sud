/**
 * Express.js Application Configuration Module
 * 
 * This module creates and configures the Express application instance, implementing
 * the App/Server separation pattern for improved testability. The app configuration
 * is isolated from server startup, allowing the app to be imported and tested
 * without starting an HTTP server.
 * 
 * Architecture:
 * - Creates the Express application instance
 * - Imports and mounts routes from the routes module (./routes/index.js)
 * - Exports the configured app for use by server.js and test suites
 * 
 * This separation enables:
 * - Unit testing of the app without port binding
 * - Clean separation of concerns
 * - Modular architecture following Express.js best practices
 * 
 * @module src/app
 */

'use strict';

// Import Express web framework to create the application instance
const express = require('express');

// Import route definitions from the routes module
// Resolves to ./routes/index.js per Node.js module resolution
const routes = require('./routes');

// Create the Express application instance
// This is the core Express app object that handles all HTTP requests
const app = express();

/**
 * Mount the router middleware on the root path
 * 
 * The routes module exports an express.Router() instance that contains:
 * - GET / : Returns "Hello world"
 * - GET /evening : Returns "Good evening"
 * 
 * Using app.use('/', routes) integrates all route definitions
 * into the main application at the root path level.
 */
app.use('/', routes);

// Export the configured Express application instance
// This allows:
// - server.js to import and start the HTTP server
// - Test suites to import and test endpoints without port binding
module.exports = app;
