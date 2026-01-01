/**
 * Express Application Configuration
 * 
 * This module is responsible for creating and configuring the Express application instance.
 * It imports routes and mounts them, providing a clean separation between application
 * configuration and server startup.
 * 
 * This file extracts the Express app instantiation and route mounting from the original
 * server.js as part of the modular architecture refactoring.
 */

'use strict';

// Import Express web framework
const express = require('express');

// Import route definitions
const routes = require('./routes');

// Create Express application instance
const app = express();

// Mount routes at root path
// All routes defined in ./routes/index.js will be accessible from the root
app.use('/', routes);

// Export app instance for server.js and testing
module.exports = app;
