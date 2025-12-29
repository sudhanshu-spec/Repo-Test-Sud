'use strict';

/**
 * Greeting Routes Module
 * 
 * This module defines greeting-related endpoints extracted from the original
 * server.js as part of the Express.js modular architecture refactoring:
 * - GET / : Returns "Hello world" as plain text response
 * - GET /evening : Returns "Good evening" as plain text response
 * 
 * Uses Express Router pattern for modular, mountable route handlers.
 * 
 * @module routes/greeting
 */

const express = require('express');

/**
 * Express Router instance for greeting routes
 * @type {express.Router}
 */
const router = express.Router();

/**
 * Root endpoint handler
 * GET / - Returns "Hello world" as plain text response
 * 
 * This endpoint was extracted from server.js lines 30-32.
 * Response string is character-exact to maintain behavioral compatibility.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {void} Sends "Hello world" with HTTP 200 status
 */
router.get('/', (req, res) => {
  res.send('Hello world');
});

/**
 * Evening endpoint handler
 * GET /evening - Returns "Good evening" as plain text response
 * 
 * This endpoint was extracted from server.js lines 41-43.
 * Response string is character-exact to maintain behavioral compatibility.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {void} Sends "Good evening" with HTTP 200 status
 */
router.get('/evening', (req, res) => {
  res.send('Good evening');
});

/**
 * Export the router instance for mounting by the route aggregator.
 * The router exposes the following HTTP methods:
 * - get() - Handle GET requests
 * - use() - Mount middleware or sub-routers
 * 
 * @exports router
 */
module.exports = router;
