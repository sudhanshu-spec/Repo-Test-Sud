/**
 * @fileoverview Express.js API Route Handlers Module
 * @description Defines secured /hello and /evening endpoints with input validation
 *              middleware integration using express-validator. Routes are protected
 *              against XSS, SQL injection, and other common attack vectors.
 * @module routes/api
 * @requires express
 * @requires express-validator
 * @requires ../middleware/validators
 */

'use strict';

// =============================================================================
// EXTERNAL DEPENDENCIES
// =============================================================================

const express = require('express');
const { validationResult } = require('express-validator');

// =============================================================================
// INTERNAL DEPENDENCIES
// =============================================================================

const {
  validateHelloEndpoint,
  validateEveningEndpoint,
  handleValidationErrors
} = require('../middleware/validators');

// =============================================================================
// ROUTER INITIALIZATION
// =============================================================================

/**
 * Express Router instance for API routes
 * @type {express.Router}
 */
const router = express.Router();

// =============================================================================
// ROUTE HANDLERS
// =============================================================================

/**
 * GET /hello
 * @description Returns a greeting message "Hello World!" with optional personalization
 *              Validates and sanitizes all query parameters before processing
 * 
 * @route GET /hello
 * @param {string} [req.query.name] - Optional name for personalized greeting (1-100 chars, alphanumeric)
 * @param {string} [req.query.greeting] - Optional custom greeting prefix (max 200 chars)
 * @returns {Object} JSON response with message property
 * @returns {string} response.message - The greeting message
 * @returns {boolean} [response.success] - Success indicator (true)
 * @returns {Object} [response.query] - Sanitized query parameters (if provided)
 * 
 * @example
 * // Basic request
 * GET /hello
 * Response: { "message": "Hello World!" }
 * 
 * @example
 * // Request with name parameter
 * GET /hello?name=John
 * Response: { "message": "Hello John!", "success": true, "query": { "name": "John" } }
 * 
 * @throws {400} Validation failed - Invalid query parameters
 */
router.get(
  '/hello',
  validateHelloEndpoint,
  handleValidationErrors,
  (req, res) => {
    // Extract validated and sanitized query parameters
    const { name, greeting } = req.query;
    
    // Build response message based on provided parameters
    let message;
    
    if (name && greeting) {
      // Custom greeting with name
      message = `${greeting} ${name}!`;
    } else if (name) {
      // Default greeting with name
      message = `Hello ${name}!`;
    } else if (greeting) {
      // Custom greeting without name
      message = `${greeting} World!`;
    } else {
      // Default message
      message = 'Hello World!';
    }
    
    // Construct response object
    const response = {
      message,
      success: true
    };
    
    // Include sanitized query parameters in response if any were provided
    if (name || greeting) {
      response.query = {};
      if (name) response.query.name = name;
      if (greeting) response.query.greeting = greeting;
    }
    
    // Send JSON response with 200 OK status
    return res.status(200).json(response);
  }
);

/**
 * GET /evening
 * @description Returns an evening greeting message "Good Evening!" with optional personalization
 *              Validates and sanitizes all query parameters before processing
 * 
 * @route GET /evening
 * @param {string} [req.query.name] - Optional name for personalized greeting (1-100 chars, alphanumeric)
 * @param {string} [req.query.time] - Optional time in HH:MM format (24-hour)
 * @returns {Object} JSON response with message property
 * @returns {string} response.message - The evening greeting message
 * @returns {boolean} [response.success] - Success indicator (true)
 * @returns {Object} [response.query] - Sanitized query parameters (if provided)
 * 
 * @example
 * // Basic request
 * GET /evening
 * Response: { "message": "Good Evening!" }
 * 
 * @example
 * // Request with name parameter
 * GET /evening?name=Jane
 * Response: { "message": "Good Evening Jane!", "success": true, "query": { "name": "Jane" } }
 * 
 * @example
 * // Request with time parameter
 * GET /evening?time=18:30
 * Response: { "message": "Good Evening!", "success": true, "query": { "time": "18:30" } }
 * 
 * @throws {400} Validation failed - Invalid query parameters
 */
router.get(
  '/evening',
  validateEveningEndpoint,
  handleValidationErrors,
  (req, res) => {
    // Extract validated and sanitized query parameters
    const { name, time } = req.query;
    
    // Build response message based on provided parameters
    let message;
    
    if (name) {
      // Personalized evening greeting
      message = `Good Evening ${name}!`;
    } else {
      // Default evening message
      message = 'Good Evening!';
    }
    
    // Construct response object
    const response = {
      message,
      success: true
    };
    
    // Include sanitized query parameters in response if any were provided
    if (name || time) {
      response.query = {};
      if (name) response.query.name = name;
      if (time) response.query.time = time;
    }
    
    // Send JSON response with 200 OK status
    return res.status(200).json(response);
  }
);

// =============================================================================
// HEALTH CHECK ENDPOINT (Optional - for monitoring)
// =============================================================================

/**
 * GET /health
 * @description Health check endpoint for monitoring and load balancer checks
 *              No validation required - simple status response
 * 
 * @route GET /health
 * @returns {Object} JSON response with health status
 * @returns {string} response.status - Health status ('ok')
 * @returns {number} response.timestamp - Unix timestamp of response
 */
router.get('/health', (req, res) => {
  return res.status(200).json({
    status: 'ok',
    timestamp: Date.now()
  });
});

// =============================================================================
// 404 HANDLER FOR API ROUTES
// =============================================================================

/**
 * Catch-all handler for undefined API routes
 * Returns 404 Not Found with helpful error message
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
router.use((req, res) => {
  return res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    availableEndpoints: [
      'GET /hello',
      'GET /evening',
      'GET /health'
    ]
  });
});

// =============================================================================
// ERROR HANDLER FOR API ROUTES
// =============================================================================

/**
 * Error handling middleware for API routes
 * Catches any unhandled errors and returns a standardized error response
 * 
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
router.use((err, req, res, next) => {
  // Log error for debugging (in production, use proper logging)
  console.error('API Error:', err.message);
  
  // Determine if this is a validation error from express-validator
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      errors: errors.array().map(e => ({
        field: e.path || e.param,
        message: e.msg,
        location: e.location
      }))
    });
  }
  
  // Return generic error response for other errors
  return res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// =============================================================================
// MODULE EXPORTS
// =============================================================================

/**
 * Export the configured Express Router as the default export
 * Use in server.js: app.use('/api', require('./routes/api'))
 * @type {express.Router}
 */
module.exports = router;
