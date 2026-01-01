/**
 * Express.js Application Entry Point
 * 
 * This is a production-ready Node.js Express server implementing:
 * - GET / : Returns "Hello world"
 * - GET /evening : Returns "Good evening"
 * - GET /health : Health check endpoint for container orchestration
 * 
 * Production Features:
 * - Graceful shutdown handling for SIGTERM/SIGINT signals
 * - Centralized error handling middleware
 * - 404 Not Found handler for undefined routes
 * - Process-level error handlers for uncaught exceptions
 * - Health check endpoint for Kubernetes/Docker health probes
 * 
 * The server listens on the PORT environment variable or defaults to port 3000.
 * The app instance is exported for testing purposes.
 * 
 * @module server
 * @requires express
 */

'use strict';

// Import Express web framework
const express = require('express');

// Create Express application instance
const app = express();

// Define server port from environment or default to 3000
const PORT = process.env.PORT || 3000;

/**
 * Server instance reference for graceful shutdown capability.
 * Captured when the server starts to enable calling server.close() during shutdown.
 * @type {http.Server|null}
 */
let server = null;

/**
 * Flag to prevent multiple simultaneous shutdown attempts.
 * Set to true when graceful shutdown is initiated to prevent duplicate calls.
 * @type {boolean}
 */
let isShuttingDown = false;

// ============================================================================
// Route Handlers
// ============================================================================

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

/**
 * Health check endpoint handler
 * GET /health - Returns JSON status for container orchestration health probes
 * 
 * Used by Kubernetes liveness/readiness probes and Docker health checks.
 * Returns 503 Service Unavailable when server is shutting down to prevent
 * new requests from being routed to this instance.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
app.get('/health', (req, res) => {
  // Return 503 Service Unavailable during shutdown
  if (isShuttingDown) {
    return res.status(503).json({
      status: 'shutting_down',
      message: 'Server is shutting down and not accepting new requests',
      timestamp: new Date().toISOString()
    });
  }
  
  // Return healthy status with timestamp
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// ============================================================================
// Error Handling Middleware
// ============================================================================

/**
 * 404 Not Found handler middleware
 * 
 * Catches all requests that don't match any defined routes.
 * Must be placed AFTER all route definitions but BEFORE the error handler.
 * Returns a consistent JSON error response instead of Express default HTML.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`,
    statusCode: 404
  });
});

/**
 * Centralized error handling middleware
 * 
 * Catches all errors thrown within route handlers and middleware.
 * Per Express.js documentation, error handlers MUST have exactly 4 parameters
 * (err, req, res, next) to be recognized as error-handling middleware.
 * 
 * In development mode, includes stack trace for debugging.
 * In production mode, hides implementation details for security.
 * 
 * @param {Error} err - Error object thrown by route handlers
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function (required for signature)
 */
app.use((err, req, res, next) => {
  // Log error stack trace for debugging
  console.error('Error occurred:', err.stack || err.message || err);
  
  // Determine HTTP status code
  const statusCode = err.status || err.statusCode || 500;
  
  // Build error response
  const errorResponse = {
    error: err.name || 'Internal Server Error',
    message: err.message || 'An unexpected error occurred',
    statusCode: statusCode
  };
  
  // Include stack trace in development mode only
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
  }
  
  // Send JSON error response
  res.status(statusCode).json(errorResponse);
});

// ============================================================================
// Graceful Shutdown Logic
// ============================================================================

/**
 * Graceful shutdown handler with timeout protection
 * 
 * Implements proper shutdown procedure for production environments:
 * 1. Sets shutdown flag to prevent accepting new requests
 * 2. Stops accepting new connections via server.close()
 * 3. Waits for existing requests to complete
 * 4. Forces exit after timeout if shutdown hangs
 * 
 * @param {string} signal - Signal name that triggered shutdown (e.g., 'SIGTERM')
 * @param {number} [timeout=10000] - Maximum time (ms) to wait before forced exit
 */
