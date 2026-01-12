/**
 * @fileoverview Input Validation and Sanitization Middleware Module
 * @description Provides express-validator based validation chains for request sanitization,
 *              XSS prevention, and SQL injection protection. Exports reusable validation
 *              middleware for the /hello and /evening endpoints.
 * @module middleware/validators
 * @requires express-validator
 */

const { body, param, query, validationResult } = require('express-validator');

// =============================================================================
// COMMON VALIDATION PATTERNS
// =============================================================================

/**
 * Regular expression patterns for detecting potential security threats
 * @private
 */
const SECURITY_PATTERNS = {
  // Pattern to detect SQL injection attempts
  sqlInjection: /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|EXEC|EXECUTE)\b)|(--)|(;)|(')|(")/gi,
  // Pattern to detect script tags and common XSS payloads
  xssPayload: /<script\b[^>]*>[\s\S]*?<\/script>|javascript:|on\w+\s*=/gi,
  // Pattern for path traversal attempts
  pathTraversal: /\.\.\//g
};

/**
 * Custom validator to check for SQL injection patterns
 * @param {string} value - The value to validate
 * @returns {boolean} True if value is safe, throws error if injection detected
 * @throws {Error} If SQL injection pattern is detected
 */
const checkSqlInjection = (value) => {
  if (value && typeof value === 'string') {
    // Reset lastIndex to ensure consistent matching with global flag
    SECURITY_PATTERNS.sqlInjection.lastIndex = 0;
    if (SECURITY_PATTERNS.sqlInjection.test(value)) {
      throw new Error('Potentially malicious input detected');
    }
  }
  return true;
};

/**
 * Custom validator to check for XSS payload patterns
 * @param {string} value - The value to validate
 * @returns {boolean} True if value is safe, throws error if XSS detected
 * @throws {Error} If XSS payload pattern is detected
 */
const checkXssPayload = (value) => {
  if (value && typeof value === 'string') {
    // Reset lastIndex to ensure consistent matching with global flag
    SECURITY_PATTERNS.xssPayload.lastIndex = 0;
    if (SECURITY_PATTERNS.xssPayload.test(value)) {
      throw new Error('Invalid characters in input');
    }
  }
  return true;
};

/**
 * Custom validator to check for path traversal attempts
 * @param {string} value - The value to validate
 * @returns {boolean} True if value is safe, throws error if path traversal detected
 * @throws {Error} If path traversal pattern is detected
 */
const checkPathTraversal = (value) => {
  if (value && typeof value === 'string') {
    // Reset lastIndex to ensure consistent matching with global flag
    SECURITY_PATTERNS.pathTraversal.lastIndex = 0;
    if (SECURITY_PATTERNS.pathTraversal.test(value)) {
      throw new Error('Invalid path characters detected');
    }
  }
  return true;
};

// =============================================================================
// REUSABLE VALIDATION CHAINS
// =============================================================================

/**
 * Creates a sanitized string validation chain for a given field
 * Applies trim and escape for basic string sanitization
 * @param {string} fieldName - Name of the field to validate
 * @param {string} location - Location of the field ('body', 'query', or 'param')
 * @returns {ValidationChain} Express-validator validation chain
 */
const createSanitizedString = (fieldName, location = 'query') => {
  const validators = { body, query, param };
  const validator = validators[location] || query;
  
  return validator(fieldName)
    .optional()
    .trim()
    .escape()
    .custom(checkSqlInjection)
    .custom(checkXssPayload)
    .custom(checkPathTraversal);
};

/**
 * Creates a required non-empty string validation chain
 * @param {string} fieldName - Name of the field to validate
 * @param {string} location - Location of the field ('body', 'query', or 'param')
 * @returns {ValidationChain} Express-validator validation chain
 */
const createRequiredString = (fieldName, location = 'query') => {
  const validators = { body, query, param };
  const validator = validators[location] || query;
  
  return validator(fieldName)
    .notEmpty()
    .withMessage(`${fieldName} is required`)
    .trim()
    .escape()
    .custom(checkSqlInjection)
    .custom(checkXssPayload);
};

/**
 * Creates an alphanumeric validation chain
 * @param {string} fieldName - Name of the field to validate
 * @param {string} location - Location of the field ('body', 'query', or 'param')
 * @returns {ValidationChain} Express-validator validation chain
 */
