/**
 * Express.js Route Definitions Module
 * 
 * This module implements the Router pattern using express.Router() for modular,
 * mountable route handlers. Routes are separated from the main application
 * configuration and delegate request handling to controller functions.
 * 
 * Endpoints defined:
 * - GET / : Mapped to greetingController.getHello - Returns "Hello world"
 * - GET /evening : Mapped to greetingController.getEvening - Returns "Good evening"
 * 
 * This module is mounted by src/app.js via app.use('/', routes) to integrate
 * the routes into the Express application.
 * 
 * @module routes/index
 */

'use strict';

// Import Express web framework for Router factory function
const express = require('express');

// Create a new Router instance for modular, mountable route handlers
const router = express.Router();

// Import controller functions for handling endpoint requests
const greetingController = require('../controllers/greetingController');

/**
 * Root route definition
 * GET / - Delegates to greetingController.getHello
 * 
 * Maps the root path to the getHello handler which returns
 * "Hello world" as a plain text response.
 */
router.get('/', greetingController.getHello);

/**
 * Evening route definition
 * GET /evening - Delegates to greetingController.getEvening
 * 
 * Maps the /evening path to the getEvening handler which returns
 * "Good evening" as a plain text response.
 */
router.get('/evening', greetingController.getEvening);

// Export router for mounting in src/app.js
module.exports = router;
