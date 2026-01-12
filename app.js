/**
 * @fileoverview Express application configuration module.
 * Configures Express app with route handlers for /hello and /evening endpoints.
 * Exports the app instance without starting the server, enabling testability with Supertest.
 * 
 * This separation follows the Express.js testing best practice of separating
 * app configuration from server listening for proper unit testing.
 * 
 * @module app
 * @requires express
 */

'use strict';

const express = require('express');

/**
 * Express application instance.
 * @type {express.Application}
 */
const app = express();

/**
 * GET /hello endpoint handler.
 * Returns "Hello world" with HTTP 200 status.
 * 
 * @route GET /hello
 * @returns {string} "Hello world"
 * @status 200 - Success
 */
app.get('/hello', (req, res) => {
  res.status(200).send('Hello world');
});

/**
 * GET /evening endpoint handler.
 * Returns "Good evening" with HTTP 200 status.
 * 
 * @route GET /evening
 * @returns {string} "Good evening"
 * @status 200 - Success
 */
app.get('/evening', (req, res) => {
  res.status(200).send('Good evening');
});

/**
 * 404 Not Found handler for undefined routes.
 * Must be defined last to catch all unmatched requests.
 * 
 * @route ALL /*
 * @returns {string} "Not Found"
 * @status 404 - Not Found
 */
app.use((req, res) => {
  res.status(404).send('Not Found');
});

/**
 * Export the Express app instance for use by server.js and tests.
 * @exports app
 */
module.exports = app;