function gracefulShutdown(signal, timeout = 10000) {
  // Prevent multiple shutdown attempts
  if (isShuttingDown) {
    console.log('Shutdown already in progress...');
    return;
  }
  
  console.log(`\n${signal} signal received: starting graceful shutdown...`);
  isShuttingDown = true;
  
  // Set timeout for forced shutdown if graceful shutdown hangs
  const forceExitTimeout = setTimeout(() => {
    console.error('Graceful shutdown timed out, forcing exit...');
    process.exit(1);
  }, timeout);
  
  // Prevent the timeout from keeping the process alive
  forceExitTimeout.unref();
  
  // Close the server to stop accepting new connections
  if (server) {
    server.close((err) => {
      if (err) {
        console.error('Error during server close:', err);
        clearTimeout(forceExitTimeout);
        process.exit(1);
      }
      
      console.log('HTTP server closed successfully.');
      console.log('Cleanup complete. Exiting process.');
      clearTimeout(forceExitTimeout);
      process.exit(0);
    });
  } else {
    // Server was never started (e.g., during testing)
    console.log('No server instance to close. Exiting process.');
    clearTimeout(forceExitTimeout);
    process.exit(0);
  }
}

// ============================================================================
// Process-Level Error Handlers
// ============================================================================

/**
 * Handler for uncaught synchronous exceptions
 * 
 * Catches errors that escape the Express error handling middleware.
 * Logs the error and exits with code 1 to indicate failure.
 * 
 * WARNING: The application is in an undefined state after an uncaught exception.
 * Restart is required. Use process manager (PM2, Docker, Kubernetes) for auto-restart.
 */
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.stack || err);
  console.error('Application is in an undefined state. Shutting down...');
  process.exit(1);
});

/**
 * Handler for unhandled promise rejections
 * 
 * Catches rejected promises that don't have a .catch() handler.
 * Logs the error and exits with code 1 to indicate failure.
 * 
 * Note: As of Node.js v15+, unhandled rejections terminate the process by default.
 * This handler ensures consistent behavior across Node.js versions.
 */
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise);
  console.error('Reason:', reason);
  console.error('Application shutting down due to unhandled promise rejection...');
  process.exit(1);
});

// ============================================================================
// Signal Handlers for Graceful Shutdown
// ============================================================================

/**
 * SIGTERM handler for container orchestration
 * 
 * SIGTERM is the standard signal sent by:
 * - Kubernetes when terminating a pod
 * - Docker when stopping a container
 * - Process managers (PM2, systemd) during stop/restart
 */
process.on('SIGTERM', () => {
  gracefulShutdown('SIGTERM');
});

/**
 * SIGINT handler for manual interruption
 * 
 * SIGINT is sent when:
 * - User presses Ctrl+C in terminal
 * - IDE stops the running process
 */
process.on('SIGINT', () => {
  gracefulShutdown('SIGINT');
});

// ============================================================================
// Server Startup
// ============================================================================

/**
 * Start server only when run directly (not when imported for testing)
 * 
 * The require.main === module check ensures the server doesn't start
 * automatically when the file is imported by test frameworks like Jest.
 */
if (require.main === module) {
  server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Health check available at http://localhost:${PORT}/health`);
  });
  
  /**
   * Server error handler for startup failures
   * 
   * Handles common server startup errors:
   * - EADDRINUSE: Port already in use
   * - EACCES: Permission denied (ports < 1024 require root on Unix)
   */
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Error: Port ${PORT} is already in use.`);
      console.error('Please choose a different port or stop the other process.');
    } else if (err.code === 'EACCES') {
      console.error(`Error: Permission denied to bind to port ${PORT}.`);
      console.error('Use a port > 1024 or run with elevated privileges.');
    } else {
      console.error('Server startup error:', err);
    }
    process.exit(1);
  });
}

// Export app instance for testing
module.exports = app;
