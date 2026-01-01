/**
 * Home Controller
 * 
 * Controller module containing request handler functions for the Express application.
 * Implements the Single Responsibility Principle by separating handler logic from route definitions.
 * 
 * Exports:
 * - getRoot(): Handler for GET / endpoint
 * - getEvening(): Handler for GET /evening endpoint
 */

'use strict';

/**
 * Root endpoint handler
 * GET / - Returns "Hello world" as plain text response
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getRoot = (req, res) => {
  res.send('Hello world');
};

/**
 * Evening endpoint handler
 * GET /evening - Returns "Good evening" as plain text response
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getEvening = (req, res) => {
  res.send('Good evening');
};
