'use strict';

/**
 * Centralized Error Handling Middleware Module
 * 
 * This module provides a unified error handling system for the Express.js security stack.
 * It categorizes and formats errors based on type:
 * - ValidationError: Returns 400 Bad Request with field-specific error details
 * - RateLimitError: Returns 429 Too Many Requests with retry guidance
 * - General Errors: Returns 500 Internal Server Error with safe error messages
 * 
 * In production, sensitive error details (stack traces) are hidden from clients.
 * 
 * @module middleware/errorHandler
 */

/**
 * Custom error class for validation failures.
 * Used when input validation fails (e.g., invalid parameters, malformed request body).
 * 
 * @class ValidationError
 * @extends Error
 * @property {string} name - Error name identifier ('ValidationError')
 * @property {number} statusCode - HTTP status code (400)
 * @property {Array} errors - Array of validation error details
 * 
 * @example
 * throw new ValidationError('Invalid input', [
 *   { field: 'email', message: 'Invalid email format' }
 * ]);
 */
class ValidationError extends Error {
  /**
   * Creates a new ValidationError instance.
   * 
   * @param {string} message - Human-readable error message
   * @param {Array} [errors=[]] - Array of field-specific validation errors
   */
  constructor(message, errors = []) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
    this.errors = errors;
    
    // Maintains proper stack trace for where error was thrown (V8 engines)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ValidationError);
    }
  }
}

/**
 * Custom error class for rate limit exceeded scenarios.
 * Used when a client exceeds the allowed number of requests within a time window.
 * 
 * @class RateLimitError
 * @extends Error
 * @property {string} name - Error name identifier ('RateLimitError')
 * @property {number} statusCode - HTTP status code (429)
 * @property {number|null} retryAfter - Seconds until rate limit resets (can be set externally)
 * 
 * @example
 * const error = new RateLimitError();
 * error.retryAfter = 900; // 15 minutes
 * throw error;
 */
class RateLimitError extends Error {
  /**
   * Creates a new RateLimitError instance.
   * 
   * @param {string} [message='Too many requests, please try again later'] - Human-readable error message
   */
  constructor(message = 'Too many requests, please try again later') {
    super(message);
    this.name = 'RateLimitError';
    this.statusCode = 429;
    this.retryAfter = null;
    
    // Maintains proper stack trace for where error was thrown (V8 engines)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, RateLimitError);
    }
  }
}

/**
 * Centralized error handler middleware for Express.js applications.
 * 
 * This middleware should be registered LAST in the middleware chain (after all routes).
 * It categorizes errors and returns appropriate JSON responses:
 * - Validation errors (400): Field-specific error details
 * - Rate limit errors (429): Retry guidance with optional retryAfter header
 * - General errors (500): Safe error message (hides stack trace in production)
 * 
 * @function errorHandler
 * @param {Error} err - The error object caught by Express
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 * 
 * @example
 * // Register as the last middleware in Express app
 * app.use(errorHandler);
 */
function errorHandler(err, req, res, next) {
  // If response headers already sent, delegate to default Express error handler
  if (res.headersSent) {
    return next(err);
  }

  // Handle Validation Errors (400 Bad Request)
  // Check for custom ValidationError class or errors with validation array
  if (err.name === 'ValidationError' || (err.errors && Array.isArray(err.errors))) {
    return res.status(400).json({
      success: false,
      error: 'Bad Request',
      message: 'Validation failed',
      errors: err.errors || []
    });
  }

  // Handle Rate Limit Errors (429 Too Many Requests)
  // Check for statusCode 429 or custom RateLimitError class
  if (err.statusCode === 429 || err.name === 'RateLimitError') {
    // Set Retry-After header if available
    if (err.retryAfter) {
      res.set('Retry-After', String(err.retryAfter));
    }
    
    return res.status(429).json({
      success: false,
      error: 'Too Many Requests',
      message: err.message || 'Rate limit exceeded. Please try again later.',
      retryAfter: err.retryAfter || null
    });
  }

  // Handle General Errors (500 Internal Server Error or custom status)
  // Default fallback for unexpected errors
  const statusCode = err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Log error details for server-side debugging
  // In production, this helps with debugging without exposing details to clients
  if (statusCode >= 500) {
    console.error(`[Error] ${new Date().toISOString()} - ${err.name}: ${err.message}`);
    if (!isProduction) {
      console.error(err.stack);
    }
  }

  // Build response object
  const response = {
    success: false,
    error: statusCode === 500 ? 'Internal Server Error' : 'Error',
    message: isProduction ? 'An unexpected error occurred' : err.message
  };

  // Include stack trace only in non-production environments
  if (!isProduction && err.stack) {
    response.stack = err.stack;
  }

  return res.status(statusCode).json(response);
}

/**
 * Handler for 404 Not Found errors.
 * 
 * This middleware should be registered AFTER all route handlers but BEFORE
 * the main errorHandler. It catches requests to undefined routes and returns
 * a structured 404 response.
 * 
 * @function notFoundHandler
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function (unused)
 * @returns {void}
 * 
 * @example
 * // Register after all routes, before errorHandler
 * app.use(notFoundHandler);
 * app.use(errorHandler);
 */
function notFoundHandler(req, res, next) {
  return res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`
  });
}

// Export all error handling components
module.exports = {
  errorHandler,
  notFoundHandler,
  ValidationError,
  RateLimitError
};
