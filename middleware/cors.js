/**
 * @fileoverview CORS Middleware Module
 * 
 * This module creates and exports a configured CORS (Cross-Origin Resource Sharing)
 * middleware for Express.js applications. It handles cross-origin requests by:
 * - Validating request origins against a configurable whitelist
 * - Setting appropriate Access-Control-* response headers
 * - Handling preflight OPTIONS requests
 * - Supporting credentials for authenticated requests
 * 
 * Configuration is centralized in config/security.js and supports environment
 * variable overrides via CORS_ALLOWED_ORIGINS for flexibility across
 * different deployment environments.
 * 
 * @module middleware/cors
 * @see https://www.npmjs.com/package/cors
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
 * @see config/security.js
 */

'use strict';

/**
 * Import the cors middleware factory from the cors npm package.
 * The cors package provides a Connect/Express middleware that can be used
 * to enable CORS with various configuration options.
 * 
 * @external cors
 * @see https://www.npmjs.com/package/cors
 */
const cors = require('cors');

/**
 * Import the CORS configuration from the centralized security configuration module.
 * This configuration includes:
 * - origin: Dynamic origin validation function with whitelist support
 * - methods: Allowed HTTP methods (GET, POST, OPTIONS)
 * - optionsSuccessStatus: Status code for successful preflight requests
 * - allowedHeaders: Headers clients can use in requests
 * - credentials: Whether to include credentials in CORS requests
 * - maxAge: Preflight response cache duration
 * - exposedHeaders: Headers exposed to client-side JavaScript
 * 
 * @see module:config/security
 */
const { corsConfig } = require('../config/security');

/**
 * Configured CORS Middleware
 * 
 * Creates an Express middleware function that handles Cross-Origin Resource Sharing
 * (CORS) requests. This middleware:
 * 
 * 1. **Origin Validation**: Validates incoming request origins against a whitelist
 *    configured via CORS_ALLOWED_ORIGINS environment variable (defaults to localhost).
 *    Uses corsConfig.origin function for dynamic validation.
 * 
 * 2. **Preflight Handling**: Responds to OPTIONS preflight requests with appropriate
 *    headers, allowing browsers to determine if the actual request is safe.
 *    Uses corsConfig.optionsSuccessStatus (200) for legacy browser compatibility.
 * 
 * 3. **Method Restrictions**: Only allows specified HTTP methods from corsConfig.methods
 *    (GET, POST, OPTIONS by default).
 * 
 * 4. **Header Control**: Specifies which headers can be used in requests via
 *    corsConfig.allowedHeaders (Content-Type, Authorization, X-Requested-With, etc.).
 * 
 * 5. **Credentials Support**: Enables credentials (cookies, authorization headers)
 *    in cross-origin requests when corsConfig.credentials is true.
 * 
 * 6. **Preflight Caching**: Allows browsers to cache preflight results for
 *    corsConfig.maxAge seconds (86400 = 24 hours) to improve performance.
 * 
 * @type {Function}
 * @function corsMiddleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 * 
 * @example
 * // Import and use in Express application
 * const corsMiddleware = require('./middleware/cors');
 * const express = require('express');
 * 
 * const app = express();
 * 
 * // Apply CORS middleware to all routes
 * app.use(corsMiddleware);
 * 
 * @example
 * // Apply CORS middleware to specific routes only
 * const corsMiddleware = require('./middleware/cors');
 * const express = require('express');
 * 
 * const app = express();
 * 
 * // Only apply CORS to API routes
 * app.use('/api', corsMiddleware);
 * 
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
 * @see https://developer.mozilla.org/en-US/docs/Glossary/Preflight_request
 */
const corsMiddleware = cors({
  /**
   * Origin validation configuration
   * Uses the dynamic origin function from corsConfig that:
   * - Parses CORS_ALLOWED_ORIGINS environment variable
   * - Defaults to ['http://localhost:3000'] if not set
   * - Allows requests with no origin (same-origin, curl, Postman)
   * - Returns error for non-whitelisted origins
   */
  origin: corsConfig.origin,

  /**
   * Allowed HTTP methods for cross-origin requests
   * Default: ['GET', 'POST', 'OPTIONS']
   * - GET: Retrieve resources
   * - POST: Create/submit data
   * - OPTIONS: Preflight requests
   */
  methods: corsConfig.methods,

  /**
   * Status code for successful OPTIONS preflight requests
   * Using 200 instead of 204 for legacy browser compatibility
   * Some legacy browsers (IE11, older SmartTVs) fail on 204 responses
   */
  optionsSuccessStatus: corsConfig.optionsSuccessStatus,

  /**
   * Headers that clients are allowed to include in cross-origin requests
   * Default: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
   */
  allowedHeaders: corsConfig.allowedHeaders,

  /**
   * Whether to include credentials (cookies, authorization headers)
   * in cross-origin requests. Required for authenticated API calls.
   * Note: When credentials is true, origin cannot be '*'
   */
  credentials: corsConfig.credentials,

  /**
   * How long (in seconds) browsers can cache the preflight response
   * Default: 86400 seconds (24 hours)
   * Reduces the number of preflight requests for better performance
   */
  maxAge: corsConfig.maxAge
});

/**
 * Export the configured CORS middleware as the default export.
 * This allows flexible import syntax:
 * 
 * CommonJS: const corsMiddleware = require('./middleware/cors');
 * ES Modules: import corsMiddleware from './middleware/cors';
 */
module.exports = corsMiddleware;

/**
 * Named export for explicit import syntax if preferred.
 * 
 * CommonJS: const { corsMiddleware } = require('./middleware/cors');
 * ES Modules: import { corsMiddleware } from './middleware/cors';
 */
module.exports.corsMiddleware = corsMiddleware;
