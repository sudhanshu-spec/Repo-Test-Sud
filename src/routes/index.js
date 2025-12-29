'use strict';

/**
 * Route Aggregator Module
 * 
 * This module serves as the central routing hub for the Express.js application,
 * aggregating all route modules and exporting a unified router instance.
 * 
 * The Route Aggregator pattern enables:
 * - Scalable route organization by mounting sub-routers
 * - Separation of concerns between different route groups
 * - Easy addition of new route modules with appropriate path prefixes
 * 
 * This file was created as part of the Express.js modular architecture refactoring
 * per Agent Action Plan Section 0.4.2 (Transformation 3).
 * 
 * @module routes/index
 */

const express = require('express');
const greetingRoutes = require('./greeting.routes');

/**
 * Express Router instance for aggregating all route modules
 * 
 * This router collects and mounts all sub-routers, providing a unified
 * entry point for the application's route hierarchy.
 * 
 * Available HTTP method handlers (inherited from mounted sub-routers):
 * - use() - Mount middleware or sub-routers
 * - get() - Handle GET requests
 * - post() - Handle POST requests
 * - put() - Handle PUT requests
 * - delete() - Handle DELETE requests
 * 
 * @type {express.Router}
 */
const router = express.Router();

/**
 * Mount greeting routes at the root path
 * 
 * The greeting routes module provides:
 * - GET / : Returns "Hello world" (HTTP 200)
 * - GET /evening : Returns "Good evening" (HTTP 200)
 * 
 * By mounting at '/', these routes are accessible directly at the application root.
 * This preserves the original endpoint paths from server.js.
 */
router.use('/', greetingRoutes);

/**
 * Export the aggregated router instance for mounting in app.js
 * 
 * The router can be mounted in the Express app using:
 * app.use('/', routes);
 * 
 * This maintains the route paths as:
 * - GET / → greeting.routes.js handler
 * - GET /evening → greeting.routes.js handler
 * 
 * To add new route modules, import them and mount with appropriate path prefixes:
 * const newRoutes = require('./new.routes');
 * router.use('/api/new', newRoutes);
 * 
 * @exports router
 */
module.exports = router;
