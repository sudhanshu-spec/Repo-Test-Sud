'use strict';

/**
 * Input Validation Middleware Module
 * 
 * This module provides reusable validation chains and error handling middleware
 * using express-validator for sanitizing and validating HTTP request data.
 * 
 * Exports:
 * - validateIdParam: Validation chain for route ID parameters
 * - validateUserBody: Validation chain for user-related request bodies
 * - validatePaginationQuery: Validation chain for pagination query parameters
 * - handleValidationErrors: Middleware for processing validation results
 * 
 * @module middleware/validators
 */

const { param, body, query, validationResult } = require('express-validator');

/**
 * Validation chain for route ID parameters
 * 
 * Validates that the 'id' route parameter is a positive integer.
 * Sanitizes the value by converting it to an integer type.
 * 
 * Usage: router.get('/users/:id', validateIdParam, handleValidationErrors, controller)
 * 
 * @type {Array} Array of express-validator validation chains
 * @example
 * // Route definition
 * app.get('/users/:id', validateIdParam, handleValidationErrors, (req, res) => {
 *   const userId = req.params.id; // Sanitized integer
 *   // ...
 * });
 */
const validateIdParam = [
  param('id')
    .exists({ checkFalsy: true })
    .withMessage('ID parameter is required')
    .isInt({ min: 1 })
    .withMessage('ID must be a positive integer')
    .toInt()
];

/**
 * Validation chain for user-related request bodies
 * 
 * Validates user data in request body with the following rules:
 * - name: Required, trimmed, 2-50 characters
 * - email: Required, valid email format, normalized
 * 
 * Usage: router.post('/users', validateUserBody, handleValidationErrors, controller)
 * 
 * @type {Array} Array of express-validator validation chains
 * @example
 * // Route definition
 * app.post('/users', validateUserBody, handleValidationErrors, (req, res) => {
 *   const { name, email } = req.body; // Validated and sanitized
 *   // ...
 * });
 */
const validateUserBody = [
  body('name')
    .exists({ checkFalsy: true })
    .withMessage('Name is required')
    .bail()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .escape(),
  body('email')
    .exists({ checkFalsy: true })
    .withMessage('Email is required')
    .bail()
    .isEmail()
    .withMessage('Valid email address is required')
    .normalizeEmail({
      gmail_remove_dots: false,
      gmail_remove_subaddress: false
    })
];

/**
 * Validation chain for pagination query parameters
 * 
 * Validates optional pagination parameters in query string:
 * - page: Optional, positive integer (defaults to 1 if not provided)
 * - limit: Optional, integer between 1-100 (prevents excessive data retrieval)
 * 
 * Both values are sanitized to integers when present.
 * 
 * Usage: router.get('/items', validatePaginationQuery, handleValidationErrors, controller)
 * 
 * @type {Array} Array of express-validator validation chains
 * @example
 * // Route definition
 * app.get('/items', validatePaginationQuery, handleValidationErrors, (req, res) => {
 *   const page = req.query.page || 1;
 *   const limit = req.query.limit || 10;
 *   // ...
 * });
 */
const validatePaginationQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be an integer between 1 and 100')
    .toInt()
];

/**
 * Middleware for handling validation errors
 * 
 * Checks for validation errors from previous validation chains and returns
 * a 400 Bad Request response with structured error details if validation fails.
 * If validation passes, proceeds to the next middleware.
 * 
 * Response format on validation failure:
 * {
 *   success: false,
 *   error: 'Validation failed',
 *   errors: [
 *     { field: 'fieldName', message: 'Error description' },
 *     ...
 *   ]
 * }
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void|Object} Returns JSON error response or calls next()
 * @example
 * // Usage with validation chain
 * app.post('/users', validateUserBody, handleValidationErrors, (req, res) => {
 *   // This only executes if validation passes
 *   res.json({ success: true, data: req.body });
 * });
 */
function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    // Extract and format validation errors
    const formattedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg
    }));
    
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      errors: formattedErrors
    });
  }
  
  // Validation passed, proceed to next middleware
  next();
}

// Export validation chains and error handler
module.exports = {
  validateIdParam,
  validateUserBody,
  validatePaginationQuery,
  handleValidationErrors
};
