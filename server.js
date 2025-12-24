/**
 * Express.js Application Entry Point with Security Middleware
 * 
 * This is a production-hardened Node.js Express server implementing comprehensive
 * security features including:
 * - Security headers (Helmet.js)
 * - CORS policy enforcement
 * - Rate limiting protection
 * - Input validation infrastructure
 * - Centralized error handling
 * 
 * Endpoints:
 * - GET / : Returns "Hello world"
 * - GET /evening : Returns "Good evening"
 * 
 * The server listens on the PORT environment variable or defaults to port 3000.
 * The app instance is exported for testing purposes.
 * 
 * @module server
 */

'use strict';

// =============================================================================
// ENVIRONMENT CONFIGURATION
// =============================================================================

// Load environment variables from .env file first (before any other imports)
require('dotenv').config();

// =============================================================================
// EXTERNAL DEPENDENCIES
// =============================================================================

// Import Express web framework
const express = require('express');

// Import security middleware packages
const helmet = require('helmet');
const cors = require('cors');
const { rateLimit } = require('express-rate-limit');

// =============================================================================
// INTERNAL DEPENDENCIES
// =============================================================================

// Import security configuration options
const { helmetOptions, corsOptions, rateLimitOptions } = require('./config/security');

// Import error handling middleware
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Import validation utilities (available for route-level validation)
const { handleValidationErrors } = require('./middleware/validators');

// =============================================================================
// APPLICATION INITIALIZATION
// =============================================================================

// Create Express application instance
const app = express();

// Define server port from environment or default to 3000
const PORT = process.env.PORT || 3000;

// =============================================================================
// SECURITY MIDDLEWARE STACK
// =============================================================================
// CRITICAL: Middleware order is important for proper security enforcement.
// Security headers must be set first, then CORS, then rate limiting,
// then body parsers, and finally routes and error handlers.

/**
 * Helmet.js Security Headers Middleware
 * Sets various HTTP headers to protect against common web vulnerabilities:
 * - Content-Security-Policy
 * - Cross-Origin-Opener-Policy
 * - Cross-Origin-Resource-Policy
 * - X-DNS-Prefetch-Control
 * - X-Frame-Options
 * - Strict-Transport-Security
 * - X-Content-Type-Options
 * - Referrer-Policy
 * - Removes X-Powered-By header
 */
app.use(helmet(helmetOptions));

/**
 * CORS (Cross-Origin Resource Sharing) Middleware
 * Controls which origins can access the API:
 * - Configurable allowed origins via CORS_ORIGIN environment variable
 * - Supports single origin, multiple comma-separated origins, or wildcard
 * - Sets appropriate CORS headers for preflight requests
 */
app.use(cors(corsOptions));

/**
 * Rate Limiting Middleware
 * Protects against brute-force and DoS attacks:
 * - Default: 100 requests per 15-minute window
 * - Configurable via RATE_LIMIT_WINDOW and RATE_LIMIT_MAX environment variables
 * - Returns 429 Too Many Requests when limit exceeded
 * - Includes modern RateLimit-* headers (draft-8 specification)
 */
app.use(rateLimit(rateLimitOptions));

// =============================================================================
// BODY PARSING MIDDLEWARE
// =============================================================================

/**
 * JSON Body Parser Middleware
 * Parses incoming requests with JSON payloads.
 * Populates req.body with the parsed JSON object.
 */
app.use(express.json());

/**
 * URL-Encoded Body Parser Middleware
 * Parses incoming requests with URL-encoded payloads.
 * Extended mode allows rich objects and arrays to be encoded.
 */
app.use(express.urlencoded({ extended: true }));

// =============================================================================
// ROUTE HANDLERS
// =============================================================================

/**
 * Root endpoint handler
 * GET / - Returns "Hello world" as plain text response
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
app.get('/', (req, res) => {
  res.send('Hello world');
});

/**
 * Evening endpoint handler
 * GET /evening - Returns "Good evening" as plain text response
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
app.get('/evening', (req, res) => {
  res.send('Good evening');
});

// =============================================================================
// ERROR HANDLING MIDDLEWARE
// =============================================================================
// NOTE: Error handlers must be registered AFTER all routes.
// Order: notFoundHandler (catches 404s) -> errorHandler (catches all errors)

/**
 * 404 Not Found Handler
 * Catches requests to undefined routes and returns structured 404 response.
 * Must be registered after all route handlers.
 */
app.use(notFoundHandler);

/**
 * Centralized Error Handler
 * Catches and processes all errors thrown by route handlers and middleware:
 * - Validation errors (400 Bad Request)
 * - Rate limit errors (429 Too Many Requests)
 * - General errors (500 Internal Server Error)
 * 
 * Must be the LAST middleware registered.
 */
app.use(errorHandler);

// =============================================================================
// SERVER INITIALIZATION
// =============================================================================

// Start server only when run directly (not when imported for testing)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Security middleware enabled: helmet, cors, rate-limit`);
  });
}

// =============================================================================
// MODULE EXPORT
// =============================================================================

// Export app instance for testing
module.exports = app;
