/**
 * Route Definitions
 * 
 * Express Router module that defines the application routes using express.Router() pattern.
 * This file extracts route definitions from the original server.js and delegates
 * request handling to the homeController module.
 * 
 * Routes:
 * - GET / : Delegates to homeController.getRoot
 * - GET /evening : Delegates to homeController.getEvening
 */

'use strict';

// Import Express web framework for Router functionality
const express = require('express');

// Create Express Router instance for modular route registration
const router = express.Router();

// Import controller containing request handler functions
const homeController = require('../controllers/homeController');

/**
 * Root endpoint route
 * GET / - Delegates handling to homeController.getRoot
 * Returns "Hello world" as plain text response with status 200
 */
router.get('/', homeController.getRoot);

/**
 * Evening endpoint route
 * GET /evening - Delegates handling to homeController.getEvening
 * Returns "Good evening" as plain text response with status 200
 */
router.get('/evening', homeController.getEvening);

// Export router for mounting in app.js
module.exports = router;
