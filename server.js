/**
 * Express.js Application Entry Point
 * 
 * A production-ready Node.js Express server implementing:
 * 
 * Endpoints:
 * - GET /        : Returns "Hello world"
 * - GET /evening : Returns "Good evening"
 * - GET /health  : Returns JSON health status for monitoring/load balancer integration
 * 
 * Middleware Stack (in order):
 * - helmet      : Security HTTP headers (CSP, X-Content-Type-Options, X-Frame-Options, etc.)
 * - compression : Gzip/deflate response compression for reduced bandwidth
 * - cors        : Cross-Origin Resource Sharing for API consumers
 * - morgan      : HTTP request logging (combined format in production, dev format in development)
 * 
 * Environment Configuration:
 * - PORT     : Server listening port (default: 3000)
 * - NODE_ENV : Application environment (development/production)
 * 
 * The server listens on the PORT environment variable or defaults to port 3000.
 * The app instance is exported for testing purposes.
 */

'use strict';

// Load environment variables from .env file FIRST (before any env access)
require('dotenv').config();

// Import Express web framework
const express = require('express');

// Import production middleware
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const compression = require('compression');

// Create Express application instance
const app = express();

// Define server port from environment or default to 3000
const PORT = process.env.PORT || 3000;

/**
 * Middleware Configuration
 * 
 * The middleware stack is configured in a specific order for optimal security and performance:
 * 1. helmet()      - Security headers applied first before any response is sent
 * 2. compression() - Compress responses early for performance benefits
 * 3. cors()        - Handle CORS preflight and cross-origin requests before route processing
 * 4. morgan()      - Log requests after security middleware, using environment-aware format
 */

// Security middleware - sets various HTTP headers for protection against common vulnerabilities
app.use(helmet());

// Compression middleware - gzip/deflate compression reduces response sizes by up to 70%
app.use(compression());

// CORS middleware - enables controlled cross-origin requests for API consumers
app.use(cors());

// Request logging middleware - 'combined' for production (Apache-style), 'dev' for development
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

/**
 * Health check endpoint handler
 * GET /health - Returns JSON health status for monitoring and load balancer integration
 * 
 * Response includes:
 * - status: Current health status ('healthy')
 * - timestamp: ISO 8601 formatted current time
 * - uptime: Process uptime in seconds
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

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
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

// Export app instance for testing
module.exports = app;
