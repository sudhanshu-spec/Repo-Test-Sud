/**
 * Express.js Application Entry Point
 * 
 * This is a Node.js Express server tutorial implementing two GET endpoints:
 * - GET / : Returns "Hello world"
 * - GET /evening : Returns "Good evening"
 * 
 * Security Features:
 * - Helmet.js for security headers (CSP, X-Content-Type-Options, etc.)
 * - CORS middleware for cross-origin resource sharing configuration
 * - Rate limiting to protect against DoS attacks
 * 
 * The server listens on the PORT environment variable or defaults to port 3000.
 * The app instance is exported for testing purposes.
 */

'use strict';

// Import Express web framework
const express = require('express');

// Import security middleware
const helmet = require('helmet');
const cors = require('cors');
const { rateLimit } = require('express-rate-limit');

// Import security configuration
const { helmetOptions, corsOptions, rateLimitOptions } = require('./config/security');

// Create Express application instance
const app = express();

// Define server port from environment or default to 3000
const PORT = process.env.PORT || 3000;

// =============================================================================
// SECURITY MIDDLEWARE CONFIGURATION
// =============================================================================

/**
 * Apply Helmet.js middleware for setting security HTTP headers.
 * This must be applied before any route handlers to ensure all responses
 * include the security headers.
 */
app.use(helmet(helmetOptions));

/**
 * Apply CORS middleware for cross-origin resource sharing.
 * Configures allowed origins, methods, and headers for cross-origin requests.
 */
app.use(cors(corsOptions));

/**
 * Apply rate limiting middleware to protect against brute-force and DoS attacks.
 * Limits the number of requests from a single IP within a time window.
 */
app.use(rateLimit(rateLimitOptions));

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

// Start server only when run directly (not when imported for testing)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export app instance for testing
module.exports = app;