const createAlphanumericString = (fieldName, location = 'query') => {
  const validators = { body, query, param };
  const validator = validators[location] || query;
  
  return validator(fieldName)
    .optional()
    .trim()
    .escape()
    .isAlphanumeric()
    .withMessage(`${fieldName} must be alphanumeric`)
    .custom(checkSqlInjection);
};

// =============================================================================
// ENDPOINT-SPECIFIC VALIDATORS
// =============================================================================

/**
 * Validation chain array for the /hello endpoint
 * Validates optional query parameters: name, greeting
 * - Sanitizes all string inputs
 * - Prevents XSS attacks via escape()
 * - Rejects SQL injection patterns
 * @type {ValidationChain[]}
 */
const validateHelloEndpoint = [
  // Validate optional 'name' query parameter
  query('name')
    .optional()
    .trim()
    .escape()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters')
    .isAlphanumeric('en-US', { ignore: ' -' })
    .withMessage('Name must contain only letters, numbers, spaces, or hyphens')
    .custom(checkSqlInjection)
    .custom(checkXssPayload),
  
  // Validate optional 'greeting' query parameter
  query('greeting')
    .optional()
    .trim()
    .escape()
    .isLength({ max: 200 })
    .withMessage('Greeting must not exceed 200 characters')
    .custom(checkSqlInjection)
    .custom(checkXssPayload)
];

/**
 * Validation chain array for the /evening endpoint
 * Validates optional query parameters: name, time
 * - Sanitizes all string inputs
 * - Prevents XSS attacks via escape()
 * - Rejects SQL injection patterns
 * @type {ValidationChain[]}
 */
const validateEveningEndpoint = [
  // Validate optional 'name' query parameter
  query('name')
    .optional()
    .trim()
    .escape()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters')
    .isAlphanumeric('en-US', { ignore: ' -' })
    .withMessage('Name must contain only letters, numbers, spaces, or hyphens')
    .custom(checkSqlInjection)
    .custom(checkXssPayload),
  
  // Validate optional 'time' query parameter
  query('time')
    .optional()
    .trim()
    .escape()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Time must be in HH:MM format (24-hour)')
    .custom(checkSqlInjection)
];

// =============================================================================
// VALIDATION RESULT HANDLER MIDDLEWARE
// =============================================================================

/**
 * Middleware function to handle validation errors
 * Checks for validation errors from express-validator chains
 * Returns 400 Bad Request with error details if validation fails
 * Calls next() to proceed if validation passes
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object|void} JSON error response or calls next()
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    // Log validation errors for security monitoring (non-sensitive details only)
    const errorMessages = errors.array().map(err => ({
      field: err.path || err.param,
      message: err.msg,
      location: err.location
    }));
    
    // Return 400 Bad Request with validation errors
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      errors: errorMessages
    });
  }
  
  // Validation passed, proceed to next middleware/handler
  next();
};

// =============================================================================
// BODY VALIDATION CHAINS (for POST/PUT requests)
// =============================================================================

/**
 * Validation chain for body 'message' field
 * Used for POST requests that accept a message in the request body
 * @type {ValidationChain}
 */
const validateBodyMessage = body('message')
  .optional()
  .trim()
  .escape()
  .notEmpty()
  .withMessage('Message cannot be empty if provided')
  .isLength({ max: 500 })
  .withMessage('Message must not exceed 500 characters')
  .custom(checkSqlInjection)
  .custom(checkXssPayload);

/**
 * Validation chain for body 'data' field
 * Used for POST requests that accept generic data
 * @type {ValidationChain}
 */
const validateBodyData = body('data')
  .optional()
  .trim()
  .escape()
  .custom(checkSqlInjection)
  .custom(checkXssPayload)
  .custom(checkPathTraversal);

// =============================================================================
// EXPORTS
// =============================================================================

module.exports = {
  // Endpoint-specific validators
  validateHelloEndpoint,
  validateEveningEndpoint,
  
  // Validation result handler
  handleValidationErrors,
  
  // Reusable validation chain creators
  createSanitizedString,
  createRequiredString,
  createAlphanumericString,
  
  // Body validators
  validateBodyMessage,
  validateBodyData,
  
  // Custom validators for advanced use cases
  checkSqlInjection,
  checkXssPayload,
  checkPathTraversal
};
