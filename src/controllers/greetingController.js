/**
 * Greeting Controller
 * 
 * Handler functions for greeting endpoints extracted from server.js.
 * Implements Controller pattern for separation of concerns.
 * 
 * This controller provides handler functions for two greeting endpoints:
 * - getHello: Handles GET / requests, returns "Hello world"
 * - getEvening: Handles GET /evening requests, returns "Good evening"
 * 
 * @module controllers/greetingController
 */

'use strict';

/**
 * Root endpoint handler
 * GET / - Returns "Hello world" as plain text response
 * 
 * This function handles requests to the root path and sends back
 * a simple greeting message. Extracted from the original server.js
 * inline handler to follow the Controller pattern.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {void} Sends "Hello world" response to client
 */
const getHello = (req, res) => {
  res.send('Hello world');
};

/**
 * Evening endpoint handler
 * GET /evening - Returns "Good evening" as plain text response
 * 
 * This function handles requests to the /evening path and sends back
 * an evening greeting message. Extracted from the original server.js
 * inline handler to follow the Controller pattern.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {void} Sends "Good evening" response to client
 */
const getEvening = (req, res) => {
  res.send('Good evening');
};

// Export controller functions for use by route definitions
module.exports = { getHello, getEvening };
